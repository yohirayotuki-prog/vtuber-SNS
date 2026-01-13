import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

interface InviteCode {
  id: string;
  code: string;
  creatorId: string;
  creatorName: string;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  createdAt: Date;
}

// ランダムな招待コードを生成
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 招待コードを作成（認証済みVTuberのみ）
export async function createInviteCode(
  creatorId: string,
  maxUses: number = 10,
  daysValid: number = 30
): Promise<string> {
  try {
    // VTuberかつ認証済みか確認
    const userDoc = await getDoc(doc(db, 'users', creatorId));
    if (!userDoc.exists()) {
      throw new Error('ユーザーが見つかりません');
    }

    const userData = userDoc.data();
    if (userData.userType !== 'vtuber') {
      throw new Error('VTuberのみ招待コードを作成できます');
    }
    if (!userData.isVerified) {
      throw new Error('認証済みVTuberのみ招待コードを作成できます');
    }

    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + daysValid);

    await addDoc(collection(db, 'inviteCodes'), {
      code,
      creatorId,
      creatorName: userData.displayName,
      maxUses,
      usedCount: 0,
      expiresAt,
      createdAt: new Date(),
    });

    return code;
  } catch (error) {
    console.error('招待コード作成エラー:', error);
    throw error;
  }
}

// 招待コードを検証
export async function validateInviteCode(code: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'inviteCodes'), where('code', '==', code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    const inviteData = snapshot.docs[0].data();
    const now = new Date();

    // 有効期限チェック
    if (inviteData.expiresAt.toDate() < now) {
      return false;
    }

    // 使用回数チェック
    if (inviteData.usedCount >= inviteData.maxUses) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('招待コード検証エラー:', error);
    return false;
  }
}

// 招待コードを使用
export async function useInviteCode(code: string): Promise<boolean> {
  try {
    const q = query(collection(db, 'inviteCodes'), where('code', '==', code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error('無効な招待コードです');
    }

    const inviteDoc = snapshot.docs[0];
    const inviteData = inviteDoc.data();

    // 使用回数を増やす
    const docRef = doc(db, 'inviteCodes', inviteDoc.id);
    await updateDoc(docRef, {
      usedCount: inviteData.usedCount + 1,
    });

    return true;
  } catch (error) {
    console.error('招待コード使用エラー:', error);
    throw error;
  }
}

// 自分の招待コード一覧を取得
export async function getMyInviteCodes(creatorId: string): Promise<InviteCode[]> {
  try {
    const q = query(
      collection(db, 'inviteCodes'),
      where('creatorId', '==', creatorId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InviteCode[];
  } catch (error) {
    console.error('招待コード取得エラー:', error);
    return [];
  }
}

// 招待コードを削除
export async function deleteInviteCode(codeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'inviteCodes', codeId));
  } catch (error) {
    console.error('招待コード削除エラー:', error);
    throw error;
  }
}