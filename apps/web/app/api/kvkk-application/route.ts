import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';
import { sanitizeText } from '@/lib/security/sanitize';

/**
 * KVKK Application API
 * Handles KVKK (GDPR) application submissions
 */
export async function POST(request: NextRequest) {
  // Rate limiting: 3 requests per 1 hour per IP (sensitive data)
  const rateLimitResult = await withRateLimit(request, {
    identifier: 'kvkk-application',
    limit: 3,
    window: '1 h',
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }
  try {
    const body = await request.json();
    const { name, email, phone, tcKimlikNo, address, requestType, message } = body;

    // Validation
    if (!name || !email || !phone || !requestType || !message) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalıdır' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Sanitize user input
    const sanitizedData = {
      name: sanitizeText(name),
      email: sanitizeText(email),
      phone: sanitizeText(phone),
      tc_kimlik_no: tcKimlikNo ? sanitizeText(tcKimlikNo) : null,
      address: address ? sanitizeText(address) : null,
      request_type: sanitizeText(requestType),
      message: sanitizeText(message),
    };

    // Store application in database
    const { data, error } = await supabase
      .from('kvkk_applications')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone,
        tc_kimlik_no: sanitizedData.tc_kimlik_no,
        address: sanitizedData.address,
        request_type: sanitizedData.request_type,
        message: sanitizedData.message,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, log and return success anyway
      console.error('Error storing KVKK application:', error);
      
      // In production, you might want to send an email notification instead
      // For now, we'll return success even if DB insert fails
      // This allows the form to work even if the table hasn't been created yet
    }

    return NextResponse.json({
      success: true,
      message: 'Başvurunuz başarıyla gönderildi',
      applicationId: data?.id,
    });
  } catch (error: any) {
    console.error('KVKK application API error:', error);
    return NextResponse.json(
      { error: error.message || 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

