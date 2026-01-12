import './globals.css' // この行を追加してスタイルを読み込みます

export const metadata = {
  title: 'VTuber専用SNS',
  description: 'VTuberとリスナーのためのクローズドコミュニティ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased text-slate-100 bg-slate-950">
        {children}
      </body>
    </html>
  )
}