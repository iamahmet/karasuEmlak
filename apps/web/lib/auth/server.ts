/**
 * Server-side authentication utilities
 * Re-exports from admin auth module for backwards compatibility
 */

export {
  requireStaff,
  getCurrentUser,
  checkStaff,
  type User,
} from "@/lib/admin/auth/server";
