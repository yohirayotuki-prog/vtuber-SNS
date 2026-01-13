'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db, auth } from '@/app/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ArrowLeft, Users, Heart, MessageCircle, Check } from 'lucide-react';

interface VTuber {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isVerified: boolean;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
}

export default function FollowingPage() {
  const router = useRouter();
  const [followingVTubers, setFollowingVTubers] = useState<VTuber[]>([]);
  const [timeline, setTimeline] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'timeline'>('list');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadFollowing(user.uid);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  const loadFollowing = async (userId: string) => {
    try {
      // フォロー中のVTuberを取得
      const followsQuery = query(
        collection(db, 'follows'),
        where('followerId', '==', userId)
      );
      const followsSnapshot = await getDocs(followsQuery);

      const vtuberIds = followsSnapshot.docs.map((doc) => doc.data().followingId);

      if (vtuberIds.length === 0) {
        setLoading(false);
        return;
      }

      // VTuberの情報を取得
      const vtuberList: VTuber[] = [];
      for (const vtuberId of vtuberIds) {
        const vtuberDoc = await getDoc(doc(db, 'users', vtuberId));
        if (vtuberDoc.exists()) {
          vtuberList.push({
            id: vtuberDoc.id,
            ...vtuberDoc.data(),
          } as VTuber);
        }
      }

      setFollowingVTubers(vtuberList);

      // タイムライン（フォロー中の投稿）を取得
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', 'in', vtuberIds),
        where('isApproved', '==', true),
        orderBy('createdAt', 'desc')
      );
      const postsSnapshot = await getDocs(postsQuery);

      const postList: Post[] = [];
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        const userDoc = await getDoc(doc(db, 'users', postData.userId));
        const userData = userDoc.data();

        postList.push({
          id: postDoc.id,
          ...postData,
          userName: userData?.displayName || 'Unknown',
          userAvatar: userData?.avatarUrl,
          isVerified: userData?.isVerified || false,
        } as Post);
      }

      setTimeline(postList);
    } catch (error) {
      console.error('フォロー中データ取得エラー:', error);
    } finally {
      setLoading(false);
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
        <div className="max-w-4xl mx-auto px-4 py-4 slide-in-top">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold gradient-text">
              フォロー中
            </h1>
          </div>

          {/* タブ */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                view === 'list'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'glass text-gray-700 hover:bg-white/50 border-2 border-white/20 backdrop-blur-sm'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              VTuber一覧
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                view === 'timeline'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'glass text-gray-700 hover:bg-white/50 border-2 border-white/20 backdrop-blur-sm'
              }`}
            >
              タイムライン
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {followingVTubers.length === 0 ? (
          <div className="glass rounded-3xl shadow-lg p-12 text-center backdrop-blur-xl border border-white/20 scale-in">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-6">フォロー中のVTuberがいません</p>
            <button
              onClick={() => router.push('/search')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-xl transition-all transform hover:scale-105 font-bold"
            >
              VTuberを探す
            </button>
          </div>
        ) : view === 'list' ? (
          /* VTuber一覧 */
          <div className="space-y-4">
            {followingVTubers.map((vtuber, index) => (
              <div
                key={vtuber.id}
                onClick={() => router.push(`/fanroom/${vtuber.id}`)}
                className="glass rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all cursor-pointer backdrop-blur-xl border border-white/20 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                    {vtuber.avatarUrl ? (
                      <img src={vtuber.avatarUrl} alt={vtuber.displayName} className="w-full h-full object-cover" />
                    ) : (
                      vtuber.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{vtuber.displayName}</h3>
                      {vtuber.isVerified && <Check className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-gray-600 text-sm">@{vtuber.username}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* タイムライン */
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <div className="glass rounded-3xl shadow-lg p-12 text-center backdrop-blur-xl border border-white/20 scale-in">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">まだ投稿がありません</p>
              </div>
            ) : (
              timeline.map((post, index) => (
                <div key={post.id} className="glass rounded-3xl shadow-lg p-6 backdrop-blur-xl border border-white/20 card-hover" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* 投稿者情報 */}
                  <div
                    onClick={() => router.push(`/fanroom/${post.userId}`)}
                    className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold overflow-hidden">
                      {post.userAvatar ? (
                        <img src={post.userAvatar} alt={post.userName} className="w-full h-full object-cover" />
                      ) : (
                        post.userName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{post.userName}</span>
                        {post.isVerified && <Check className="w-4 h-4 text-blue-500" />}
                      </div>
                      <span className="text-sm text-gray-500">
                        {post.createdAt?.toDate().toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>

                  {/* 投稿内容 */}
                  <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                  {post.imageUrl && (
                    <img src={post.imageUrl} alt="Post" className="w-full rounded-lg mb-3" />
                  )}

                  {/* アクション */}
                  <div className="flex items-center gap-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5" />
                      <span>{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span>{post.commentsCount}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}