/**
 * Background Sync Service for PWA
 * Handles offline form submissions and data synchronization
 */

import { safeJsonParse } from '@/lib/utils/safeJsonParse';

export interface BackgroundSyncTask {
  id: string;
  type: 'form_submission' | 'favorite' | 'search' | 'contact';
  data: Record<string, any>;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  timestamp: number;
}

const SYNC_TASKS_STORAGE_KEY = 'karasu-emlak-sync-tasks';

/**
 * Register a background sync task
 */
export async function registerBackgroundSync(
  task: Omit<BackgroundSyncTask, 'id' | 'timestamp'>
): Promise<string> {
  if (!('serviceWorker' in navigator) || !('sync' in (ServiceWorkerRegistration.prototype as any))) {
    // Fallback: Store in localStorage for manual sync
    return storeSyncTask(task);
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const tag = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store task in localStorage as backup
    const taskId = storeSyncTask(task);

    // Register background sync
    await (registration as any).sync.register(tag);

    return taskId;
  } catch (error) {
    console.error('Error registering background sync:', error);
    // Fallback to localStorage
    return storeSyncTask(task);
  }
}

/**
 * Store sync task in localStorage
 */
function storeSyncTask(task: Omit<BackgroundSyncTask, 'id' | 'timestamp'>): string {
  const tasks = getStoredSyncTasks();
  const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const fullTask: BackgroundSyncTask = {
    id: taskId,
    ...task,
    timestamp: Date.now(),
  };

  tasks.push(fullTask);
  localStorage.setItem(SYNC_TASKS_STORAGE_KEY, JSON.stringify(tasks));

  return taskId;
}

/**
 * Get stored sync tasks
 */
export function getStoredSyncTasks(): BackgroundSyncTask[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(SYNC_TASKS_STORAGE_KEY);
    if (!stored) return [];
    return safeJsonParse(stored, [], {
      context: 'background-sync.tasks',
      dedupeKey: 'background-sync.tasks',
    });
  } catch {
    return [];
  }
}

/**
 * Remove sync task after successful sync
 */
export function removeSyncTask(taskId: string): void {
  const tasks = getStoredSyncTasks();
  const filtered = tasks.filter(t => t.id !== taskId);
  localStorage.setItem(SYNC_TASKS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Process all pending sync tasks
 */
export async function processPendingSyncTasks(): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const tasks = getStoredSyncTasks();
  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const task of tasks) {
    try {
      const response = await fetch(task.url, {
        method: task.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task.data),
      });

      if (response.ok) {
        removeSyncTask(task.id);
        success++;
      } else {
        failed++;
        errors.push(`Task ${task.id}: ${response.statusText}`);
      }
    } catch (error: any) {
      failed++;
      errors.push(`Task ${task.id}: ${error.message}`);
    }
  }

  return { success, failed, errors };
}

/**
 * Check if online and process tasks
 */
export async function syncWhenOnline(): Promise<void> {
  if (!navigator.onLine) {
    return;
  }

  const tasks = getStoredSyncTasks();
  if (tasks.length === 0) {
    return;
  }

  const result = await processPendingSyncTasks();
  
  if (result.success > 0) {
    console.log(`✅ ${result.success} sync task(s) completed`);
  }
  
  if (result.failed > 0) {
    console.warn(`⚠️ ${result.failed} sync task(s) failed:`, result.errors);
  }
}

/**
 * Initialize background sync listeners
 */
export function initBackgroundSync(): void {
  if (typeof window === 'undefined') return;

  // Listen for online event
  window.addEventListener('online', () => {
    console.log('🟢 Online - Processing pending sync tasks...');
    syncWhenOnline();
  });

  // Try to sync on load if online
  if (navigator.onLine) {
    syncWhenOnline();
  }
}
