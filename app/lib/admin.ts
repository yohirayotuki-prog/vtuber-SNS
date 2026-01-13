import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// 管理者メールアドレス
const ADMIN_EMAIL = 'hirasaku4tuki@gmail.com'; // ひらさくよつきのメール

// 管理者かどうか確認
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.isAdmin === true || userData.email === ADMIN_EMAIL;
    }
    return false;
  } catch (error) {
    console.error('管理者確認エラー:', error);
    return false;
  }
}

// 認証バッジを付与
export async function grantVerificationBadge(
  adminUserId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    // 管理者権限確認
    const adminCheck = await isAdmin(adminUserId);
    if (!adminCheck) {
      throw new Error('管理者権限がありません');
    }

    // 認証バッジを付与
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      isVerified: true,
      verifiedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error('認証バッジ付与エラー:', error);
    throw error;
  }
}

// 認証バッジを取り消し
export async function revokeVerificationBadge(
  adminUserId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const adminCheck = await isAdmin(adminUserId);
    if (!adminCheck) {
      throw new Error('管理者権限がありません');
    }

    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, {
      isVerified: false,
    });

    return true;
  } catch (error) {
    console.error('認証バッジ取り消しエラー:', error);
    throw error;
  }
}