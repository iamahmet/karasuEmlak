import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { createClient } from '@supabase/supabase-js';

/**
 * Update/Delete Saved Search API
 * PATCH /api/searches/[id] - Update search
 * DELETE /api/searches/[id] - Delete search
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, frequency, email_notifications, push_notifications, filters, is_active } = body;

    const supabase = createServiceClient();

    // Get user_id if authenticated
    let user_id: string | null = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).auth.getUser(token);
        if (user) {
          user_id = user.id;
        }
      }
    } catch {
      // Not authenticated
    }

    // Check if search exists and user has permission
    const { data: existing } = await supabase
      .from('saved_searches')
      .select('id, user_id, email')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kayıtlı arama bulunamadı' },
        { status: 404 }
      );
    }

    // Check permission
    if (user_id && existing.user_id !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Update search
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (filters !== undefined) updateData.filters = filters;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('saved_searches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating saved search:', error);
      return NextResponse.json(
        { success: false, error: 'Kayıtlı arama güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kayıtlı arama güncellendi',
      data: updated,
    });
  } catch (error: any) {
    console.error('Saved search update API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = createServiceClient();

    // Get user_id if authenticated
    let user_id: string | null = null;
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        ).auth.getUser(token);
        if (user) {
          user_id = user.id;
        }
      }
    } catch {
      // Not authenticated
    }

    // Check if search exists and user has permission
    const { data: existing } = await supabase
      .from('saved_searches')
      .select('id, user_id, email')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Kayıtlı arama bulunamadı' },
        { status: 404 }
      );
    }

    // Check permission
    if (user_id && existing.user_id !== user_id) {
      return NextResponse.json(
        { success: false, error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Delete search (mark as inactive)
    const { error } = await supabase
      .from('saved_searches')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting saved search:', error);
      return NextResponse.json(
        { success: false, error: 'Kayıtlı arama silinemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kayıtlı arama silindi',
    });
  } catch (error: any) {
    console.error('Saved search delete API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
