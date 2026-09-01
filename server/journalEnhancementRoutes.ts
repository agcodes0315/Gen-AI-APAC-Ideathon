import { Router } from 'express';
import { getAuth } from 'firebase-admin/auth';

import {
  authMiddleware,
  type AuthenticatedRequest,
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';

import { sendPushToUser } from './notificationService.ts';
import { sendMirrorTraceEmail } from './emailService.ts';

export const journalEnhancementRouter = Router();

const text = (v: unknown, n = 5000) =>
  typeof v === 'string' ? v.trim().slice(0, n) : '';

const tags = (v: unknown): string[] =>
  Array.isArray(v)
    ? Array.from(new Set(v.map((x) => text(x, 60).toLowerCase().replace(/[^a-z0-9_-]/g, '')).filter(Boolean))).slice(0, 12)
    : [];

const now = () => new Date().toISOString();
const userCol = (uid: string, name: string) =>
  firestore.collection('users').doc(uid).collection(name);

async function ownedJournal(uid: string, journalId: string) {
  const ref = userCol(uid, 'journals').doc(journalId);
  const snap = await ref.get();
  if (!snap.exists) {
    const error = new Error('Journal entry not found.') as Error & { status?: number };
    error.status = 404;
    throw error;
  }
  return { ref, data: snap.data() || {} };
}

async function invalidateDerived(
  uid: string,
  journalId: string,
  batch: FirebaseFirestore.WriteBatch
) {
  const [snaps, de, dl, pe, pl] = await Promise.all([
    userCol(uid, 'thoughtSnapshots').where('sourceJournalId', '==', journalId).get(),
    userCol(uid, 'thoughtDiffs').where('earlierJournalId', '==', journalId).get(),
    userCol(uid, 'thoughtDiffs').where('laterJournalId', '==', journalId).get(),
    userCol(uid, 'provenance').where('earlierJournalId', '==', journalId).get(),
    userCol(uid, 'provenance').where('laterJournalId', '==', journalId).get(),
  ]);

  const diffIds = new Set<string>();
  snaps.docs.forEach((d) => batch.delete(d.ref));
  [...de.docs, ...dl.docs].forEach((d) => {
    diffIds.add(d.id);
    batch.delete(d.ref);
  });
  [...pe.docs, ...pl.docs].forEach((d) => batch.delete(d.ref));

  diffIds.forEach((diffId) => {
    batch.delete(userCol(uid, 'perspectiveWatches').doc(diffId));
    batch.delete(firestore.collection('perspectiveWatchQueue').doc(`${uid}_${diffId}`));
  });

  return {
    snapshotsDeleted: snaps.size,
    diffsDeleted: diffIds.size,
    provenanceDeleted: pe.size + pl.size,
  };
}

/* Favorites */
journalEnhancementRouter.get('/api/journal-enhancements/favorites', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const s = await userCol(uid, 'journalFavorites').limit(100).get();
  res.json({ favorites: s.docs.map((d) => ({ id: d.id, ...d.data() })) });
});

journalEnhancementRouter.put('/api/journal-enhancements/favorites/:journalId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const journalId = text(req.params.journalId, 200);
    await ownedJournal(uid, journalId);
    await userCol(uid, 'journalFavorites').doc(journalId).set({
      id: journalId, journalId, createdAt: now(), serverUpdatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    res.json({ success: true });
  } catch (e) {
    res.status((e as any).status || 500).json({ error: (e as Error).message });
  }
});

journalEnhancementRouter.delete('/api/journal-enhancements/favorites/:journalId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  await userCol(req.user!.uid, 'journalFavorites').doc(text(req.params.journalId, 200)).delete();
  res.json({ success: true });
});

