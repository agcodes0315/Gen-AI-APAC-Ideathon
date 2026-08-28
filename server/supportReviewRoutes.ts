import { Router } from 'express';
import {
  authMiddleware,
  type AuthenticatedRequest,
  firestore,
  FieldValue,
} from './firebaseAdmin.ts';
import { getAdminAuthContext, requireRole } from './adminRbac.ts';
import { writeAdminAuditEvent } from './adminService.ts';

export const supportReviewRouter = Router();

const supportStatuses = ['open', 'in_progress', 'resolved', 'closed'] as const;
const reviewStates = ['pending', 'approved', 'hidden', 'rejected'] as const;

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

supportReviewRouter.post(
  '/api/support/tickets',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const body =
      req.body && typeof req.body === 'object' ? req.body : {};

    const category = text(body.category, 64);
    const subject = text(body.subject, 160);
    const message = text(body.message, 5000);

    if (!category || !subject || !message) {
      return res.status(400).json({
        error: 'Category, subject, and message are required.',
        code: 'INVALID_SUPPORT_TICKET',
      });
    }

    const now = new Date().toISOString();
    const ref = firestore.collection('supportTickets').doc();

    await ref.set({
      id: ref.id,
      ownerUid: req.user!.uid,
      category,
      subject,
      message,
      status: 'open',
      adminReply: null,
      createdAt: now,
      updatedAt: now,
      serverCreatedAt: FieldValue.serverTimestamp(),
      serverUpdatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ success: true, id: ref.id });
  }
);

supportReviewRouter.get(
  '/api/support/tickets',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const snapshot = await firestore
      .collection('supportTickets')
      .where('ownerUid', '==', req.user!.uid)
      .limit(100)
      .get();

    const tickets = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) =>
        String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))
      );

    return res.json({ tickets });
  }
);

supportReviewRouter.get(
  '/api/admin/support/tickets',
  requireRole('admin'),
  async (_req, res) => {
    const snapshot = await firestore.collection('supportTickets').limit(200).get();

    const tickets = snapshot.docs.map((doc) => {
      const data = doc.data();
      const uid = String(data.ownerUid || '');

      return {
        id: doc.id,
        ownerUid:
          uid.length > 10 ? `${uid.slice(0, 6)}…${uid.slice(-4)}` : uid,
        category: String(data.category || ''),
        subject: String(data.subject || ''),
        message: String(data.message || ''),
        status: String(data.status || 'open'),
        adminReply:
          typeof data.adminReply === 'string' ? data.adminReply : null,
        createdAt: String(data.createdAt || ''),
      };
    });

    return res.json({ tickets });
  }
);

supportReviewRouter.patch(
  '/api/admin/support/tickets/:id',
  requireRole('admin'),
  async (req, res) => {
    const context = getAdminAuthContext(res);
    const body =
      req.body && typeof req.body === 'object' ? req.body : {};

    const status = text(body.status, 64);
    const adminReply = text(body.adminReply, 5000);

    if (!supportStatuses.includes(status as any)) {
      return res.status(400).json({
        error: 'Invalid support status.',
        code: 'INVALID_SUPPORT_STATUS',
      });
    }

    const ref = firestore.collection('supportTickets').doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Support ticket not found.',
        code: 'SUPPORT_TICKET_NOT_FOUND',
      });
    }

    await ref.update({
      status,
      adminReply: adminReply || null,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: FieldValue.serverTimestamp(),
    });

    await writeAdminAuditEvent({
      actingUid: context.uid,
      actingRole: context.role,
      action: 'UPDATE_SUPPORT_TICKET',
      targetResourceType: 'support_ticket',
      targetIdentifier: req.params.id,
      outcome: 'success',
    });

    return res.json({ success: true });
  }
);

supportReviewRouter.post(
  '/api/reviews',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const body =
      req.body && typeof req.body === 'object' ? req.body : {};

    const rating = Number(body.rating);
    const reviewText = text(body.reviewText, 2000);
    const allowPublic = body.allowPublic === true;

    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !reviewText) {
      return res.status(400).json({
        error: 'Rating must be 1–5 and review text is required.',
        code: 'INVALID_REVIEW',
      });
    }

    const now = new Date().toISOString();
    const ref = firestore.collection('productReviews').doc();

    await ref.set({
      id: ref.id,
      ownerUid: req.user!.uid,
      displayName: 'MirrorTrace user',
      rating,
      reviewText,
      allowPublic,
      moderationState: 'pending',
      adminResponse: null,
      createdAt: now,
      updatedAt: now,
      serverCreatedAt: FieldValue.serverTimestamp(),
      serverUpdatedAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({ success: true, id: ref.id });
  }
);

supportReviewRouter.get(
  '/api/reviews/mine',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    const snapshot = await firestore
      .collection('productReviews')
      .where('ownerUid', '==', req.user!.uid)
      .limit(50)
      .get();

    return res.json({
      reviews: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  }
);

supportReviewRouter.get(
  '/api/reviews/public',
  async (_req, res) => {
    const snapshot = await firestore
      .collection('productReviews')
      .where('moderationState', '==', 'approved')
      .limit(100)
      .get();

    return res.json({
      reviews: snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((review: any) => review.allowPublic === true),
    });
  }
);

supportReviewRouter.get(
  '/api/admin/reviews',
  requireRole('admin'),
  async (_req, res) => {
    const snapshot = await firestore.collection('productReviews').limit(200).get();

    return res.json({
      reviews: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    });
  }
);

supportReviewRouter.patch(
  '/api/admin/reviews/:id',
  requireRole('admin'),
  async (req, res) => {
    const context = getAdminAuthContext(res);
    const body =
      req.body && typeof req.body === 'object' ? req.body : {};

    const moderationState = text(body.moderationState, 64);
    const adminResponse = text(body.adminResponse, 2000);

    if (!reviewStates.includes(moderationState as any)) {
      return res.status(400).json({
        error: 'Invalid review moderation state.',
        code: 'INVALID_REVIEW_STATE',
      });
    }

    const ref = firestore.collection('productReviews').doc(req.params.id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Review not found.',
        code: 'REVIEW_NOT_FOUND',
      });
    }

    const existing = doc.data() || {};

    if (
      moderationState === 'approved' &&
      existing.allowPublic !== true
    ) {
      return res.status(409).json({
        error: 'The user did not consent to public display.',
        code: 'PUBLIC_CONSENT_REQUIRED',
      });
    }

    await ref.update({
      moderationState,
      adminResponse: adminResponse || null,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: FieldValue.serverTimestamp(),
    });

    await writeAdminAuditEvent({
      actingUid: context.uid,
      actingRole: context.role,
      action: 'MODERATE_REVIEW',
      targetResourceType: 'product_review',
      targetIdentifier: req.params.id,
      outcome: 'success',
    });

    return res.json({ success: true });
  }
);
