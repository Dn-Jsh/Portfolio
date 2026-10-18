"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { QrCode, X } from "lucide-react";

type SocialQrButtonProps = {
  platform: string;
  handle: string;
  link: string;
  qrDataUrl: string;
};

export function SocialQrButton({ platform, handle, link, qrDataUrl }: SocialQrButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="social-qr-trigger"
        aria-label={`Show ${platform} QR code`}
        aria-haspopup="dialog"
        title={`Show ${platform} QR code`}
        onClick={() => setIsOpen(true)}
      >
        <QrCode size={19} aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        className="social-qr-dialog"
        aria-labelledby={titleId}
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setIsOpen(false);
        }}
      >
        <div className="social-qr-heading">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Scan to follow</p>
            <h2 id={titleId} className="mt-1 text-lg font-semibold">{platform}</h2>
            <a className="social-qr-account" href={link} target="_blank" rel="noopener noreferrer">{handle}</a>
          </div>
          <button
            type="button"
            className="social-qr-close"
            aria-label={`Close ${platform} QR code`}
            onClick={() => setIsOpen(false)}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="social-qr-surface">
          <Image className="social-qr-image" src={qrDataUrl} alt={`${platform} QR code for ${handle}`} width={512} height={512} unoptimized />
        </div>
      </dialog>
    </>
  );
}
