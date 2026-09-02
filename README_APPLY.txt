MIRRORTRACE FINAL CAMBRIA UI + TRACEBOT
======================================

Replace exactly:

src/styles/mirrortrace-app.css
src/styles/mirrortrace-public.css
src/components/PublicGuideBot.tsx
src/main.tsx

Requested values:

Cambria on all user and public text.

Heading:
28px

Subheading:
24px

Body:
18px

Footer / utility:
20px

User dashboard background blue:
rgba(16,41,75,0.20)

This is the same blue tint as the final sign-in cards.

Memory Governance:
outer / heading / major panels = rgba(0,0,0,0.82)
deep inner / KPI panels = rgba(0,0,0,0.90)

Reflective Space:
outer = 0.82
inner = 0.90

Lighter brown action buttons:
rgba(92,78,73,0.96)

Admin:
untouched

MirrorRoom:
untouched by the user-page typography and blue-background selectors

TraceBot:
- fixed on public page
- improved intent matching
- answers "How is this different from ChatGPT?" correctly
- no em dash characters
- avoids Oxford-comma style punctuation in its prepared answers
- app-only guide
- no extra Gemini call

Run:

Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then:
Ctrl + Shift + R
