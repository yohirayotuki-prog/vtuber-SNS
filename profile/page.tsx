'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Edit2, Save, X, Camera, Check } from 'lucide-react';

interface UserData {
  displayName: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  userType: string;
  isVerified: boolean;
}

interface Post {
  id: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ displayName: '', bio: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid);
        await loadUserPosts(user.uid);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData(data);
        setEditData({ displayName: data.displayName, bio: data.bio || '' });
      }
    } catch (error) {
      console.error('ユーザーデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPosts = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'posts'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];

      setPosts(postList);
    } catch (error) {
      console.error('投稿取得エラー:', error);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: editData.displayName,
        bio: editData.bio,
        updatedAt: new Date(),
      });

      setUserData({ ...userData!, displayName: editData.displayName, bio: editData.bio });
      setEditing(false);
      alert('プロフィールを更新しました！');
    } catch (error) {
      console.error('更新エラー:', error);
      alert('更新に失敗しました');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !auth.currentUser) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        avatarUrl: downloadURL,
        updatedAt: new Date(),
      });

      setUserData({ ...userData!, avatarUrl: downloadURL });
      alert('プロフィール画像を更新しました！');
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between slide-in-top">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold gradient-text">プロフィール</h1>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-purple-600 hover:bg-purple-50 rounded-xl transition-all transform hover:scale-105 font-bold"
            >
              <Edit2 className="w-4 h-4" />
              編集
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* プロフィールカード */}
        <div className="glass rounded-3xl shadow-xl p-8 mb-6 backdrop-blur-xl border border-white/20 scale-in">
          {/* アバター */}
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                {userData?.avatarUrl ? (
                  <img src={userData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userData?.displayName.charAt(0).toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex-1">
              {editing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.displayName}
                    onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                    className="w-full px-4 py-3 glass border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 backdrop-blur-sm transition-all"
                    placeholder="表示名"
                  />
                  <textarea
                    value={editData.bio}
                    onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                    className="w-full px-4 py-3 glass border-2 border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 backdrop-blur-sm resize-none transition-all"
                    rows={3}
                    placeholder="自己紹介"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 font-bold"
                    >
                      <Save className="w-4 h-4" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-2 px-6 py-2.5 glass border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-white/50 transition-all transform hover:scale-105 font-bold backdrop-blur-sm"
                    >
                      <X className="w-4 h-4" />
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-3xl font-bold gradient-text">{userData?.displayName}</h2>
                    {userData?.isVerified && <Check className="w-7 h-7 text-blue-500" />}
                  </div>
                  <p className="text-gray-600 mb-2">@{userData?.username}</p>
                  <span className={`inline-block px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                    userData?.userType === 'vtuber'
                      ? 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-700'
                      : 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700'
                  }`}>
                    {userData?.userType === 'vtuber' ? '🎭 VTuber' : '👤 リスナー'}
                  </span>
                  {userData?.bio && (
                    <p className="text-gray-700 mt-3 whitespace-pre-wrap">{userData.bio}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 統計 */}
          <div className="flex gap-8 pt-6 border-t-2 border-white/30">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{posts.length}</div>
              <div className="text-sm text-gray-600 font-medium">投稿</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text mb-1">
                {posts.reduce((sum, post) => sum + post.likesCount, 0)}
              </div>
              <div className="text-sm text-gray-600 font-medium">いいね</div>
            </div>
          </div>
        </div>

        {/* 投稿一覧 */}
        <div className="slide-in-bottom">
          <h3 className="text-2xl font-bold mb-4 gradient-text">投稿</h3>
          {posts.length === 0 ? (
            <div className="glass rounded-3xl shadow-lg p-12 text-center backdrop-blur-xl border border-white/20">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">まだ投稿がありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={post.id} className="glass rounded-3xl shadow-lg p-6 backdrop-blur-xl border border-white/20 card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post" className="w-full rounded-lg mb-3" />
                  )}
                  <div className="flex gap-6 text-gray-600 text-sm">
                    <span>❤️ {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}