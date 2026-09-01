# MirrorTrace — Next Features Pack

This pack deliberately separates **safe standalone additions** from changes that should not be made blind against your current live notification backend.

## Important discovery

Your current `JournalList.tsx` ALREADY implements:

- keyword search against reflection content
- keyword matching against topic tags
- tag filtering
- approved-snapshot filtering

So the original “Search + Filter” item is mostly finished already.

The only obvious missing part from the proposed feature card is **date-range filtering**.

The included `JournalHistoryFilters.tsx` adds:

- keyword search
- topic dropdown
- from-date
- to-date
- clear filters
- a reusable `journalEntryMatchesFilters()` helper

No Gemini call and no new Firestore query are required.

## Files

### `src/components/JournalHistoryFilters.tsx`

Full filter UI + pure filtering helper.

To integrate it into the current JournalList:

1. Import:
   `JournalHistoryFilters`, `journalEntryMatchesFilters`, and `JournalHistoryFilterState`.
2. Replace separate `searchTerm` / `selectedTag` state with one `filters` state, or keep your current state and map it into the component.
3. Build `availableTags` from the existing `allTags`.
4. Apply `journalEntryMatchesFilters(entry, filters)` inside your existing `filteredEntries` filter.
5. Render the component where the current Search card is.

Because your current JournalList already contains working snapshot/diff/delete logic, do NOT replace the entire file just to add a date filter.

### `src/components/YearInReflection.tsx`

A standalone factual annual summary.

It uses existing:
- JournalEntry[]
- ThoughtSnapshot[]
- ThoughtDiff[]

It computes:
- reflection count
- approved snapshot count
- Thought Diff count
- most active month
- most revisited topic

No new AI inference.

Recommended integration later:
render it inside DashboardOverview with the same `entries`, `snapshots`, and `diffs` props already available there.

### `scripts/productionVerify.ts`

Automated non-destructive checks for:
- required files
- `.env` ignore
- Firebase/Gemini env configuration
- `/api/health`

Run with:

`npx tsx scripts/productionVerify.ts`

## Daily reminder

Do NOT paste a new scheduler implementation yet.

Your repository already contains:
- notificationService.ts
- notificationRoutes.ts
- emailService.ts
- perspectiveWatchProcessor.ts
- PushNotificationSettings.tsx

The daily reminder must reuse the exact existing opt-in fields and exact push/email functions. A separate implementation that guesses those collection names or preference fields can accidentally send notifications to users who did not opt in.

Before implementing the daily reminder, use the current authoritative contents of:

- server/notificationService.ts
- server/emailService.ts
- server/perspectiveWatchProcessor.ts
- server/notificationRoutes.ts
- src/components/PushNotificationSettings.tsx

Then add one daily processor using those exact functions.

## Recommended order now

1. Date range addition to existing Journal History filters
2. Run lint + build
3. Production verification
4. Daily reminder after exact notification APIs are confirmed
5. Year in Reflection
6. Calendar/timeline only if everything above is stable

## Verification

`npm run lint`

`npm run build`

`npm run dev`

`npx tsx scripts/productionVerify.ts`
