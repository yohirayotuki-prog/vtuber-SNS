import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserType } from '@/types';

export async function signUp(
  email: string, 
  password: string, 
  username: string,
  displayName: string,
  userType: UserType
) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Firestoreにユーザー情報保存
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      email,
      username,
      displayName,
      userType,
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signIn(email: string, password: string) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function signOut() {
  try {
    return await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getUserData(userId: string) {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}