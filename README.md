# LOST@UET

A gamified campus exploration web app for the University of Engineering and Technology, Lahore.

Explore campus, scan QR codes at physical locations, unlock discoveries, earn XP, complete quests, and track your progress as a UET Explorer.

## Live Site

https://lost-at-uet.vercel.app

## Features

- User authentication with email verification via Supabase Auth
- QR code scanning to unlock campus locations
- XP and leveling system
- Quest tracking and completions
- Discoveries page showing unlocked locations
- Interactive campus map
- Societies directory
- FAQ page with searchable questions
- User profiles with progress tracking
- Leaderboard

## Tech Stack

**Frontend**
- HTML, CSS, vanilla JavaScript (ES modules)
- Font Awesome icons
- Google Fonts (Press Start 2P, VT323, Inter)
- html5-qrcode for QR scanning

**Backend and Services**
- Supabase (Postgres database, authentication, edge functions)
- Supabase Auth with Send Email Hook for custom verification emails
- Keplars API for transactional email delivery through Gmail OAuth
- Vercel for hosting

## Project Structure
