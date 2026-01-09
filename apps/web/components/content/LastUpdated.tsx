/**
 * Last Updated Component
 * Displays last update date for content pages
 */

interface LastUpdatedProps {
  date: string | Date;
  className?: string;
}

export function LastUpdated({ date, className = '' }: LastUpdatedProps) {
  const updateDate = typeof date === 'string' ? new Date(date) : date;
  const formattedDate = updateDate.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`text-sm text-gray-500 ${className}`}>
      <span>Son güncelleme: </span>
      <time dateTime={updateDate.toISOString()}>
        {formattedDate}
      </time>
    </div>
  );
}
