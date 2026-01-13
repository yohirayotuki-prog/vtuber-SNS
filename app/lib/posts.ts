import { db } from './firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore'

export type Post = {
  id: string
  userId: string
  content: string
  createdAt: any
}

/* 投稿する */
export async function createPost(userId: string, content: string) {
  if (!content.trim()) throw new Error('内容が空です')

  await addDoc(collection(db, 'posts'), {
    userId,
    content,
    createdAt: serverTimestamp(),
  })
}

/* タイムライン取得 */
export function subscribePosts(
  callback: (posts: Post[]) => void
) {
  const q = query(
    collection(db, 'posts'),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const posts: Post[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Post, 'id'>),
    }))
    callback(posts)
  })
}
