"use client";

import { useRef, useEffect, useState } from "react";
import { Label } from "@karasu/ui";
import { cn } from "@karasu/lib";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@karasu/ui";
import { MediaLibrary } from "@/components/content-studio/MediaLibrary";
import { Link2, Image as ImageIcon, X, FolderOpen, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Quote, Undo, Redo, Type } from "lucide-react";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

// Toolbar Media Library Button Component
function ToolbarMediaLibraryButton({ onSelect }: { onSelect: (url: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="px-2 py-1 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui flex items-center gap-1"
          title="Medya Kütüphanesi"
        >
          <FolderOpen className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-xl">
        <DialogHeader className="px-6 py-4 border-b border-[#E7E7E7] dark:border-[#062F28]">
          <DialogTitle className="text-lg font-display font-bold text-design-dark dark:text-white">
            Medya Kütüphanesi
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto scrollbar-modern p-6">
          <MediaLibrary
            onSelect={(media) => {
              const url = typeof media === 'string' ? media : media.url;
              onSelect(url);
              setIsOpen(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  label,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle keyboard shortcuts
    if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      document.execCommand("bold", false);
      handleInput();
    }
    if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      document.execCommand("italic", false);
      handleInput();
    }
    if (e.key === "u" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      document.execCommand("underline", false);
      handleInput();
    }
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.toString()) {
        setLinkText(selection.toString());
        setShowLinkDialog(true);
      }
    }
    // Undo/Redo
    if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
      e.preventDefault();
      document.execCommand("undo", false);
      handleInput();
    }
    if (e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
      e.preventDefault();
      document.execCommand("redo", false);
      handleInput();
    }
  };

  const insertImage = (url: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      range.insertNode(img);
      onChange(editorRef.current.innerHTML);
    } else {
      // Insert at cursor position
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      editorRef.current.appendChild(img);
      onChange(editorRef.current.innerHTML);
    }
    toast.success("Görsel eklendi");
  };

  const insertLink = () => {
    if (!linkUrl.trim()) {
      toast.error("Lütfen bir URL girin");
      return;
    }

    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const link = document.createElement("a");
      link.href = linkUrl;
      link.textContent = linkText || linkUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      
      if (!range.collapsed) {
        range.deleteContents();
      }
      range.insertNode(link);
      onChange(editorRef.current.innerHTML);
      setShowLinkDialog(false);
      setLinkUrl("");
      setLinkText("");
      toast.success("Link eklendi");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="text-xs font-ui font-semibold text-design-gray dark:text-gray-400">
          {label}
        </Label>
      )}
      <div className="border border-[#E7E7E7] dark:border-[#062F28] rounded-lg bg-white dark:bg-[#0a3d35] relative">
        {/* Enhanced Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-[#E7E7E7] dark:border-[#062F28] flex-wrap bg-gray-50 dark:bg-gray-900/30">
          {/* Text Formatting */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                document.execCommand("bold", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm font-bold rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Bold (⌘B)"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("italic", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm italic rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Italic (⌘I)"
            >
              I
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("underline", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm underline rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Underline (⌘U)"
            >
              U
            </button>
          </div>
          
          <div className="w-px h-6 bg-[#E7E7E7] dark:bg-[#062F28] mx-1" />
          
          {/* Headings */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                document.execCommand("formatBlock", false, "h1");
                handleInput();
              }}
              className="px-2 py-1.5 text-xs font-semibold rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Başlık 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("formatBlock", false, "h2");
                handleInput();
              }}
              className="px-2 py-1.5 text-xs font-semibold rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Başlık 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("formatBlock", false, "h3");
                handleInput();
              }}
              className="px-2 py-1.5 text-xs font-semibold rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Başlık 3"
            >
              H3
            </button>
          </div>
          
          <div className="w-px h-6 bg-[#E7E7E7] dark:bg-[#062F28] mx-1" />
          
          {/* Lists */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                document.execCommand("insertUnorderedList", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Bullet List"
            >
              •
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("insertOrderedList", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Numbered List"
            >
              1.
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("formatBlock", false, "blockquote");
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui flex items-center"
              title="Quote"
            >
              <Quote className="h-3 w-3" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-[#E7E7E7] dark:bg-[#062F28] mx-1" />
          
          {/* Alignment */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                document.execCommand("justifyLeft", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Sola Hizala"
            >
              ⬅
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("justifyCenter", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui"
              title="Ortala"
            >
              ⬌
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("justifyRight", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui flex items-center"
              title="Sağa Hizala"
            >
              <AlignRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-[#E7E7E7] dark:bg-[#062F28] mx-1" />
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                document.execCommand("undo", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui flex items-center"
              title="Geri Al (⌘Z)"
            >
              <Undo className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => {
                document.execCommand("redo", false);
                handleInput();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui flex items-center"
              title="Yinele (⌘⇧Z)"
            >
              <Redo className="h-3 w-3" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-[#E7E7E7] dark:bg-[#062F28] mx-1" />
          
          {/* Link & Media */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                const selection = window.getSelection();
                if (selection && selection.toString()) {
                  setLinkText(selection.toString());
                }
                setShowLinkDialog(true);
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui flex items-center gap-1"
              title="Insert Link (⌘K)"
            >
              <Link2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                // Trigger image upload
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  
                  const formData = new FormData();
                  formData.append("file", file);
                  
                  try {
                    const response = await fetch("/api/upload/image", {
                      method: "POST",
                      body: formData,
                    });
                    
                    const data = await response.json();
                    if (data.url) {
                      insertImage(data.url);
                    } else {
                      toast.error("Görsel yüklenemedi");
                    }
                  } catch (error) {
                    console.error("Upload error:", error);
                    toast.error("Görsel yüklenemedi");
                  }
                };
                input.click();
              }}
              className="px-2 py-1.5 text-sm rounded hover:bg-design-light/10 dark:hover:bg-design-light/5 transition-colors font-ui flex items-center gap-1"
              title="Görsel Yükle"
            >
              <ImageIcon className="h-3.5 w-3.5" />
            </button>
            <ToolbarMediaLibraryButton onSelect={insertImage} />
          </div>
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-[#0a3d35] border border-[#E7E7E7] dark:border-[#062F28] rounded-lg p-3 shadow-lg z-50 mt-1">
            <div className="space-y-2">
              <div>
                <label className="text-xs font-ui font-semibold mb-1 block">Link Metni</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded bg-white dark:bg-[#0a3d35] text-design-dark dark:text-white"
                  placeholder="Link metni"
                />
              </div>
              <div>
                <label className="text-xs font-ui font-semibold mb-1 block">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-[#E7E7E7] dark:border-[#062F28] rounded bg-white dark:bg-[#0a3d35] text-design-dark dark:text-white"
                  placeholder="https://..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      insertLink();
                    }
                    if (e.key === "Escape") {
                      setShowLinkDialog(false);
                    }
                  }}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkDialog(false);
                    setLinkUrl("");
                    setLinkText("");
                  }}
                  className="px-3 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  className="px-3 py-1 text-xs bg-design-light text-white rounded hover:bg-design-dark transition-colors"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className="min-h-[200px] p-4 text-sm text-design-dark dark:text-white focus:outline-none font-ui"
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #7b7b7b;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

