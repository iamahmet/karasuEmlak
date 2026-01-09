"use client";

interface ContentSchedulerProps {
  contentId?: string;
  onSchedule?: (date: Date) => void;
  scheduledDate?: Date | string | null;
}

export function ContentScheduler({ contentId, onSchedule, scheduledDate }: ContentSchedulerProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-medium mb-2">Schedule Publication</h3>
      <p className="text-sm text-muted-foreground">
        {scheduledDate ? `Scheduled: ${scheduledDate}` : 'Not scheduled'}
      </p>
    </div>
  );
}
