"use client";

import { useParams } from "next/navigation";
import AlbumView from "@/components/AlbumView";

export default function AlbumPage() {
  const params = useParams();
  const albumId = params.albumId as string;

  return <AlbumView albumId={albumId} />;
}
