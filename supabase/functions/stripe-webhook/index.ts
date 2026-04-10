// Supabase Edge Function — Stripe Webhook Handler
// Deploy with: npx supabase functions deploy stripe-webhook
//
// Required secrets (set via Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_SECRET_KEY    — your Stripe secret key (sk_live_... or sk_test_...)
//   STRIPE_WEBHOOK_SECRET — your Stripe webhook signing secret (whsec_...)
//   SUPABASE_URL         — your Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY — service role key (not anon key!)

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 })

  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, Deno.env.get('STRIPE_WEBHOOK_SECRET')!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const updateSubscription = async (customerId: string, status: string, plan?: string, endDate?: string) => {
    await supabase.from('profiles').update({
      stripe_customer_id:    customerId,
      subscription_status:   status,
      subscription_plan:     plan ?? null,
      subscription_end_date: endDate ?? null,
      updated_at:            new Date().toISOString(),
    }).eq('stripe_customer_id', customerId)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break

      const userId     = session.client_reference_id  // we pass user UUID here
      const customerId = session.customer as string

      if (userId) {
        // Link Stripe customer to Supabase user
        await supabase.from('profiles').update({
          stripe_customer_id:  customerId,
          subscription_status: 'active',
          updated_at:          new Date().toISOString(),
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      const plan = sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly'
      const endDate = new Date(sub.current_period_end * 1000).toISOString()
      await updateSubscription(sub.customer as string, sub.status === 'active' ? 'active' : sub.status, plan, endDate)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await updateSubscription(sub.customer as string, 'canceled')
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await updateSubscription(invoice.customer as string, 'past_due')
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
