"use client";

import { useEffect } from "react";

type ImageModalProps = {
  imageUrl: string;
  imageName: string;
  onClose: () => void;
};

export default function ImageModal({
  imageUrl,
  imageName,
  onClose,
}: ImageModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${imageName} の拡大表示`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-2xl leading-none transition-colors"
        aria-label="閉じる"
      >
        ×
      </button>

      <img
        src={imageUrl}
        alt={imageName}
        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}
