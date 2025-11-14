import { doc, setDoc, getDoc, updateDoc, collection, addDoc, query, orderBy, limit, getDocs, where, Timestamp } from 'firebase/firestore';
import type { UserProfile, Article } from '@/types';
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { db } from './firebase';

export const createUserProfile = async (
  userId: string,
  email: string,
  displayName: string
): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    // Use non-blocking write
    setDocumentNonBlocking(userRef, {
        id: userId,
        email,
        username: displayName,
        preferences: ['general', 'technology'], // Default preferences
    }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const updateUserPreferences = async (userId: string, preferences: string[]): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  // Use non-blocking update
  updateDocumentNonBlocking(userRef, { preferences });
};

export const addToReadingHistory = (userId: string, article: Article): void => {
    if (!article.url) return;
    const historyCollectionRef = collection(db, `users/${userId}/readingHistory`);
    
    // Non-blocking add
    addDocumentNonBlocking(historyCollectionRef, {
        ...article,
        readAt: Timestamp.now(),
        userId: userId,
        articleId: article.url, // Using URL as a unique ID for the article
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
