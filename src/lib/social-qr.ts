import QRCode from "qrcode";

export function createSocialQrDataUrl(link: string): Promise<string> {
  return QRCode.toDataURL(link, {
    width: 512,
    margin: 4,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#00000000" },
  });
}
