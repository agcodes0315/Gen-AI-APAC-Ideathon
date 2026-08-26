import { firestore, FieldValue } from './firebaseAdmin.ts';

/**
 * Set (create or overwrite) a document in Firestore using the verified server Firebase Admin SDK.
 * docPath is strictly owner-bound (e.g. users/{authenticatedUid}/...)
 */
export async function setFirestoreDocument(
  _token: string,
  docPath: string,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const docRef = firestore.doc(docPath);
  await docRef.set(data, { merge: true });
  return { id: docRef.id, ...data };
}

/**
 * Get a single document from Firestore using the Firebase Admin SDK.
 */
export async function getFirestoreDocument(
  _token: string,
  docPath: string
): Promise<Record<string, unknown> | null> {
  const docRef = firestore.doc(docPath);
  const snap = await docRef.get();
  if (!snap.exists) {
    return null;
  }
  return { id: snap.id, ...snap.data() };
}

/**
 * Delete a document from Firestore using the Firebase Admin SDK.
 */
export async function deleteFirestoreDocument(
  _token: string,
  docPath: string
): Promise<void> {
  const docRef = firestore.doc(docPath);
  await docRef.delete();
}

/**
 * List documents in a collection using the Firebase Admin SDK.
 */
export async function listFirestoreDocuments(
  _token: string,
  collectionPath: string,
  pageSize = 50
): Promise<Array<Record<string, unknown>>> {
  const colRef = firestore.collection(collectionPath);
  const snap = await colRef.limit(pageSize).get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Query documents in a collection with structured query (e.g. order by, limit)
 */
export async function queryFirestoreDocuments(
  _token: string,
  parentCollectionPath: string,
  collectionId: string,
  orderByField?: string,
  orderDirection: 'ASCENDING' | 'DESCENDING' = 'DESCENDING',
  limitCount = 50
): Promise<Array<Record<string, unknown>>> {
  const fullPath = parentCollectionPath ? `${parentCollectionPath}/${collectionId}` : collectionId;
  let query: FirebaseFirestore.Query = firestore.collection(fullPath);

  if (orderByField) {
    query = query.orderBy(orderByField, orderDirection === 'ASCENDING' ? 'asc' : 'desc');
  }

  query = query.limit(limitCount);
  const snap = await query.get();
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export { FieldValue };
