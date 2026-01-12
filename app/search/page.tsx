'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Search, ArrowLeft, Check } from 'lucide-react';
import { followVTuber, unfollowVTuber, isFollowing } from '@/lib/follows';
import ThemeToggle from '@/components/ThemeToggle';
import AdSense from '@/components/AdSense';

interface VTuberUser {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  isVerified: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [vtubers, setVtubers] = useState<VTuberUser[]>([]);
  const [filteredVtubers, setFilteredVtubers] = useState<VTuberUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadVTubers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredVtubers(vtubers);
    } else {
      const filtered = vtubers.filter(
        (vtuber) =>
          vtuber.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vtuber.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVtubers(filtered);
    }
  }, [searchQuery, vtubers]);

  const loadVTubers = async () => {
    try {
      const q = query(collection(db, 'users'), where('userType', '==', 'vtuber'));
      const snapshot = await getDocs(q);
      const vtuberList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VTuberUser[];

      setVtubers(vtuberList);
      setFilteredVtubers(vtuberList);

      // フォロー状態をチェック
      if (auth.currentUser) {
        const followingSet = new Set<string>();
        for (const vtuber of vtuberList) {
          const following = await isFollowing(auth.currentUser.uid, vtuber.id);
          if (following) {
            followingSet.add(vtuber.id);
          }
        }
        setFollowingIds(followingSet);
      }
    } catch (error) {
      console.error('VTuber取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (vtuberId: string) => {
    if (!auth.currentUser) return;

    try {
      if (followingIds.has(vtuberId)) {
        await unfollowVTuber(auth.currentUser.uid, vtuberId);
        setFollowingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(vtuberId);
          return newSet;
        });
      } else {
        await followVTuber(auth.currentUser.uid, vtuberId);
        setFollowingIds((prev) => new Set(prev).add(vtuberId));
      }
    } catch (error) {
      console.error('フォローエラー:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* ヘッダー */}
      <header className="glass sticky top-0 z-10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4 slide-in-top">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2.5 hover:bg-white/50 rounded-xl transition-all transform hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold gradient-text flex-1">
              VTuberを探す
            </h1>
            <ThemeToggle />
          </div>

          {/* 検索バー */}
          <div className="relative scale-in">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="VTuber名で検索..."
              className="w-full pl-12 pr-4 py-3 glass border-2 border-white/20 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all backdrop-blur-xl"
            />
          </div>
        </div>
      </header>

      {/* VTuberリスト */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 広告 */}
        <AdSense 
          adSlot="YOUR_AD_SLOT_ID"
          adFormat="auto"
        />

        {loading ? (
          <div className="text-center py-12 fade-in">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <p className="mt-6 text-gray-600 text-lg">読み込み中...</p>
          </div>
        ) : filteredVtubers.length === 0 ? (
          <div className="glass rounded-3xl shadow-lg p-12 text-center backdrop-blur-xl border border-white/20 scale-in">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 text-lg">VTuberが見つかりませんでした</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVtubers.map((vtuber, index) => (
              <div
                key={vtuber.id}
                className="glass rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all backdrop-blur-xl border border-white/20 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/fanroom/${vtuber.id}`)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{vtuber.displayName}</h3>
                      {vtuber.isVerified && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">@{vtuber.username}</p>
                    {vtuber.bio && (
                      <p className="text-gray-700 text-sm">{vtuber.bio}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleFollow(vtuber.id)}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all transform hover:scale-105 ${
                      followingIds.has(vtuber.id)
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {followingIds.has(vtuber.id) ? 'フォロー中' : 'フォロー'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}