/* Provenance-aware editing + versions */
journalEnhancementRouter.patch('/api/journal-enhancements/journal/:journalId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const journalId = text(req.params.journalId, 200);
    const content = text(req.body?.content, 50000);
    const topicTags = tags(req.body?.topicTags);
    if (!content) return res.status(400).json({ error: 'Journal content cannot be empty.' });

    const { ref, data } = await ownedJournal(uid, journalId);
    const linked = await userCol(uid, 'thoughtSnapshots').where('sourceJournalId', '==', journalId).limit(1).get();

    if (!linked.empty && req.body?.confirmInvalidateDerived !== true) {
      return res.status(409).json({
        error: 'derived_memory_exists',
        code: 'DERIVED_MEMORY_EXISTS',
        message: 'Editing this reflection requires invalidating its derived AI memory, Thought Diffs, provenance and watches.',
      });
    }

    const batch = firestore.batch();
    const versionRef = userCol(uid, 'journalVersions').doc();
    const editedAt = now();

    batch.set(versionRef, {
      id: versionRef.id,
      journalId,
      previousContent: text(data.content, 50000),
      previousTopicTags: Array.isArray(data.topicTags) ? data.topicTags : [],
      previousUpdatedAt: text(data.updatedAt, 100),
      createdAt: editedAt,
      serverCreatedAt: FieldValue.serverTimestamp(),
    });

    let invalidated = { snapshotsDeleted: 0, diffsDeleted: 0, provenanceDeleted: 0 };
    if (!linked.empty) invalidated = await invalidateDerived(uid, journalId, batch);

    batch.update(ref, {
      content,
      topicTags,
      updatedAt: editedAt,
      snapshotId: null,
      serverUpdatedAt: FieldValue.serverTimestamp(),
    });

    await batch.commit();
    res.json({
      success: true,
      journal: {
        id: journalId,
        content,
        topicTags,
        createdAt: text(data.createdAt, 100),
        updatedAt: editedAt,
        snapshotId: null,
      },
      invalidated,
    });
  } catch (e) {
    res.status((e as any).status || 500).json({ error: (e as Error).message });
  }
});

journalEnhancementRouter.get('/api/journal-enhancements/journal/:journalId/versions', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const journalId = text(req.params.journalId, 200);
  await ownedJournal(uid, journalId);
  const s = await userCol(uid, 'journalVersions').where('journalId', '==', journalId).limit(100).get();
  const versions = s.docs.map((d) => ({ id: d.id, ...d.data() }))
    .sort((a: any, b: any) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  res.json({ versions });
});

/* Daily reminder preferences */
journalEnhancementRouter.get('/api/journal-enhancements/daily-reminder', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const snap = await userCol(req.user!.uid, 'preferences').doc('dailyReflectionReminder').get();
  res.json({
    preference: snap.exists ? snap.data() : {
      enabled: false,
      timezone: 'UTC',
      hour: 19,
      pushEnabled: true,
      emailEnabled: false,
    },
  });
});

journalEnhancementRouter.put('/api/journal-enhancements/daily-reminder', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const timezone = text(req.body?.timezone, 120) || 'UTC';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
  } catch {
    return res.status(400).json({ error: 'Invalid timezone.' });
  }

  const rawHour = Number(req.body?.hour);
  const payload = {
    enabled: req.body?.enabled === true,
    timezone,
    hour: Number.isInteger(rawHour) ? Math.max(0, Math.min(23, rawHour)) : 19,
    pushEnabled: req.body?.pushEnabled !== false,
    emailEnabled: req.body?.emailEnabled === true,
    updatedAt: now(),
    serverUpdatedAt: FieldValue.serverTimestamp(),
  };

  const batch = firestore.batch();
  batch.set(userCol(uid, 'preferences').doc('dailyReflectionReminder'), payload, { merge: true });
  batch.set(firestore.collection('dailyReminderQueue').doc(uid), { uid, ...payload }, { merge: true });
  await batch.commit();
  res.json({ success: true, preference: payload });
});

/* Revisit bookmarks */
journalEnhancementRouter.get('/api/journal-enhancements/revisit', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const s = await userCol(req.user!.uid, 'revisitBookmarks').orderBy('revisitAt', 'asc').limit(100).get();
  res.json({ bookmarks: s.docs.map((d) => ({ id: d.id, ...d.data() })) });
});

journalEnhancementRouter.post('/api/journal-enhancements/revisit', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const uid = req.user!.uid;
    const journalId = text(req.body?.journalId, 200);
    await ownedJournal(uid, journalId);
    const date = new Date(text(req.body?.revisitAt, 100));
    if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      return res.status(400).json({ error: 'revisitAt must be in the future.' });
    }

    const ref = userCol(uid, 'revisitBookmarks').doc();
    const payload = {
      id: ref.id,
      journalId,
      revisitAt: date.toISOString(),
      status: 'scheduled',
      pushEnabled: req.body?.pushEnabled !== false,
      emailEnabled: req.body?.emailEnabled === true,
      createdAt: now(),
      serverCreatedAt: FieldValue.serverTimestamp(),
    };

    const batch = firestore.batch();
    batch.set(ref, payload);
    batch.set(firestore.collection('revisitBookmarkQueue').doc(`${uid}_${ref.id}`), {
      uid,
      bookmarkId: ref.id,
      journalId,
      revisitAt: payload.revisitAt,
      status: 'scheduled',
      pushEnabled: payload.pushEnabled,
      emailEnabled: payload.emailEnabled,
      serverUpdatedAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();

    res.status(201).json({ success: true, bookmark: payload });
  } catch (e) {
    res.status((e as any).status || 500).json({ error: (e as Error).message });
  }
});

