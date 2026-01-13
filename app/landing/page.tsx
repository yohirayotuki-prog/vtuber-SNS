'use client';

import { useRouter } from 'next/navigation';
import { Users, Heart, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen animated-gradient">
      {/* ヘッダー */}
      <header className="glass backdrop-blur-xl border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🎭</div>
            <h1 className="text-2xl font-bold gradient-text">VTuber SNS</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2.5 glass border-2 border-white/20 rounded-xl font-bold hover:bg-white/50 transition-all"
            >
              ログイン
            </button>
            <button
              onClick={() => router.push('/signup')}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              新規登録
            </button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="scale-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            VTuberとリスナーの
            <br />
            新しいコミュニティ
          </h2>
          <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Twitterとは違う、VTuber専用のSNS。
            <br />
            より近い距離で、より深い交流を。
          </p>
          <button
            onClick={() => router.push('/signup')}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-lg rounded-2xl font-bold hover:shadow-2xl transition-all transform hover:scale-105"
          >
            今すぐ始める →
          </button>
        </div>
      </section>

      {/* 機能セクション */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12 gradient-text">
          VTuber SNSの特徴
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: <Users className="w-12 h-12 text-purple-600" />,
              title: 'VTuber専門',
              description: 'VTuberとリスナーだけのクローズドなコミュニティ',
            },
            {
              icon: <Heart className="w-12 h-12 text-pink-600" />,
              title: '近い距離',
              description: 'ファンルームで推しVTuberとより密接に',
            },
            {
              icon: <Shield className="w-12 h-12 text-blue-600" />,
              title: '認証システム',
              description: '認証バッジで本物のVTuberを確認',
            },
            {
              icon: <Zap className="w-12 h-12 text-yellow-600" />,
              title: '招待制',
              description: '健全なコミュニティを維持',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20 hover:shadow-2xl transition-all card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTAセクション */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="glass rounded-3xl p-12 backdrop-blur-xl border border-white/20">
          <h3 className="text-3xl font-bold mb-6 gradient-text">
            今すぐ始めよう
          </h3>
          <p className="text-lg text-gray-700 mb-8">
            VTuberとして活動するなら無料登録。
            <br />
            リスナーとして参加するなら招待コードが必要です。
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push('/signup')}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              新規登録
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-3 glass border-2 border-white/20 rounded-xl font-bold hover:bg-white/50 transition-all"
            >
              ログイン
            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600 border-t border-white/20">
        <div className="flex justify-center gap-6 mb-4">
          <a href="/privacy" className="hover:text-purple-600 transition">
            プライバシーポリシー
          </a>
          <a href="/terms" className="hover:text-purple-600 transition">
            利用規約
          </a>
        </div>
        <p>© 2024 VTuber SNS. All rights reserved.</p>
      </footer>
    </div>
  );
}