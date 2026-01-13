import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';

export async function followVTuber(followerId: string, vTuberId: string) {
  try {
    await addDoc(collection(db, 'follows'), {
      followerId,
      followingId: vTuberId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('フォローエラー:', error);
    throw error;
  }
}

export async function unfollowVTuber(followerId: string, vTuberId: string) {
  try {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', followerId),
      where('followingId', '==', vTuberId)
    );

    const snapshot = await getDocs(q);
    snapshot.forEach(async (document) => {
      await deleteDoc(doc(db, 'follows', document.id));
    });
  } catch (error) {
    console.error('アンフォローエラー:', error);
    throw error;
  }
}

export async function isFollowing(
  followerId: string,
  vTuberId: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', followerId),
      where('followingId', '==', vTuberId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('フォロー確認エラー:', error);
    return false;
  }
}

export async function getFollowingVTubers(userId: string) {
  try {
    const q = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('フォロー中のVTuber取得エラー:', error);
    return [];
  }
}