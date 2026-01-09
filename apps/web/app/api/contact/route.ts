import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { createServiceClient } from '@karasu/lib/supabase/service';
import { withRateLimit } from '@/lib/security/rate-limit';
import { sanitizeText, sanitizeHTML } from '@/lib/security/sanitize';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const supabase = createServiceClient();

const contactFormSchema = z.object({
  name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır.'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Konu en az 3 karakter olmalıdır.'),
  message: z.string().min(10, 'Mesajınız en az 10 karakter olmalıdır.'),
});

export async function POST(req: NextRequest) {
  // Rate limiting: 5 requests per 10 minutes per IP
  const rateLimitResult = await withRateLimit(req, {
    identifier: 'contact-form',
    limit: 5,
    window: '10 m', // 10 minutes
  });

  if (!rateLimitResult.success) {
    return rateLimitResult.response!;
  }

  try {
    const body = await req.json();
    const validatedData = contactFormSchema.parse(body);
    
    // Sanitize user input
    const sanitizedData = {
      name: sanitizeText(validatedData.name),
      email: sanitizeText(validatedData.email),
      phone: validatedData.phone ? sanitizeText(validatedData.phone) : undefined,
      subject: sanitizeText(validatedData.subject),
      message: sanitizeHTML(validatedData.message),
    };

    // Save to database (optional - for tracking)
    const { error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name: sanitizedData.name,
        email: sanitizedData.email,
        phone: sanitizedData.phone || null,
        subject: sanitizedData.subject,
        message: sanitizedData.message,
        status: 'new',
      });

    // Don't fail if database insert fails
    if (dbError) {
      console.error('Error saving contact submission to database:', dbError);
    }

    // Send email notification to admin
    if (resend) {
      await resend.emails.send({
        from: 'Karasu Emlak İletişim Formu <noreply@karasuemlak.net>',
        to: process.env.ADMIN_EMAIL || 'info@karasuemlak.net',
        subject: `Yeni İletişim Formu: ${sanitizedData.subject}`,
        html: `
          <h2>Yeni İletişim Formu Mesajı</h2>
          <p><strong>Ad Soyad:</strong> ${sanitizedData.name}</p>
          <p><strong>E-posta:</strong> ${sanitizedData.email}</p>
          ${sanitizedData.phone ? `<p><strong>Telefon:</strong> ${sanitizedData.phone}</p>` : ''}
          <p><strong>Konu:</strong> ${sanitizedData.subject}</p>
          <p><strong>Mesaj:</strong></p>
          <p>${sanitizedData.message}</p>
          <hr>
          <p><small>Bu mesaj Karasu Emlak web sitesi iletişim formundan gönderilmiştir.</small></p>
        `,
      });

      // Send confirmation email to user
      await resend.emails.send({
        from: 'Karasu Emlak <noreply@karasuemlak.net>',
        to: sanitizedData.email,
        subject: 'Mesajınız Alındı - Karasu Emlak',
        html: `
          <h2>Merhaba ${sanitizedData.name},</h2>
          <p>Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağız.</p>
          <p><strong>Konu:</strong> ${sanitizedData.subject}</p>
          <p><strong>Mesajınız:</strong></p>
          <p>${sanitizedData.message}</p>
          <hr>
          <p>Saygılarımızla,<br>Karasu Emlak Ekibi</p>
        `,
      });
    }

    return NextResponse.json(
      { message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.' },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { errors: error.errors, message: 'Form verilerinde hata var. Lütfen kontrol ediniz.' },
        { status: 400 }
      );
    }
    console.error('Contact Form API Error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyiniz.' },
      { status: 500 }
    );
  }
}

