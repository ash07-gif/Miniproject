import { doc, setDoc, getDoc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import type { UserProfile, Article } from '@/types';
import { getSdks } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const { firestore: db } = getSdks();

export const createUserProfile = (
  userId: string,
  email: string,
  displayName: string
): void => {
    const userRef = doc(db, 'users', userId);
    const userData = {
        id: userId,
        email,
        username: displayName,
        preferences: ['general', 'technology'], // Default preferences
    };
    setDoc(userRef, userData, { merge: true }).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: userData,
        }));
    });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!userId) return null;
  const userRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    // We don't emit a permission error here for reads, 
    // as it's handled by useDoc/useCollection hooks. 
    // If this function is used outside a hook, specific error handling might be needed.
    return null;
  }
};

export const updateUserPreferences = (userId: string, preferences: string[]): void => {
  const userRef = doc(db, 'users', userId);
  updateDoc(userRef, { preferences }).catch(error => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: { preferences },
    }));
  });
};

export const addToReadingHistory = (userId: string, article: Article): void => {
    if (!article.url) return;
    const historyCollectionRef = collection(db, `users/${userId}/readingHistory`);
    
    // Use the URL as a document ID to prevent duplicates
    const docId = encodeURIComponent(article.url);
    const historyDocRef = doc(historyCollectionRef, docId);

    const historyData = {
        ...article,
        readAt: Timestamp.now(),
        userId: userId,
        articleId: article.url, 
    };

    setDoc(historyDocRef, historyData, { merge: true }).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: historyDocRef.path,
            operation: 'write', // 'write' covers create and update
            requestResourceData: historyData,
        }));
    });
};
