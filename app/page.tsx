import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <p className="text-sm text-pink-500 mb-2">Wedding Photo Share</p>

        <h1 className="text-3xl font-bold mb-4">
          結婚式フォト共有
        </h1>

        <p className="text-gray-600 mb-6">
          結婚式ごとに専用のアルバムURLをお使いください。
          QRコードには次の形式のURLを設定します。
        </p>

        <p className="bg-pink-50 text-pink-600 text-sm font-mono px-4 py-3 rounded-lg mb-8">
          /album/あなたのalbumId
        </p>

        <Link
          href="/album/abc123"
          className="inline-block bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full font-bold transition-colors"
        >
          サンプルアルバムを見る
        </Link>
      </div>
    </main>
  );
}
