import { doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp, collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Article } from '@/types';

export const createUserProfile = async (
  userId: string,
  email: string,
  displayName: string
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    email,
    displayName,
    preferences: ['general', 'technology'], // Default preferences
  });
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
  await updateDoc(userRef, { preferences });
};

export const addToReadingHistory = async (userId: string, article: Article): Promise<void> => {
    if (!article.url) return;
    const historyCollectionRef = collection(db, `users/${userId}/history`);
    
    // Check if article already exists to avoid duplicates
    const q = query(historyCollectionRef, where("url", "==", article.url), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        await addDoc(historyCollectionRef, {
            ...article,
            readAt: Timestamp.now(),
        });
    } else {
        // Optionally update the timestamp if it already exists
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, { readAt: Timestamp.now() });
    }
};


export const getReadingHistory = async (userId: string): Promise<Article[]> => {
    const historyCollectionRef = collection(db, `users/${userId}/history`);
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
