# Supabase Web App

A modern React + Vite starter project with Supabase authentication included.

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Your Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create a new account or sign in
- Create a new project
- Copy your **Project URL** and **Anon Key** from Settings → API

### 3. Configure Environment Variables
Update `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

- ✅ User authentication (sign up, sign in, sign out)
- ✅ Supabase integration
- ✅ Modern React + Vite setup
- ✅ Responsive design

## Project Structure

```
src/
├── components/
│   ├── Auth.jsx       # Authentication form
│   └── Welcome.jsx    # Welcome page for logged-in users
├── App.jsx            # Main app component
├── supabaseClient.js  # Supabase client initialization
├── main.jsx           # Entry point
├── App.css
└── index.css
```

## Next Steps

1. **Enable Email Auth** in Supabase:
   - Go to Authentication → Providers
   - Enable "Email" provider

2. **Create a Database Table** (optional):
   - Go to SQL Editor → New Query
   - Create your first table

3. **Query Data** from your app:
   ```javascript
   const { data, error } = await supabase
     .from('your_table')
     .select('*')
   ```

## Build for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
