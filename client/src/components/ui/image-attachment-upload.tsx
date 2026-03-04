import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, X, Upload, BarChart3, Loader2 } from "lucide-react";

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const ACCEPTED_EXTENSIONS = ".png,.jpg,.jpeg,.webp";

interface ImageAttachmentUploadProps {
  attachments: string[];
  onAttachmentsChange: (urls: string[]) => void;
  disabled?: boolean;
}

export function ImageAttachmentUpload({
  attachments,
  onAttachmentsChange,
  disabled = false,
}: ImageAttachmentUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PNG, JPEG, or WebP images only.",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Maximum file size is 5MB. "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
        variant: "destructive",
      });
      return null;
    }

    const res = await fetch("/api/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        contentType: file.type,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { uploadURL, objectPath } = await res.json();

    const uploadRes = await fetch(uploadURL, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadRes.ok) {
      throw new Error("Failed to upload file");
    }

    return objectPath;
  }, [toast]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remaining = MAX_ATTACHMENTS - attachments.length;

    if (remaining <= 0) {
      toast({
        title: "Attachment limit reached",
        description: `Maximum ${MAX_ATTACHMENTS} attachments allowed.`,
        variant: "destructive",
      });
      return;
    }

    const filesToUpload = fileArray.slice(0, remaining);
    if (fileArray.length > remaining) {
      toast({
        title: "Some files skipped",
        description: `Only ${remaining} more attachment(s) can be added.`,
      });
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of filesToUpload) {
        const url = await uploadFile(file);
        if (url) {
          newUrls.push(url);
        }
      }

      if (newUrls.length > 0) {
        onAttachmentsChange([...attachments, ...newUrls]);
        toast({
          title: `${newUrls.length} visualization${newUrls.length > 1 ? "s" : ""} attached`,
          description: "Your charts will be included in the AI evaluation.",
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload one or more files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }, [attachments, onAttachmentsChange, uploadFile, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    handleFiles(e.dataTransfer.files);
  }, [disabled, uploading, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    const updated = attachments.filter((_, i) => i !== index);
    onAttachmentsChange(updated);
  }, [attachments, onAttachmentsChange]);

  return (
    <div className="space-y-3" data-testid="image-attachment-upload">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
          Supporting Visualizations
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
        </label>
        <span className="text-xs text-muted-foreground">
          {attachments.length} of {MAX_ATTACHMENTS} attachments
        </span>
      </div>

      <div className="bg-emerald-500/5 rounded-md p-3 border border-emerald-500/20">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Attach charts, tables, or visualizations</strong> to strengthen your analysis.
          Export charts from Excel, Google Sheets, or any tool as images. The AI evaluator will consider your
          visualizations when scoring Evidence Quality and Reasoning Coherence.
        </p>
        <p className="text-xs text-muted-foreground mt-1 italic">
          Tip: Place charts where they support your argument — a well-chosen visualization is as strong as citing statistics.
        </p>
      </div>

      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {attachments.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group rounded-lg border bg-muted/30 overflow-hidden aspect-[4/3]"
              data-testid={`attachment-preview-${index}`}
            >
              <img
                src={url}
                alt={`Attachment ${index + 1}`}
                className="w-full h-full object-contain p-1"
                loading="lazy"
              />
              {!disabled && (
                <button
                  onClick={() => removeAttachment(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`button-remove-attachment-${index}`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                <span className="text-[10px] text-white">Chart {index + 1}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {attachments.length < MAX_ATTACHMENTS && !disabled && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/20 hover:border-muted-foreground/40"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone-image-upload"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
            data-testid="input-file-upload"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-muted-foreground" />
                <Upload className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Drag & drop images or{" "}
                  <span className="text-primary underline">browse</span>
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground/60">
                PNG, JPEG, or WebP — max 5MB each
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
