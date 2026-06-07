"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AlbumQrCode from "@/components/AlbumQrCode";
import ImageModal from "@/components/ImageModal";
import { STORAGE_BUCKET, supabase } from "@/lib/supabase";

type PreviewImage = {
  id: string;
  file: File;
  url: string;
};

type GalleryImage = {
  id: string;
  name: string;
  url: string;
};

type AlbumViewProps = {
  albumId: string;
};

export default function AlbumView({ albumId }: AlbumViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const loadGallery = useCallback(async () => {
    setIsLoadingGallery(true);
    setGalleryError(null);

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(albumId, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      setGalleryError(error.message);
      setGalleryImages([]);
      setIsLoadingGallery(false);
      return;
    }

    const images: GalleryImage[] = (data ?? [])
      .filter((file) => file.name.includes("."))
      .map((file) => {
        const filePath = `${albumId}/${file.name}`;
        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath);

        return {
          id: file.id ?? filePath,
          name: file.name,
          url: urlData.publicUrl,
        };
      });

    setGalleryImages(images);
    setIsLoadingGallery(false);
  }, [albumId]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    return () => {
      previewImages.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, [previewImages]);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadMessage(null);
    setUploadError(null);

    const newImages: PreviewImage[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages((prev) => [...prev, ...newImages]);
    event.target.value = "";
  };

  const handleRemoveImage = (id: string) => {
    setPreviewImages((prev) => {
      const target = prev.find((image) => image.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((image) => image.id !== id);
    });
  };

  const handleUploadToSupabase = async () => {
    if (previewImages.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadMessage(null);
    setUploadError(null);

    const uploadCount = previewImages.length;

    try {
      for (const image of previewImages) {
        const extension = image.file.name.split(".").pop() ?? "jpg";
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const filePath = `${albumId}/${fileName}`;

        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, image.file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;
      }

      previewImages.forEach((image) => URL.revokeObjectURL(image.url));
      setPreviewImages([]);
      setUploadMessage(`${uploadCount}枚の写真を保存しました！`);
      await loadGallery();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "アップロードに失敗しました。もう一度お試しください。";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full text-center">
        <p className="text-sm text-pink-500 mb-2">Wedding Photo Share</p>

        <h1 className="text-3xl font-bold mb-4">
          プリモさん・パムさんの結婚式
        </h1>

        <p className="text-gray-600 mb-2">
          今日の思い出の写真をここにアップロードしてください
        </p>
        <p className="text-xs text-gray-400 mb-6">アルバム ID: {albumId}</p>

        <AlbumQrCode albumId={albumId} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleSelectClick}
            disabled={isUploading}
            className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-6 py-3 rounded-full font-bold transition-colors"
          >
            写真を選択
          </button>

          {previewImages.length > 0 && (
            <button
              type="button"
              onClick={handleUploadToSupabase}
              disabled={isUploading}
              className="bg-white hover:bg-pink-50 disabled:opacity-50 text-pink-500 border-2 border-pink-500 px-6 py-3 rounded-full font-bold transition-colors"
            >
              {isUploading ? "アップロード中..." : "写真を保存する"}
            </button>
          )}
        </div>

        {uploadMessage && (
          <p className="mt-4 text-sm text-green-600 font-medium">{uploadMessage}</p>
        )}

        {uploadError && (
          <p className="mt-4 text-sm text-red-600 font-medium">{uploadError}</p>
        )}

        {previewImages.length > 0 && (
          <div className="mt-8 text-left">
            <p className="text-sm font-medium text-gray-700 mb-3">
              選択した写真（{previewImages.length}枚）
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previewImages.map((image) => (
                <li key={image.id} className="relative group">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage({
                        url: image.url,
                        name: image.file.name,
                      })
                    }
                    className="w-full block"
                  >
                    <img
                      src={image.url}
                      alt={image.file.name}
                      className="w-full aspect-square object-cover rounded-lg border border-pink-100 cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(image.id)}
                    disabled={isUploading}
                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white text-sm leading-none opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity"
                    aria-label={`${image.file.name} を削除`}
                  >
                    ×
                  </button>
                  <p className="mt-1 text-xs text-gray-500 truncate">
                    {image.file.name}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <section className="mt-10 text-left border-t border-pink-100 pt-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            みんなの写真
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            このアルバムにアップロードされた写真
          </p>

          {isLoadingGallery && (
            <p className="text-sm text-gray-500 text-center py-8">
              写真を読み込み中...
            </p>
          )}

          {galleryError && (
            <p className="text-sm text-red-600 text-center py-8">
              写真の取得に失敗しました: {galleryError}
            </p>
          )}

          {!isLoadingGallery && !galleryError && galleryImages.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">
              まだ写真がありません。最初の1枚をアップロードしてみましょう！
            </p>
          )}

          {!isLoadingGallery && !galleryError && galleryImages.length > 0 && (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {galleryImages.map((image) => (
                <li key={image.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedImage({
                        url: image.url,
                        name: image.name,
                      })
                    }
                    className="w-full block"
                  >
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full aspect-square object-cover rounded-lg border border-pink-100 cursor-pointer hover:opacity-90 transition-opacity"
                      loading="lazy"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          imageName={selectedImage.name}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </main>
  );
}
