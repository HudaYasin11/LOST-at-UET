# LOST@UET

A gamified campus exploration web app for the University of Engineering and Technology, Lahore.

Explore campus, scan QR codes at physical locations, unlock discoveries, earn XP, complete quests, and track your progress as a UET Explorer.

## Live Site

https://lost-at-uet.vercel.app

## Features

- User authentication with email verification via Supabase Auth
- QR code scanning to unlock campus locations
- XP and leveling system
- Quest tracking with riddle-based clues
- Discoveries page showing unlocked locations
- Interactive illustrated campus map
- Societies directory with search and category filters
- FAQ page with searchable questions
- User profiles with progress tracking
- Leaderboard
- Day and dusk visual modes
- Ambient animation layer for the campus illustration

## Tech Stack

**Frontend**
- HTML, CSS, vanilla JavaScript (ES modules)
- Leaflet for the interactive campus map
- html5-qrcode for QR scanning
- Font Awesome icons
- Google Fonts (Press Start 2P, VT323, Inter)

**Backend and Services**
- Supabase (Postgres database, authentication, edge functions)
- Supabase Auth with Send Email Hook for custom verification emails
- Gmail SMTP configured as the rate-limit unlock
- Vercel for hosting


## Setup

### Prerequisites

- A Supabase project
- A Gmail account with 2-Step Verification enabled
- A Vercel account for deployment (optional)

### Supabase Configuration

1. Create a new Supabase project at https://supabase.com

2. Create the following database tables:

**profiles**
id uuid primary key references auth.users(id)
name text
xp integer default 0
level integer default 1
created_at timestamp default now()

text

**discoveries**
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users(id)
location_id text
created_at timestamp default now()

text

**quest_completions**
id uuid primary key default gen_random_uuid()
user_id uuid references auth.users(id)
quest_id text
completed_at timestamp default now()

text

3. Enable Row Level Security on all tables and add policies allowing users to read and write only their own rows.

4. Add a trigger to create a profile row automatically when a new user signs up.

5. Configure authentication:
   - Go to Authentication, then Providers, then Email
   - Turn Confirm email ON
   - Go to Authentication, then Emails, then SMTP Settings
   - Enable Custom SMTP with Gmail:
     - Host: smtp.gmail.com
     - Port: 587
     - Username: your Gmail address
     - Password: a Gmail App Password (not your regular password)
     - Sender email: your Gmail address
     - Sender name: LOST@UET

6. Deploy the Send Email Hook:
   - Go to Edge Functions and deploy a new function named send-auth-email
   - Add the secret SEND_EMAIL_HOOK_SECRET with the webhook secret from the Auth Hooks page
   - Go to Authentication, then Auth Hooks, and enable the Send Email Hook pointing to this function URL
   - Turn Verify JWT OFF for this function

Credits
Created by Huda Yasin and Hamda Sami, CS 2025 batch, UET Lahore.