journalEnhancementRouter.delete('/api/journal-enhancements/revisit/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const id = text(req.params.id, 200);
  const batch = firestore.batch();
  batch.delete(userCol(uid, 'revisitBookmarks').doc(id));
  batch.delete(firestore.collection('revisitBookmarkQueue').doc(`${uid}_${id}`));
  await batch.commit();
  res.json({ success: true });
});

/* Decision Ledger */
journalEnhancementRouter.get('/api/journal-enhancements/decisions', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const s = await userCol(req.user!.uid, 'decisionLedger').orderBy('createdAt', 'desc').limit(100).get();
  res.json({ decisions: s.docs.map((d) => ({ id: d.id, ...d.data() })) });
});

journalEnhancementRouter.post('/api/journal-enhancements/decisions', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const title = text(req.body?.title, 220);
  const decision = text(req.body?.decision, 5000);
  const reasoning = text(req.body?.reasoning, 10000);
  const journalId = text(req.body?.journalId, 200);
  if (!title || !decision) return res.status(400).json({ error: 'Title and decision are required.' });
  if (journalId) await ownedJournal(uid, journalId);
  const ref = userCol(uid, 'decisionLedger').doc();
  const item = {
    id: ref.id, title, decision, reasoning, journalId: journalId || null,
    status: 'active', createdAt: now(), updatedAt: now(), serverUpdatedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(item);
  res.status(201).json({ success: true, decision: item });
});

/* Reflection Chains */
journalEnhancementRouter.get('/api/journal-enhancements/chains', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const s = await userCol(req.user!.uid, 'reflectionChains').orderBy('createdAt', 'desc').limit(100).get();
  res.json({ chains: s.docs.map((d) => ({ id: d.id, ...d.data() })) });
});

journalEnhancementRouter.post('/api/journal-enhancements/chains', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const title = text(req.body?.title, 220);
  const journalIds: string[] = Array.isArray(req.body?.journalIds)
    ? Array.from(new Set(req.body.journalIds.map((v: unknown) => text(v, 200)).filter(Boolean))).slice(0, 25)
    : [];
  if (!title || journalIds.length < 2) return res.status(400).json({ error: 'A chain needs a title and at least two reflections.' });
  for (const id of journalIds) await ownedJournal(uid, id);
  const ref = userCol(uid, 'reflectionChains').doc();
  const chain = { id: ref.id, title, journalIds, createdAt: now(), updatedAt: now(), serverUpdatedAt: FieldValue.serverTimestamp() };
  await ref.set(chain);
  res.status(201).json({ success: true, chain });
});

/* Assumption Tracker */
journalEnhancementRouter.get('/api/journal-enhancements/assumptions', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const s = await userCol(req.user!.uid, 'assumptionTracker').orderBy('createdAt', 'desc').limit(100).get();
  res.json({ assumptions: s.docs.map((d) => ({ id: d.id, ...d.data() })) });
});

journalEnhancementRouter.post('/api/journal-enhancements/assumptions', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const statement = text(req.body?.statement, 5000);
  const journalId = text(req.body?.journalId, 200);
  if (!statement) return res.status(400).json({ error: 'Assumption is required.' });
  if (journalId) await ownedJournal(uid, journalId);
  const ref = userCol(uid, 'assumptionTracker').doc();
  const item = {
    id: ref.id, statement, journalId: journalId || null,
    status: 'open', outcome: null, createdAt: now(), updatedAt: now(),
    serverUpdatedAt: FieldValue.serverTimestamp(),
  };
  await ref.set(item);
  res.status(201).json({ success: true, assumption: item });
});

journalEnhancementRouter.patch('/api/journal-enhancements/assumptions/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const status = text(req.body?.status, 50);
  if (!['open','supported','challenged','invalidated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid assumption status.' });
  }
  const ref = userCol(uid, 'assumptionTracker').doc(text(req.params.id, 200));
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'Assumption not found.' });
  await ref.update({
    status,
    outcome: text(req.body?.outcome, 5000) || null,
    updatedAt: now(),
    serverUpdatedAt: FieldValue.serverTimestamp(),
  });
  res.json({ success: true });
});

