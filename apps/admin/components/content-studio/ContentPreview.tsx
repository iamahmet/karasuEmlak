"use client";

import { useState } from "react";
import { Button } from "@karasu/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@karasu/ui";
import { Eye, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@karasu/lib";

interface ContentPreviewProps {
  content: {
    title: string;
    content: string;
    excerpt?: string;
    metaDescription?: string;
    featuredImage?: string;
    locale: string;
  };
  className?: string;
}

export function ContentPreview({ content, className }: ContentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 px-3 text-sm border border-border/40 dark:border-border/40 rounded-lg font-ui hover-scale",
            className
          )}
        >
          <Eye className="h-4 w-4 mr-2" />
          Önizle
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-xl border border-border/40 dark:border-border/40",
          isFullscreen && "max-w-[95vw] max-h-[95vh]"
        )}
      >
        <DialogHeader className="px-6 py-4 border-b border-border/40 dark:border-border/40 bg-gradient-to-r from-design-light/5 to-transparent">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-display font-bold text-foreground">
              İçerik Önizleme
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 w-8 rounded-lg hover-scale"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg hover-scale"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-modern p-6 bg-white dark:bg-card">
          {/* Article Preview */}
          <article className="max-w-3xl mx-auto">
            {/* Featured Image */}
            {content.featuredImage && (
              <div className="mb-8 rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={content.featuredImage}
                  alt={content.title}
                  className="w-full h-auto"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              {content.title}
            </h1>

            {/* Meta Description */}
            {content.metaDescription && (
              <p className="text-lg text-muted-foreground mb-6 font-ui italic">
                {content.metaDescription}
              </p>
            )}

            {/* Excerpt */}
            {content.excerpt && (
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-design-light/10 to-transparent border-l-4 border-design-light">
                <p className="text-lg text-foreground font-ui font-medium">
                  {content.excerpt}
                </p>
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg prose-slate dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-design-dark dark:prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:font-semibold prose-strong:text-foreground
                prose-ul:my-6 prose-ul:pl-6
                prose-ol:my-6 prose-ol:pl-6
                prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-design-light prose-blockquote:pl-6 prose-blockquote:italic
                prose-img:rounded-lg prose-img:shadow-md
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                prose-pre:bg-muted prose-pre:rounded-lg"
              dangerouslySetInnerHTML={{ __html: content.content }}
            />
          </article>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 dark:border-border/40 bg-gradient-to-r from-design-light/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground font-ui">
              Locale: <span className="font-semibold text-foreground">{content.locale.toUpperCase()}</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              className="h-9 px-4 bg-design-dark hover:bg-primary/90/90 text-white rounded-lg font-ui hover-scale micro-bounce"
            >
              Kapat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

