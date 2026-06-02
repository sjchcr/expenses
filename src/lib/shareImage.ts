import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { toPng } from "html-to-image";

export type ShareImageResult = "shared" | "downloaded" | "cancelled";

interface ShareElementAsImageOptions {
  element: HTMLElement;
  filename: string;
  title: string;
  text?: string;
}

function dataUrlToBase64(dataUrl: string) {
  return dataUrl.split(",")[1] || "";
}

async function dataUrlToFile(dataUrl: string, filename: string) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: "image/png" });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function shareElementAsImage({
  element,
  filename,
  title,
  text,
}: ShareElementAsImageOptions): Promise<ShareImageResult> {
  const dataUrl = await toPng(element, { pixelRatio: 3 });

  if (Capacitor.isNativePlatform()) {
    const result = await Filesystem.writeFile({
      path: filename,
      data: dataUrlToBase64(dataUrl),
      directory: Directory.Cache,
    });

    await Share.share({
      title,
      text,
      url: result.uri,
    });

    return "shared";
  }

  const file = await dataUrlToFile(dataUrl, filename);
  const shareData: ShareData = {
    title,
    text,
    files: [file],
  };

  if (navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      throw error;
    }
  }

  downloadDataUrl(dataUrl, filename);
  return "downloaded";
}
