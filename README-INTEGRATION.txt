MirrorTrace User Dashboard Black 30% UI
==============================================

What this changes
-----------------
- Makes the large "Your thinking, versioned." hero a black 30% translucent panel.
- Applies the same black 30% outer-card treatment to the authenticated user dashboard.
- Keeps inner sections slightly lighter and softly hazy.
- Keeps the existing shared branch background visible.
- Does NOT add/change images.
- Does NOT change layout, data, navigation, auth, admin logic, or behavior.
- Does NOT modify the sign-in page.

File
----
src/styles/mirrortrace-user-dashboard-black30.css

Integration
-----------
Import this stylesheet LAST in the authenticated user dashboard component
(or in the authenticated app shell after your existing dashboard styles):

import '../styles/mirrortrace-user-dashboard-black30.css';

If DashboardOverview.tsx is in src/components, that relative path is correct.

Important
---------
Do not delete your existing CSS yet. This stylesheet is intentionally
an override layer and should be imported last for the authenticated user dashboard.
