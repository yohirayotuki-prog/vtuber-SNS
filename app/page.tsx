'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserData } from '@/lib/auth';
import { Search, Home, User as UserIcon, LogOut } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const data = await getUserData(user.uid);
        setUserData(data);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
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
          <h1 className="text-2xl font-bold gradient-text">
            VTuber SNS
          </h1>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/search')}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => router.push('/')}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110"
            >
              <Home className="w-5 h-5 text-purple-600" />
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110"
            >
              <UserIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 hover:bg-red-50 rounded-xl transition-all transform hover:scale-110"
            >
              <LogOut className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ウェルカムメッセージ */}
        <div className="glass rounded-3xl shadow-lg p-8 mb-6 card-hover slide-in-bottom backdrop-blur-xl border border-white/20">
          <h2 className="text-3xl font-bold mb-3 gradient-text">
            ようこそ、{userData?.displayName}さん！
          </h2>
          <p className="text-gray-700 text-lg">
            {userData?.userType === 'vtuber' 
              ? '🎭 VTuberとして活動中' 
              : '👤 リスナーとして参加中'}
          </p>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => router.push('/search')}
            className="glass rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all text-left transform hover:-translate-y-2 backdrop-blur-xl border border-white/20 slide-in-left"
          >
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 glow-hover">
              <Search className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2">VTuberを探す</h3>
            <p className="text-sm text-gray-600">お気に入りのVTuberを見つけよう</p>
          </button>

          <button
            onClick={() => router.push('/following')}
            className="glass rounded-3xl shadow-lg p-8 hover:shadow-2xl transition-all text-left transform hover:-translate-y-2 backdrop-blur-xl border border-white/20 slide-in-right"
          >
            <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 glow-hover">
              <Home className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl mb-2">フォロー中</h3>
            <p className="text-sm text-gray-600">フォロー中のVTuberの投稿</p>
          </button>
        </div>

        {/* タイムライン（今後実装） */}
        <div className="glass rounded-3xl shadow-lg p-10 text-center backdrop-blur-xl border border-white/20 scale-in">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 text-lg mb-4">まだ投稿がありません</p>
          <p className="text-sm text-gray-400">
            VTuberをフォローして、最新の投稿をチェックしましょう！
          </p>
        </div>
      </main>
    </div>
  );
}