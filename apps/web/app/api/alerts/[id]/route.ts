import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { createClient } from '@supabase/supabase-js';

/**
 * Update/Delete Price Alert API
 * PATCH /api/alerts/[id] - Update alert
 * DELETE /api/alerts/[id] - Delete alert
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, frequency, email_notifications, push_notifications, filters } = body;

    const supabase = createServiceClient();

    // Get user_id if authenticated
    let user_id: string | null = null;
    let email: string | null = null;
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
          email = user.email || null;
        }
      }
    } catch {
      // Not authenticated
    }

    // Check if alert exists and user has permission
    const { data: existing } = await supabase
      .from('price_alerts')
      .select('id, user_id, email')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Fiyat uyarısı bulunamadı' },
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

    // Update alert
    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (frequency !== undefined) updateData.frequency = frequency;
    if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
    if (push_notifications !== undefined) updateData.push_notifications = push_notifications;
    if (filters !== undefined) updateData.filters = filters;
    updateData.updated_at = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from('price_alerts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating price alert:', error);
      return NextResponse.json(
        { success: false, error: 'Fiyat uyarısı güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fiyat uyarısı güncellendi',
      data: updated,
    });
  } catch (error: any) {
    console.error('Price alert update API error:', error);
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

    // Check if alert exists and user has permission
    const { data: existing } = await supabase
      .from('price_alerts')
      .select('id, user_id, email')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Fiyat uyarısı bulunamadı' },
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

    // Delete alert (or mark as cancelled)
    const { error } = await supabase
      .from('price_alerts')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) {
      console.error('Error deleting price alert:', error);
      return NextResponse.json(
        { success: false, error: 'Fiyat uyarısı silinemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fiyat uyarısı iptal edildi',
    });
  } catch (error: any) {
    console.error('Price alert delete API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
