"use client";

interface ContentHistoryProps {
  contentId: string;
  onRevert?: (versionId: string) => void;
}

export function ContentHistory({ contentId, onRevert }: ContentHistoryProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Content History</h3>
      <p className="text-sm text-muted-foreground">
        History for content ID: {contentId}
      </p>
    </div>
  );
}
