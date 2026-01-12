'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="glass sticky top-0 z-10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 hover:bg-white/50 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold gradient-text">プライバシーポリシー</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass rounded-3xl shadow-xl p-8 backdrop-blur-xl border border-white/20">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold mb-4">個人情報の取り扱いについて</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3">1. 収集する情報</h3>
            <p className="text-gray-700 mb-4">
              当サイトでは、サービス提供のために以下の情報を収集します：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>メールアドレス</li>
              <li>ユーザー名</li>
              <li>表示名</li>
              <li>プロフィール情報</li>
              <li>投稿内容</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">2. 情報の利用目的</h3>
            <p className="text-gray-700 mb-4">
              収集した情報は以下の目的で利用します：
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>サービスの提供・運営</li>
              <li>ユーザー認証</li>
              <li>お問い合わせ対応</li>
              <li>サービス改善</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">3. Cookie・広告について</h3>
            <p className="text-gray-700 mb-4">
              当サイトでは、Google AdSenseを使用しており、Cookieを使用した広告配信を行っています。
              Cookieを無効にする方法やGoogle AdSenseに関する詳細は、
              <a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                Googleのポリシー
              </a>
              をご覧ください。
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">4. 第三者への開示</h3>
            <p className="text-gray-700 mb-4">
              法令に基づく場合を除き、ユーザーの同意なく第三者に個人情報を開示することはありません。
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">5. お問い合わせ</h3>
            <p className="text-gray-700 mb-4">
              プライバシーポリシーに関するお問い合わせは、サイト内のお問い合わせフォームよりご連絡ください。
            </p>

            <p className="text-gray-500 text-sm mt-8">
              最終更新日: {new Date().toLocaleDateString('ja-JP')}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}