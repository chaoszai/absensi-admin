"use client";

export default function PhotoModal({
  open,
  src,
  title,
  onClose,
}: {
  open: boolean;
  src?: string | null;
  title?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-bold text-slate-900">
            {title ?? "Preview Foto"}
          </p>
          <button
            onClick={onClose}
            className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex justify-center p-6">
          {src ? (
            <div className="rounded-xl bg-white p-2 shadow ring-1 ring-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt="preview"
                className="h-40 w-40 rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="py-10 text-sm text-slate-500">
              Tidak ada foto
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
