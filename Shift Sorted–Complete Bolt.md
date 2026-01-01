# Shift Sorted – Complete Bolt.new Build Prompts (MVP – All Phases)

**Project Name**: Shift Sorted  
**Purpose**: SaaS platform that automatically matches available, skilled, and nearby workers to variable shifts in service industries (moving companies, cleaning services, catering, event staffing), with proactive replacement on cancellations.  
**Current Date Reference**: December 31, 2025  
**Target MVP Tech Stack**:
- Frontend: Next.js 16 (App Router)
- Backend & Database: Supabase (Auth, PostgreSQL + Realtime, PostGIS for geo features)
- Deployment: Netlify (with CI/CD)
- Design Style: Sleek modern — minimalist, generous whitespace, bold typography, dark mode toggle, subtle micro-interactions, mobile-first responsive design

**Bolt.new Workflow Guidelines**
- Paste **one phase prompt at a time** into Bolt.new's chat interface.
- After each phase finishes generating, review the preview and code.
- Make small refinements with targeted follow-up prompts if needed (examples below).
- Then paste the next phase prompt (most start with “Continuing from previous work…”).
- Use descriptive, self-contained language — Bolt.new performs best with clear, step-by-step instructions.

**Common Refinement Prompts (use anytime)**
- "Fix the [specific issue] in the geo-query / form / realtime subscription"
- "Make the [component] more accessible (ARIA labels, keyboard focus, contrast)"
- "Add loading skeletons / spinners to the shift list and matching results"
- "Persist dark mode using localStorage and respect system preference"
- "Optimize images with Next.js <Image> component and lazy loading"
- "Add error boundary and global toast notifications for errors"



