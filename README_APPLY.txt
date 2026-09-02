MIRRORTRACE — PUBLIC BLUE CARDS + TRACEBOT
=========================================

DIRECT FILES ONLY. NO INSTALLER SCRIPT.

Replace/add exactly:

ADD:
  src/components/PublicGuideBot.tsx

REPLACE:
  src/main.tsx
  src/styles/mirrortrace-public.css
  src/styles/mirrortrace-app.css

WHAT CHANGED

1. Sign-in/public cards:
   The previous requested blue tint was rgba(16,41,75,0.70).
   "Decrease the tint by 0.5" is applied as opacity 0.70 - 0.50 = 0.20.

   Final public card tint:
     rgba(16,41,75,0.20)

   This now explicitly targets:
   - both feature-card rows
   - Who-it-is-for cards
   - the FOUR Security cards (.mt-glass / .mt-glass-cool)
   - public review cards
   - the empty "No public reviews yet" card
   - older bg-black/30 and bg-black/50 public cards

2. TraceBot:
   - fixed bottom-right on the sign-in/public page
   - stays fixed while the user scrolls
   - animated slogan:
       "Hi, wanna know more about the application?"
   - cute robot launcher
   - expands into a chat panel
   - answers only about MirrorTrace
   - navigation
   - Journal History
   - Reflect & Chat
   - privacy/security
   - Thought Snapshots
   - Thought Diffs
   - provenance
   - Memory Governance
   - Perspective Watch
   - MirrorRoom
   - Support
   - Feedback
   - Admin privacy boundary
   - Gemini brainstorm
   - no API call / no additional Gemini cost
   - disappears automatically after sign-in

3. Authenticated app CSS:
   mirrortrace-app.css is carried forward unchanged from the previous final CSS package.

4. Admin:
   untouched.

RUN

Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then:
Ctrl + Shift + R
