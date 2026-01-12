'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="glass sticky top-0 z-10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2.5 hover:bg-white/50 rounded-xl transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold gradient-text">利用規約</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="glass rounded-3xl shadow-xl p-8 backdrop-blur-xl border border-white/20">
          <div className="prose prose-gray max-w-none">
            <h2 className="text-2xl font-bold mb-4">利用規約</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3">第1条（適用）</h3>
            <p className="text-gray-700 mb-4">
              本規約は、本サービスの提供条件及び本サービスの利用に関する当運営者とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当運営者との間の本サービスの利用に関わる一切の関係に適用されます。
            </p>

            <h3 className="text-xl font-bold mt-6 mb-3">第2条（禁止事項）</h3>
            <p className="text-gray-700 mb-4">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>他のユーザーまたは第三者の権利を侵害する行為</li>
              <li>本サービスの運営を妨害する行為</li>
              <li>不正アクセス行為</li>
              <li>虚偽の情報を登録する行為</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">第3条（本サービスの停止等）</h3>
            <p className="text-gray-700 mb-4">
              当運営者は、以下のいずれかに該当する場合には、ユーザーに事前に通知することなく、本サービスの全部または一部の提供を停止または中断することができます。
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>本サービスに係るシステムの点検または保守作業を行う場合</li>
              <li>コンピューター、通信回線等が事故により停止した場合</li>
              <li>その他、当運営者が停止または中断を必要と判断した場合</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3">第4条（免責事項）</h3>
            <p className="text-gray-700 mb-4">
              当運営者は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
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