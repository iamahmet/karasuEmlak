import { createServiceClient } from '../supabase/service';
import { logAuditEvent } from '../audit';

/**
 * Publish content item
 * 
 * @param contentId - Content item ID
 * @param userId - User ID who is publishing
 * @returns Promise<void>
 */
export async function publishContent(contentId: string, userId: string): Promise<void> {
  const supabase = createServiceClient();

  // Update content status to published
  const { error } = await supabase
    .from('content_items')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  if (error) {
    throw new Error(`Failed to publish content: ${error.message}`);
  }

  // Log audit event
  await logAuditEvent({
    type: 'content.published',
    user_id: userId,
    resource_type: 'content_item',
    resource_id: contentId,
  });
}

/**
 * Schedule content for publishing
 * 
 * @param contentId - Content item ID
 * @param publishAt - Scheduled publish date
 * @param userId - User ID who is scheduling
 * @returns Promise<void>
 */
export async function scheduleContent(
  contentId: string,
  publishAt: Date,
  userId: string
): Promise<void> {
  const supabase = createServiceClient();

  // Update content with scheduled publish date
  const { error } = await supabase
    .from('content_items')
    .update({
      status: 'scheduled',
      scheduled_publish_at: publishAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  if (error) {
    throw new Error(`Failed to schedule content: ${error.message}`);
  }

  // Log audit event
  await logAuditEvent({
    type: 'content.updated',
    user_id: userId,
    resource_type: 'content_item',
    resource_id: contentId,
    metadata: {
      scheduled_publish_at: publishAt.toISOString(),
    },
  });
}

/**
 * Unpublish content
 * 
 * @param contentId - Content item ID
 * @param userId - User ID who is unpublishing
 * @returns Promise<void>
 */
export async function unpublishContent(contentId: string, userId: string): Promise<void> {
  const supabase = createServiceClient();

  // Update content status to draft
  const { error } = await supabase
    .from('content_items')
    .update({
      status: 'draft',
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', contentId);

  if (error) {
    throw new Error(`Failed to unpublish content: ${error.message}`);
  }

  // Log audit event
  await logAuditEvent({
    type: 'content.updated',
    user_id: userId,
    resource_type: 'content_item',
    resource_id: contentId,
    metadata: {
      action: 'unpublished',
    },
  });
}

