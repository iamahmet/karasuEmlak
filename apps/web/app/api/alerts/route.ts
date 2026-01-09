import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { createClient } from '@supabase/supabase-js';

/**
 * Get Price Alerts API
 * GET /api/alerts?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'E-posta adresi gereklidir' },
        { status: 400 }
      );
    }

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
      // Not authenticated, continue with email only
    }

    // Build query
    let query = supabase
      .from('price_alerts')
      .select('*')
      .eq('email', email.toLowerCase())
      .order('created_at', { ascending: false });

    if (user_id) {
      query = query.or(`user_id.eq.${user_id},email.eq.${email.toLowerCase()}`);
    }

    const { data: alerts, error } = await query;

    if (error) {
      console.error('Error fetching price alerts:', error);
      return NextResponse.json(
        { success: false, error: 'Fiyat uyarıları getirilemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: alerts || [],
      count: alerts?.length || 0,
    });
  } catch (error: any) {
    console.error('Price alerts API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}
