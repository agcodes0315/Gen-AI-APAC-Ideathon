MIRRORTRACE THOUGHT SNAPSHOT — BLACK 0.82 FINAL
================================================

Replace exactly:
src/components/ThoughtSnapshotCard.tsx

What changed:
- Entire snapshot card uses black-tinted rgba(0,0,0,0.82) theme.
- Cream / white surfaces are removed.
- Major inner block sections are solid black-tinted panels.
- Body text is reduced by 1.5px from the current component values.
- Subheading-sized text is reduced by 1px.
- Memory retention control is changed from a boxed dropdown to a full-width
  horizontal retention layer.
- Existing approval logic, edit flow, retention values, retry behavior,
  API calls and consent logic are unchanged.

Retention options preserved:
- Until I remove it
- 30 days
- 6 months
- 1 year

Run:
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev

Then hard refresh:
Ctrl + Shift + R
