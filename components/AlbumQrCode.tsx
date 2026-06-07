"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

type AlbumQrCodeProps = {
  albumId: string;
};

export default function AlbumQrCode({ albumId }: AlbumQrCodeProps) {
  const [albumUrl, setAlbumUrl] = useState("");

  useEffect(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin;
    setAlbumUrl(`${baseUrl}/album/${albumId}`);
  }, [albumId]);

  if (!albumUrl) return null;

  return (
    <section className="mb-8 p-6 bg-pink-50 rounded-xl text-center">
      <h2 className="text-lg font-bold text-gray-800 mb-1">
        アルバムQRコード
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        ゲストにスキャンしてもらうと、このアルバムにアクセスできます
      </p>

      <div className="inline-block p-4 bg-white rounded-lg border border-pink-100">
        <QRCode
          value={albumUrl}
          size={180}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
        />
      </div>

      <p className="mt-4 text-xs text-gray-500 break-all">{albumUrl}</p>
    </section>
  );
}
