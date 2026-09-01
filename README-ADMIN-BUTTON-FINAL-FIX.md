# MirrorTrace Admin Button Final Fix

Replace exactly these two files:

```text
src/App.tsx
src/components/AdminPanelLauncher.tsx
```

Why this fixes the missing button:

`App.tsx` already knows the authenticated Firebase user. The admin launcher now
receives `user.email` directly:

```tsx
<AdminPanelLauncher userEmail={user?.email ?? null} />
```

It no longer performs its own Firebase-auth timing check and does not wait for
`/api/admin/overview` before rendering the button.

The launcher is rendered only for:

```text
agrimalko@gmail.com
```

The existing server-side role checks must remain in place.

The original admin translucent-black stylesheet is restored:

```ts
import '../styles/mirrortrace-admin-translucent-black.css';
```

No admin-dashboard visual redesign is included.

After replacing:

```powershell
Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue
npm run dev
```

Hard refresh with Ctrl+Shift+R.
