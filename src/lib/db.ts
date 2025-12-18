import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

export type DbProject = {
  id: string;
  title: string;
  url: string;
  description: string;
  image_url: string | null;
  images: string[];
  tags: string[];
  created_at?: Timestamp;
};

const COLLECTION = 'projects';

export async function getProjects(): Promise<DbProject[]> {
  const snapshot = await db.collection(COLLECTION).orderBy('created_at', 'desc').get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as DbProject));
}

export async function getProject(id: string): Promise<DbProject | null> {
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as DbProject;
}

export async function createProject(project: Omit<DbProject, 'id' | 'created_at'>): Promise<DbProject> {
  const docRef = db.collection(COLLECTION).doc();
  const newProject = {
    ...project,
    created_at: Timestamp.now(),
  };
  await docRef.set(newProject);
  return { id: docRef.id, ...newProject };
}

export async function updateProject(id: string, project: Partial<DbProject>): Promise<void> {
  const docRef = db.collection(COLLECTION).doc(id);
  await docRef.update({
    ...project,
    updated_at: Timestamp.now(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  await db.collection(COLLECTION).doc(id).delete();
}

// Batch import for admin
export async function importProjects(projects: Omit<DbProject, 'id'>[]): Promise<number> {
  const batch = db.batch();
  let count = 0;

  for (const project of projects) {
    const docRef = db.collection(COLLECTION).doc();
    batch.set(docRef, {
      ...project,
      created_at: Timestamp.now(),
    });
    count++;
  }

  await batch.commit();
  return count;
}
