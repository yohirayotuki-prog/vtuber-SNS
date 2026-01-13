'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/auth';
import { UserType } from '@/types';
import { validateInviteCode, useInviteCode } from '@/lib/inviteCodes';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
    userType: 'listener' as UserType,
    inviteCode: '', // 招待コード追加
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // リスナーの場合は招待コードが必須
      if (formData.userType === 'listener') {
        if (!formData.inviteCode.trim()) {
          setError('リスナー登録には招待コードが必要です');
          setLoading(false);
          return;
        }

        // 招待コードを検証
        const isValid = await validateInviteCode(formData.inviteCode);
        if (!isValid) {
          setError('無効な招待コードです');
          setLoading(false);
          return;
        }
      }

      await signUp(
        formData.email,
        formData.password,
        formData.username,
        formData.displayName,
        formData.userType
      );

      // リスナーの場合は招待コードを使用済みにする
      if (formData.userType === 'listener') {
        await useInviteCode(formData.inviteCode);
      }

      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <div className="glass rounded-3xl shadow-2xl p-8 w-full max-w-md scale-in backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4 glow-hover">
            <span className="text-4xl">🎭</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 gradient-text">
            VTuber SNS
          </h1>
          <p className="text-gray-600">アカウント作成</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ユーザータイプ選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アカウントタイプ
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'listener' })}
                className={`py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  formData.userType === 'listener'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/80 border-2 border-gray-200'
                }`}
              >
                リスナー
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, userType: 'vtuber' })}
                className={`py-3 px-4 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  formData.userType === 'vtuber'
                    ? 'bg-gradient-to-r from-pink-600 to-pink-700 text-white shadow-lg'
                    : 'bg-white/50 text-gray-700 hover:bg-white/80 border-2 border-gray-200'
                }`}
              >
                VTuber
              </button>
            </div>
          </div>

          {/* 表示名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              表示名
            </label>
            <input
              type="text"
              required
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm"
              placeholder="山田太郎"
            />
          </div>

          {/* ユーザー名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="yamada_taro"
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {/* 登録ボタン */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 text-white py-3 rounded-xl font-bold hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none animate-gradient"
          >
            {loading ? '登録中...' : 'アカウント作成'}
          </button>
        </form>

        {/* ログインリンク */}
        <p className="text-center text-gray-600 mt-6">
          すでにアカウントをお持ちですか？{' '}
          <a href="/login" className="text-purple-600 hover:text-purple-700 font-medium transition hover:underline">
            ログイン
          </a>
        </p>
      </div>
    </div>
  );
}