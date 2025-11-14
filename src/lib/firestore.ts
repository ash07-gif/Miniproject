import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import type { UserProfile, Article } from '@/types';
import { db } from './firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

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
    
    const historyData = {
        ...article,
        readAt: Timestamp.now(),
        userId: userId,
        articleId: article.url, // Using URL as a unique ID for the article
    };

    addDoc(historyCollectionRef, historyData).catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: historyCollectionRef.path,
            operation: 'create',
            requestResourceData: historyData,
        }));
    });
};


export const getReadingHistory = async (userId: string): Promise<Article[]> => {
    const historyCollectionRef = collection(db, `users/${userId}/readingHistory`);
    const q = query(historyCollectionRef, orderBy('readAt', 'desc'), limit(50));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            publishedAt: data.publishedAt,
            readAt: data.readAt?.toDate().toISOString(),
        } as Article;
    });
};