/* Weekly Review: factual, no AI */
journalEnhancementRouter.get('/api/journal-enhancements/weekly-review', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const s = await userCol(uid, 'journals').orderBy('createdAt', 'desc').limit(100).get();
  const entries = s.docs.map((d) => ({ id: d.id, ...d.data() })).filter((e: any) => {
    const t = new Date(String(e.createdAt || '')).getTime();
    return Number.isFinite(t) && t >= since;
  });

  const counts = new Map<string, number>();
  let wordCount = 0;
  for (const e of entries as any[]) {
    wordCount += text(e.content, 50000).split(/\s+/).filter(Boolean).length;
    for (const tag of Array.isArray(e.topicTags) ? e.topicTags : []) {
      const clean = text(tag, 60);
      if (clean) counts.set(clean, (counts.get(clean) || 0) + 1);
    }
  }

  const topTags = [...counts.entries()].sort((a,b) => b[1]-a[1]).slice(0,5).map(([tag,count]) => ({ tag, count }));
  res.json({
    review: {
      periodStart: new Date(since).toISOString(),
      periodEnd: now(),
      reflectionCount: entries.length,
      wordCount,
      topTags,
      entryIds: entries.map((e: any) => String(e.id)),
    },
  });
});

/* Personal Knowledge Graph: factual links only */
journalEnhancementRouter.get('/api/journal-enhancements/knowledge-graph', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const [journals, chains, decisions, assumptions] = await Promise.all([
    userCol(uid,'journals').limit(100).get(),
    userCol(uid,'reflectionChains').limit(100).get(),
    userCol(uid,'decisionLedger').limit(100).get(),
    userCol(uid,'assumptionTracker').limit(100).get(),
  ]);

  const nodes: any[] = [];
  const edges: any[] = [];

  journals.docs.forEach((d) => {
    const x = d.data();
    nodes.push({ id:`journal:${d.id}`, type:'journal', label:text(x.content,90) || 'Reflection', journalId:d.id, tags:Array.isArray(x.topicTags) ? x.topicTags : [] });
  });

  chains.docs.forEach((d) => {
    const x = d.data();
    nodes.push({ id:`chain:${d.id}`, type:'chain', label:text(x.title,120) || 'Reflection chain' });
    (Array.isArray(x.journalIds) ? x.journalIds : []).forEach((j:string) => edges.push({ source:`chain:${d.id}`, target:`journal:${j}`, type:'contains' }));
  });

  decisions.docs.forEach((d) => {
    const x = d.data();
    nodes.push({ id:`decision:${d.id}`, type:'decision', label:text(x.title,120) || 'Decision' });
    if (typeof x.journalId === 'string' && x.journalId) edges.push({ source:`decision:${d.id}`, target:`journal:${x.journalId}`, type:'supported_by' });
  });

  assumptions.docs.forEach((d) => {
    const x = d.data();
    nodes.push({ id:`assumption:${d.id}`, type:'assumption', label:text(x.statement,120) || 'Assumption', status:text(x.status,50) });
    if (typeof x.journalId === 'string' && x.journalId) edges.push({ source:`assumption:${d.id}`, target:`journal:${x.journalId}`, type:'derived_from' });
  });

  res.json({ graph: { nodes, edges } });
});

/* Export all owner-bound journal data */
journalEnhancementRouter.get('/api/journal-enhancements/export', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const uid = req.user!.uid;
  const names = [
    'journals','journalFavorites','journalVersions','revisitBookmarks',
    'decisionLedger','reflectionChains','assumptionTracker',
    'thoughtSnapshots','thoughtDiffs','provenance','perspectiveWatches',
  ];
  const data: Record<string, unknown[]> = {};
  for (const name of names) {
    const s = await userCol(uid, name).limit(500).get();
    data[name] = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  res.json({ exportVersion: 2, exportedAt: now(), data });
});

function localParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', hourCycle:'h23',
  }).formatToParts(date);
  const m = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { dateKey:`${m.year}-${m.month}-${m.day}`, hour:Number(m.hour) };
}

async function emailFor(uid: string) {
  try {
    return (await getAuth().getUser(uid)).email || null;
  } catch {
    return null;
  }
}

