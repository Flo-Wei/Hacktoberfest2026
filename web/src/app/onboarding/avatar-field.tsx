"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { CircleAlertIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { Crab } from "@/components/crab";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const MAX_BYTES = 10 * 1024 * 1024;
const OUTPUT_SIZE = 256;
const ACCEPTED = ["image/png", "image/jpeg"];

type AvatarFieldProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

// Crops to a small square so the photo fits in a text column on the profile.
async function toSquareJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available");

  // JPEG has no transparency, so see-through PNGs would otherwise turn black.
  context.fillStyle = "white";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );
  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.82);
}

export function AvatarField({ value, onChange }: AvatarFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLButtonElement>(null);
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(file: File | undefined) {
    if (!file || processing) return;

    if (!ACCEPTED.includes(file.type)) {
      setError("That file isn't a PNG or JPG. Please choose a PNG or JPG photo.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That photo is over 10MB. Please choose one under 10MB.");
      return;
    }

    setError(null);
    setProcessing(true);
    try {
      onChange(await toSquareJpeg(file));
    } catch {
      setError("We couldn't read that photo. Please try a different PNG or JPG.");
    } finally {
      setProcessing(false);
    }
  }

  function remove() {
    onChange(null);
    setError(null);
    uploadRef.current?.focus();
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files[0]);
  }

  function handleDragLeave(event: DragEvent) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        data-dragging={dragging || undefined}
        aria-busy={processing || undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 transition-colors duration-150 data-dragging:border-primary data-dragging:bg-selected"
      >
        <Avatar className="size-12">
          {value && !processing && (
            <AvatarImage key={value} src={value} alt="Your photo" className="onboard-appear object-cover" />
          )}
          <AvatarFallback className="bg-selected">
            <Crab size={processing ? 24 : 40} walking={processing} />
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-36 flex-1 flex-col">
          <p className="text-sm font-medium">Your photo</p>
          <p className="text-sm text-muted-foreground">Optional. PNG or JPG up to 10MB.</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {value && (
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove photo" onClick={remove}>
              <Trash2Icon />
            </Button>
          )}
          <Button
            ref={uploadRef}
            type="button"
            variant="outline"
            size="sm"
            disabled={processing}
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon />
            {value ? "Replace" : "Upload"}
          </Button>
        </div>
        <label htmlFor={inputId} className="sr-only">
          Upload your photo
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED.join(",")}
          tabIndex={-1}
          className="sr-only"
          onChange={(event) => {
            choose(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-destructive">
          <CircleAlertIcon aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        There are no passwords yet, so pick a photo you&apos;re happy to share.
      </p>
    </div>
  );
}
