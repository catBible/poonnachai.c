
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { Note, NoteData } from '@/types/note';

const notesCollection = collection(db, 'notes');

export const addNote = async (userId: string, noteData: Omit<NoteData, 'userId'>): Promise<string> => {
  const docRef = await addDoc(notesCollection, {
    ...noteData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getNotes = async (userId: string): Promise<Note[]> => {
  const q = query(notesCollection, where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
};

export const getNote = async (noteId: string): Promise<Note | null> => {
  const docRef = doc(db, 'notes', noteId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Note;
  }
  return null;
};

export const updateNote = async (noteId: string, noteData: Partial<NoteData>): Promise<void> => {
  const docRef = doc(db, 'notes', noteId);
  await updateDoc(docRef, {
    ...noteData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteNote = async (noteId: string): Promise<void> => {
  const docRef = doc(db, 'notes', noteId);
  await deleteDoc(docRef);
};

// Helper to convert Firestore Timestamp to a readable date string
export const formatDate = (timestamp: Timestamp | undefined): string => {
  if (!timestamp) return 'N/A';
  return timestamp.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