/* Hourly scheduler: daily reminders + revisit bookmarks */
journalEnhancementRouter.post('/api/internal/process-journal-enhancements', async (req, res) => {
  const expected = text(process.env.MIRRORTRACE_SCHEDULER_SECRET, 1000);
  if (!expected) return res.status(503).json({ error:'scheduler_not_configured' });
  const provided = text(req.header('x-mirrortrace-scheduler-secret') || req.body?.secret, 1000);
  if (provided !== expected) return res.status(403).json({ error:'forbidden' });

  const stats = { dailyChecked:0, dailySent:0, revisitChecked:0, revisitSent:0, errors:0 };
  const current = new Date();

  const daily = await firestore.collection('dailyReminderQueue').where('enabled','==',true).limit(500).get();
  for (const doc of daily.docs) {
    stats.dailyChecked++;
    try {
      const d = doc.data();
      const uid = text(d.uid,200);
      const timezone = text(d.timezone,120) || 'UTC';
      const lp = localParts(current, timezone);
      if (lp.hour !== Number(d.hour) || text(d.lastSentDateKey,20) === lp.dateKey) continue;

      const latest = await userCol(uid,'journals').orderBy('createdAt','desc').limit(1).get();
      let reflected = false;
      if (!latest.empty) {
        const created = new Date(text(latest.docs[0].data().createdAt,100));
        if (!Number.isNaN(created.getTime())) reflected = localParts(created, timezone).dateKey === lp.dateKey;
      }
      if (reflected) continue;

      if (d.pushEnabled !== false) {
        await sendPushToUser({
          uid,
          title:'MirrorTrace · Daily Reflection',
          body:'You haven’t reflected today.',
          url:process.env.MIRRORTRACE_APP_URL || '/',
          tag:`daily-reflection-${lp.dateKey}`,
          type:'daily_reflection_reminder',
        });
      }

      if (d.emailEnabled === true) {
        const email = await emailFor(uid);
        if (email) {
          await sendMirrorTraceEmail({
            to:email,
            subject:'MirrorTrace · Daily Reflection',
            text:[
              'You haven’t reflected today.',
              '',
              'Open MirrorTrace whenever you are ready.',
              '',
              process.env.MIRRORTRACE_APP_URL || 'http://localhost:3000',
              '',
              'This reminder never includes private journal text.',
            ].join('\n'),
          });
        }
      }

      await doc.ref.set({ lastSentDateKey:lp.dateKey, lastSentAt:now(), serverUpdatedAt:FieldValue.serverTimestamp() }, { merge:true });
      stats.dailySent++;
    } catch (e) {
      stats.errors++;
      console.error('[JournalEnhancements] daily reminder failed', e);
    }
  }

  const revisits = await firestore.collection('revisitBookmarkQueue').where('status','==','scheduled').limit(500).get();
  for (const doc of revisits.docs) {
    stats.revisitChecked++;
    try {
      const d = doc.data();
      const due = new Date(text(d.revisitAt,100));
      if (Number.isNaN(due.getTime()) || due > current) continue;

      const uid = text(d.uid,200);
      const bookmarkId = text(d.bookmarkId,200);

      if (d.pushEnabled !== false) {
        await sendPushToUser({
          uid,
          title:'MirrorTrace · Revisit this reflection',
          body:'A reflection you chose to revisit is ready.',
          url:process.env.MIRRORTRACE_APP_URL || '/',
          tag:`revisit-${bookmarkId}`,
          type:'revisit_bookmark_due',
        });
      }

      if (d.emailEnabled === true) {
        const email = await emailFor(uid);
        if (email) {
          await sendMirrorTraceEmail({
            to:email,
            subject:'MirrorTrace · Revisit a reflection',
            text:[
              'A reflection you chose to revisit is ready.',
              '',
              'Open MirrorTrace to review it.',
              '',
              process.env.MIRRORTRACE_APP_URL || 'http://localhost:3000',
              '',
              'This reminder never includes private journal text.',
            ].join('\n'),
          });
        }
      }

      const batch = firestore.batch();
      batch.set(doc.ref, { status:'sent', sentAt:now(), serverUpdatedAt:FieldValue.serverTimestamp() }, { merge:true });
      batch.set(userCol(uid,'revisitBookmarks').doc(bookmarkId), { status:'due', dueAt:now(), serverUpdatedAt:FieldValue.serverTimestamp() }, { merge:true });
      await batch.commit();
      stats.revisitSent++;
    } catch (e) {
      stats.errors++;
      console.error('[JournalEnhancements] revisit failed', e);
    }
  }

  res.json({ success:true, ...stats });
});
