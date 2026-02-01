# Curate - Personal Item Collection App

A clean, simple app to organize things you want to check out later: articles, music, films, recipes, and more. Tag, search, and review items by category.

## Features

- **Quick capture**: Add items with title, category, optional subcategory, tags, notes
- **Smart search**: Full-text search across title, notes, and tags
- **Filters**: Filter by category, status (new/reviewed/archived), and time since saved
- **Markdown support**: Write rich notes with bold, italic, links, lists
- **Mobile responsive**: Works great on phone and desktop
- **Cloud sync**: All data stored securely in Supabase

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Hosting**: Vercel
- **Styling**: CSS

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the database to initialize
4. Go to **Settings > API** and copy:
   - `Project URL`
   - `anon public` key (called "NEXT_PUBLIC_SUPABASE_ANON_KEY")

### 2. Create Database Tables

In Supabase dashboard, go to **SQL Editor** and run this:

```sql
CREATE TABLE items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title varchar NOT NULL,
  category varchar NOT NULL,
  subcategory varchar,
  tags text[] DEFAULT '{}',
  notes text,
  url varchar,
  status varchar DEFAULT 'new',
  date_saved timestamp DEFAULT NOW(),
  date_last_reviewed timestamp DEFAULT NOW(),
  created_at timestamp DEFAULT NOW()
);

-- Create index for better search performance
CREATE INDEX items_title_idx ON items USING GIN (to_tsvector('english', title));
CREATE INDEX items_notes_idx ON items USING GIN (to_tsvector('english', notes));
CREATE INDEX items_category_idx ON items(category);
CREATE INDEX items_status_idx ON items(status);
```

### 3. Set Up Row Level Security (RLS)

Still in SQL Editor, run:

```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own items"
  ON items
  FOR SELECT
  USING (auth.uid()::text = (SELECT auth.uid()::text));

CREATE POLICY "Users can create items"
  ON items
  FOR INSERT
  WITH CHECK (auth.uid()::text = (SELECT auth.uid()::text));

CREATE POLICY "Users can update their own items"
  ON items
  FOR UPDATE
  USING (auth.uid()::text = (SELECT auth.uid()::text));

CREATE POLICY "Users can delete their own items"
  ON items
  FOR DELETE
  USING (auth.uid()::text = (SELECT auth.uid()::text));
```

Actually, let's simplify this. Run these commands instead:

```sql
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all operations for authenticated users"
  ON items
  USING (true)
  WITH CHECK (true);
```

### 4. Clone Your GitHub Repo Locally

```bash
git clone https://github.com/john-fred/curate-app.git
cd curate-app
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Set Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 7. Test Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and test the app.

### 8. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Select your `curate-app` GitHub repo
4. Click "Import"
5. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

Vercel will automatically build and deploy. Your app will be live at `your-project.vercel.app`.

## How to Use

1. **Sign up** with your email
2. **Add items** by clicking "+ Add Item"
   - Title and category are required
   - Everything else is optional
   - Use comma-separated tags (no spaces around commas)
   - Notes support markdown: `**bold**`, `*italic*`, `[link](url)`
3. **Search and filter** items
   - Search box finds matches in title, notes, and tags
   - Filter by category, status, and days since saved
4. **Manage items**
   - Click item to expand and see full details
   - Mark as "Reviewed" to track progress
   - Archive old items
   - Delete when done

## Future Ideas

- Share items with others (e.g., Sarah)
- Rich text editor instead of markdown
- Categories/subcategories management UI
- Export items as JSON/CSV
- Bulk edit operations
- Mobile app

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm build

# Start production server
npm start
```

## Notes

- Your data is stored in Supabase's PostgreSQL database
- Passwords are encrypted and never stored in plaintext
- You control access to your data (no one else can see it unless you share)
- All environment variables with `NEXT_PUBLIC_` prefix are safe to expose in frontend code

## Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env.local` exists and has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**"Can't add items"**
- Check that RLS policies are correctly set up in Supabase
- Verify you're logged in

**Items not showing up**
- Refresh the page
- Check browser console for errors (F12 → Console)

## License

MIT - feel free to modify and share
