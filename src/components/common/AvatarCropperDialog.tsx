import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AvatarCropperDialogProps {
  file: File;
  previewUrl: string;
  open: boolean;
  onCancel: () => void;
  onComplete: (croppedFile: File) => void;
}

const CROP_SIZE = 256;

function clamp(value: number, min: number, max: number) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function getOutputType(inputType: string): { type: string; extension: string } {
  switch (inputType) {
    case "image/png":
      return { type: "image/png", extension: "png" };
    case "image/webp":
      return { type: "image/webp", extension: "webp" };
    case "image/gif":
      // Canvas will flatten the animation, export as PNG for best fidelity
      return { type: "image/png", extension: "png" };
    default:
      return { type: "image/jpeg", extension: "jpg" };
  }
}

function replaceExtension(fileName: string, extension: string) {
  const baseName = fileName.includes(".")
    ? fileName.slice(0, fileName.lastIndexOf("."))
    : fileName;
  return `${baseName}-cropped.${extension}`;
}

export function AvatarCropperDialog({
  file,
  previewUrl,
  open,
  onCancel,
  onComplete,
}: AvatarCropperDialogProps) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const pointerState = useRef({
    isDragging: false,
    origin: { x: 0, y: 0 },
    startOffset: { x: 0, y: 0 },
  });

  useEffect(() => {
    if (!open) return;
    const img = new Image();
    img.src = previewUrl;
    img.onload = () => {
      setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImageEl(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    img.onerror = () => {
      setImageSize(null);
      setImageEl(null);
    };
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [previewUrl, open]);

  const baseScale = useMemo(() => {
    if (!imageSize) return 1;
    const widthScale = CROP_SIZE / imageSize.width;
    const heightScale = CROP_SIZE / imageSize.height;
    return Math.max(widthScale, heightScale);
  }, [imageSize]);

  const scale = baseScale * zoom;

  const maxOffset = useMemo(() => {
    if (!imageSize) return { x: 0, y: 0 };
    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    return {
      x: Math.max(0, (scaledWidth - CROP_SIZE) / 2),
      y: Math.max(0, (scaledHeight - CROP_SIZE) / 2),
    };
  }, [imageSize, scale]);

  useEffect(() => {
    setOffset((current) => ({
      x: clamp(current.x, -maxOffset.x, maxOffset.x),
      y: clamp(current.y, -maxOffset.y, maxOffset.y),
    }));
  }, [maxOffset.x, maxOffset.y]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!pointerState.current.isDragging) return;
      event.preventDefault();
      const deltaX = event.clientX - pointerState.current.origin.x;
      const deltaY = event.clientY - pointerState.current.origin.y;
      setOffset({
        x: clamp(
          pointerState.current.startOffset.x + deltaX,
          -maxOffset.x,
          maxOffset.x,
        ),
        y: clamp(
          pointerState.current.startOffset.y + deltaY,
          -maxOffset.y,
          maxOffset.y,
        ),
      });
    };

    const handlePointerUp = () => {
      pointerState.current.isDragging = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [maxOffset.x, maxOffset.y]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    pointerState.current.isDragging = true;
    pointerState.current.origin = { x: event.clientX, y: event.clientY };
    pointerState.current.startOffset = { ...offset };
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZoom(Number(event.target.value));
  };

  const createCroppedFile = async () => {
    if (!imageEl || !imageSize) return null;
    const canvas = document.createElement("canvas");
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const scaledWidth = imageSize.width * scale;
    const scaledHeight = imageSize.height * scale;
    const dx = (CROP_SIZE - scaledWidth) / 2 + offset.x;
    const dy = (CROP_SIZE - scaledHeight) / 2 + offset.y;

    ctx.clearRect(0, 0, CROP_SIZE, CROP_SIZE);
    ctx.drawImage(imageEl, dx, dy, scaledWidth, scaledHeight);

    const { type, extension } = getOutputType(file.type);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (result) => {
          resolve(result);
        },
        type,
        type === "image/jpeg" ? 0.92 : undefined,
      );
    });

    if (!blob) return null;

    const croppedFile = new File([blob], replaceExtension(file.name, extension), {
      type,
      lastModified: Date.now(),
    });
    return croppedFile;
  };

  const handleApply = async () => {
    setIsProcessing(true);
    const cropped = await createCroppedFile();
    setIsProcessing(false);
    if (!cropped) {
      toast.error(t("settings.avatarCropFailed"));
      return;
    }
    onComplete(cropped);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !isProcessing) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("settings.adjustAvatarTitle")}</DialogTitle>
          <DialogDescription>
            {t("settings.adjustAvatarDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className="relative w-64 h-64 rounded-full overflow-hidden border border-border bg-muted cursor-move select-none"
              onPointerDown={handlePointerDown}
            >
              <div className="absolute inset-0 pointer-events-none border border-white/40 rounded-full" />
              {imageSize ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="absolute top-1/2 left-1/2 pointer-events-none select-none"
                  style={{
                    width: imageSize.width,
                    height: imageSize.height,
                    maxWidth: "none",
                    transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    transformOrigin: "center",
                    willChange: "transform",
                  }}
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("settings.dragToReposition")}
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t("settings.zoom")}</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={handleZoomChange}
            />
          </label>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleApply}
            disabled={!imageSize || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("settings.applyCrop")}
              </>
            ) : (
              t("settings.applyCrop")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
