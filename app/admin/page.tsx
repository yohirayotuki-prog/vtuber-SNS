'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { isAdmin, grantVerificationBadge, revokeVerificationBadge } from '@/lib/admin';
import { ArrowLeft, Shield, Check, X } from 'lucide-react';

interface VTuber {
  id: string;
  displayName: string;
  username: string;
  email: string;
  isVerified: boolean;
}

export default function AdminPanel() {
  const router = useRouter();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vtubers, setVtubers] = useState<VTuber[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminStatus = await isAdmin(user.uid);
        setIsAdminUser(adminStatus);
        if (adminStatus) {
          loadVTubers();
        } else {
          router.push('/');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadVTubers = async () => {
    try {
      const q = query(collection(db, 'users'), where('userType', '==', 'vtuber'));
      const snapshot = await getDocs(q);
      const vtuberList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VTuber[];

      setVtubers(vtuberList);
    } catch (error) {
      console.error('VTuber取得エラー:', error);
    }
  };

  const handleGrantBadge = async (vtuberId: string) => {
    if (!auth.currentUser) return;
    setProcessing(vtuberId);

    try {
      await grantVerificationBadge(auth.currentUser.uid, vtuberId);
      alert('認証バッジを付与しました！');
      loadVTubers();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRevokeBadge = async (vtuberId: string) => {
    if (!auth.currentUser) return;
    if (!confirm('認証バッジを取り消しますか？')) return;

    setProcessing(vtuberId);

    try {
      await revokeVerificationBadge(auth.currentUser.uid, vtuberId);
      alert('認証バッジを取り消しました');
      loadVTubers();
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="glass sticky top-0 z-10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 hover:bg-white/50 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <Shield className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold gradient-text">管理者パネル</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass rounded-3xl shadow-xl p-8 backdrop-blur-xl border border-white/20">
          <h2 className="text-2xl font-bold mb-6 gradient-text">VTuber認証管理</h2>
          
          {vtubers.length === 0 ? (
            <p className="text-gray-600 text-center py-8">VTuberが見つかりません</p>
          ) : (
            <div className="space-y-4">
              {vtubers.map((vtuber) => (
                <div
                  key={vtuber.id}
                  className="glass rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{vtuber.displayName}</h3>
                        {vtuber.isVerified && (
                          <Check className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">@{vtuber.username}</p>
                      <p className="text-sm text-gray-500">{vtuber.email}</p>
                    </div>

                    <div className="flex gap-2">
                      {vtuber.isVerified ? (
                        <button
                          onClick={() => handleRevokeBadge(vtuber.id)}
                          disabled={processing === vtuber.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          取り消し
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGrantBadge(vtuber.id)}
                          disabled={processing === vtuber.id}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          認証を付与
                        </button>
                      )}
                    </div>
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