```text

## Phase 1 – Project Setup & Basic Structure
Build a new Next.js 16 project called Shift Sorted, a SaaS web app for automated shift matching in service industries (moving companies, cleaning services, catering, event staffing). Use the App Router. Set up Supabase integration for authentication and database. Prepare the project for easy Netlify deployment. Make the app SEO-friendly: use SSG/ISR for static/marketing pages, set up proper metadata (title, description, open graph). Enable GEO support by activating PostGIS in Supabase for future location-based features. Apply a sleek, modern design throughout: minimalist layout with generous whitespace, bold sans-serif typography, dark mode toggle (persisted via localStorage), subtle micro-interactions (hover scale, button feedback), and fully mobile-first responsive design. Create the following initial pages/screens:

- Homepage (public): hero section explaining the problem (Sunday night staffing scramble) and solution (automatic matching & replacements), call-to-action buttons for “Get Started” and “Login”
- Login page
- Signup page
- Protected dashboard skeleton (with sidebar navigation and main content placeholder)


## Phase 2 – Authentication & User Roles

Continuing from previous work, implement complete user authentication in Shift Sorted using Supabase Auth. Support two primary roles: "manager" (business owners who create/post shifts) and "worker" (part-time staff who browse and claim shifts). Include:

- Signup form (email + password, role selection dropdown)
- Login form
- Password reset flow
- Simple profile page where users can update their role (if not set), add skills (for workers, as tags/multiselect), and set a default location (city or coordinates)

Protect routes: redirect unauthenticated users to login; show full manager dashboard only to managers; show worker-specific views only to workers. Style all forms and buttons consistently with the sleek modern design (clean inputs, animated submit buttons, clear error/success states). Add basic SEO meta tags to public auth pages.


## Phase 3 – Database Schema & Realtime Foundation
Continuing from previous work, set up the Supabase database schema for Shift Sorted. Create and configure the following tables:

- users
  - id (uuid)
  - email (text)
  - role (text: "manager" | "worker")
  - skills (text[] — array of skill strings, e.g. {"forklift","heavy lifting"})
  - location (geography(POINT) — PostGIS enabled)
  - created_at (timestamptz)

- shifts
  - id (uuid)
  - manager_id (uuid → users.id)
  - title (text)
  - description (text)
  - required_skills (text[])
  - location (geography(POINT))
  - start_time (timestamptz)
  - end_time (timestamptz)
  - status (text: "open" | "claimed" | "completed" | "cancelled")
  - created_at (timestamptz)

- shift_claims
  - id (uuid)
  - shift_id (uuid → shifts.id)
  - worker_id (uuid → users.id)
  - claimed_at (timestamptz)

Enable Row Level Security (RLS) policies:
- Managers can only read/write their own shifts
- Workers can read open shifts and insert claims on open shifts
- Users can read their own profile

Set up realtime subscriptions on shifts and shift_claims tables so the frontend can react live to new claims, cancellations, etc. Create basic CRUD helper functions in Next.js using the Supabase client. Insert and test a sample shift + claim to verify everything works.

## Phase 4 – Job Posting & Core Auto-Matching

Continuing from previous work, build the job posting and auto-matching core for Shift Sorted.

For managers:
- Create a “Post Shift” form page with fields: title, description, required skills (tags/multiselect), location (address input → geocode to lat/long or map picker), start & end datetime
- On submit, save to Supabase and (optionally) add a basic event to the manager’s Google Calendar

For viewing shifts:
- On the manager dashboard, show list of their shifts with status
- For each open shift, display auto-matched worker suggestions: query workers who
  - have matching skills (array overlap)
  - are available (no overlapping claimed shifts in time window)
  - are nearby (PostGIS ST_DWithin or distance sort, default 50 km radius)
- Sort suggestions by proximity + skill match strength

For workers:
- Create a mobile-friendly “Available Shifts” list showing nearby open shifts (geo-filtered)
- Include “Claim” button that creates a shift_claims record and updates shift status to “claimed”

Use modern card-based UI for shifts and suggestion lists. Ensure the experience is responsive and polished.

##Phase 5 – Auto-Replacement Logic & Notifications

Continuing from previous work, implement proactive auto-replacement and notifications in Shift Sorted.

When a shift claim is cancelled/deleted (detect via realtime subscription on shift_claims):
- Immediately re-run the matching query for that shift
- Select top 3–5 replacement candidates (proximity + skills)
- Notify the manager via Slack (webhook integration — allow workspace connection in settings)
- Send fallback email to suggested workers (use Supabase edge function or client-side trigger if simpler)

Update manager dashboard to show real-time coverage status (e.g. green check / red warning per shift).  
Use PostGIS bounding-box or radius queries to ensure nearby prioritization.  
Add UI feedback: loading spinners during matching, success/error toasts, subtle animations on claim/cancel actions.

## Phase 6 – Full Dashboards (Manager + Worker)

Continuing from previous work, create polished dashboards for both user types in Shift Sorted.

Manager Dashboard:
- Calendar + list view of all their shifts
- Key stats: fill rate (%), average time-to-fill, active workers this month
- Coverage indicators (green/red per shift or day)
- Quick actions: post new shift, view suggestions for unfilled shifts

Worker Dashboard:
- List of nearby open shifts (geo-sorted, with distance shown)
- “My Claims” section showing upcoming claimed shifts
- Quick profile edit (skills, location)

Use a charting library (Recharts or similar) for simple visuals (e.g. fill-rate trend).  
Ensure full dark mode support, responsive layouts (desktop + mobile), and dynamic SEO metadata where applicable.

## Phase 7 – Integrations, Billing, Final Polish & Deployment Prep

Continuing from previous work, complete the Shift Sorted MVP:

- Finish Google Calendar integration: two-way sync (post shift → calendar event; claim → block time)
- Complete Slack notifications: settings page to connect workspace + test message
- Add Stripe subscription billing: $30–50 per active worker per month (count unique workers with claims in last 30 days)
- SEO enhancements: generate sitemap.xml, robots.txt, use ISR on public pages, add JobPosting structured data where relevant
- GEO polish: add optional Leaflet/OpenStreetMap display for shift locations and worker suggestions
- Performance & accessibility: aim for <3s loads, add ARIA labels, keyboard navigation, image alt text
- Final touches: 404 page, basic onboarding tour/tooltips, confirm dark mode persistence
- Prepare for Netlify: ensure environment variables are documented, CI/CD ready

At this point the app should be beta-ready for early customer testing.