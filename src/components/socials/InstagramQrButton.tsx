"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, QrCode, X } from "lucide-react";

export function InstagramQrButton() {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

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
        aria-label="Show Instagram QR code"
        aria-haspopup="dialog"
        title="Show Instagram QR code"
        onClick={() => setIsOpen(true)}
      >
        <QrCode size={19} aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        className="instagram-qr-dialog"
        aria-labelledby="instagram-qr-title"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === dialogRef.current) setIsOpen(false);
        }}
      >
        <div className="instagram-qr-heading">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Scan to follow</p>
            <h2 id="instagram-qr-title" className="mt-1 text-lg font-semibold">Instagram</h2>
            <p className="mt-0.5 text-sm text-muted">@dn_jsh</p>
          </div>
          <button
            type="button"
            className="instagram-qr-close"
            aria-label="Close Instagram QR code"
            autoFocus
            onClick={() => setIsOpen(false)}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <Image
          className="instagram-qr-image"
          src="/socials/instagram-dn-jsh-qr.jpg"
          alt="Instagram QR code for @DN_JSH"
          width={1812}
          height={1454}
          sizes="(max-width: 560px) 90vw, 480px"
        />

        <a
          className="instagram-qr-profile"
          href="https://www.instagram.com/dn_jsh?stkn=M2diNm1jenQwamN1"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open @dn_jsh <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </dialog>
    </>
  );
}
