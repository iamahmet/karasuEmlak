/* eslint-disable react/no-unknown-property */
import React from "react";

/**
 * Email Template Base Component
 */
interface EmailTemplateProps {
  title: string;
  children: React.ReactNode;
  footerText?: string;
}

export function EmailTemplate({ title, children, footerText }: EmailTemplateProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
  
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f5f5' }}>
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: '#f5f5f5', padding: '20px' }}
        >
          <tr>
            <td align="center">
              <table
                width="600"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {/* Header */}
                <tr>
                  <td
                    style={{
                      backgroundColor: '#1a1a1a',
                      padding: '30px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <h1
                      style={{
                        color: '#ffffff',
                        margin: 0,
                        fontSize: '24px',
                        fontWeight: 'bold',
                      }}
                    >
                      Karasu Emlak
                    </h1>
                  </td>
                </tr>

                {/* Content */}
                <tr>
                  <td style={{ padding: '30px 20px' }}>
                    {children}
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      backgroundColor: '#f9f9f9',
                      padding: '20px',
                      textAlign: 'center',
                      fontSize: '12px',
                      color: '#666666',
                      borderTop: '1px solid #eeeeee',
                    }}
                  >
                    {footerText || (
                      <>
                        <p style={{ margin: '0 0 10px 0' }}>
                          <a
                            href={siteUrl}
                            style={{ color: '#1a1a1a', textDecoration: 'none' }}
                          >
                            {siteUrl}
                          </a>
                        </p>
                        <p style={{ margin: 0 }}>
                          Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
                        </p>
                      </>
                    )}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

/**
 * New Listing Notification Email Template
 */
export function NewListingEmailTemplate({
  listingTitle,
  listingUrl,
  price,
  location,
  imageUrl,
}: {
  listingTitle: string;
  listingUrl: string;
  price?: string;
  location?: string;
  imageUrl?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
  const fullUrl = listingUrl.startsWith("http") ? listingUrl : `${siteUrl}${listingUrl}`;

  return (
    <EmailTemplate title="Yeni İlan Bildirimi">
      <h2 style={{ color: '#1a1a1a', marginTop: 0 }}>
        Yeni İlan Eklendi! 🏠
      </h2>
      <p style={{ color: '#666666', fontSize: '16px', lineHeight: '1.6' }}>
        Size özel seçtiğimiz yeni bir ilan bulduk:
      </p>

      {imageUrl && (
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <img
            src={imageUrl}
            alt={listingTitle}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
            }}
          />
        </div>
      )}

      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
        }}
      >
        <h3 style={{ color: '#1a1a1a', marginTop: 0, fontSize: '20px' }}>
          {listingTitle}
        </h3>
        {price && (
          <p style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>
            {price}
          </p>
        )}
        {location && (
          <p style={{ color: '#666666', margin: '10px 0' }}>
            📍 {location}
          </p>
        )}
      </div>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a
          href={fullUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            padding: '12px 30px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
        >
          İlanı Görüntüle
        </a>
      </div>
    </EmailTemplate>
  );
}

/**
 * Price Change Notification Email Template
 */
export function PriceChangeEmailTemplate({
  listingTitle,
  listingUrl,
  oldPrice,
  newPrice,
  location,
  imageUrl,
}: {
  listingTitle: string;
  listingUrl: string;
  oldPrice: string;
  newPrice: string;
  location?: string;
  imageUrl?: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
  const fullUrl = listingUrl.startsWith("http") ? listingUrl : `${siteUrl}${listingUrl}`;
  const isDecrease = parseFloat(newPrice.replace(/[^\d,]/g, "").replace(",", ".")) < 
                     parseFloat(oldPrice.replace(/[^\d,]/g, "").replace(",", "."));

  return (
    <EmailTemplate title="Fiyat Değişikliği Bildirimi">
      <h2 style={{ color: '#1a1a1a', marginTop: 0 }}>
        {isDecrease ? "💰 Fiyat Düştü!" : "📈 Fiyat Güncellendi"}
      </h2>
      <p style={{ color: '#666666', fontSize: '16px', lineHeight: '1.6' }}>
        Takip ettiğiniz ilanın fiyatı değişti:
      </p>

      {imageUrl && (
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <img
            src={imageUrl}
            alt={listingTitle}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '8px',
            }}
          />
        </div>
      )}

      <div
        style={{
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px',
          margin: '20px 0',
        }}
      >
        <h3 style={{ color: '#1a1a1a', marginTop: 0, fontSize: '20px' }}>
          {listingTitle}
        </h3>
        {location && (
          <p style={{ color: '#666666', margin: '10px 0' }}>
            📍 {location}
          </p>
        )}
        <div style={{ margin: '15px 0' }}>
          <p style={{ color: '#999999', margin: '5px 0', textDecoration: 'line-through' }}>
            Eski Fiyat: {oldPrice}
          </p>
          <p style={{ 
            color: isDecrease ? '#22c55e' : '#1a1a1a', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            margin: '5px 0' 
          }}>
            Yeni Fiyat: {newPrice}
          </p>
        </div>
      </div>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a
          href={fullUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            padding: '12px 30px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
        >
          İlanı Görüntüle
        </a>
      </div>
    </EmailTemplate>
  );
}

/**
 * Saved Search Match Email Template
 */
export function SavedSearchMatchEmailTemplate({
  searchName,
  matches,
  searchUrl,
}: {
  searchName: string;
  matches: Array<{
    title: string;
    url: string;
    price?: string;
    location?: string;
    imageUrl?: string;
  }>;
  searchUrl: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.karasuemlak.net";
  const fullSearchUrl = searchUrl.startsWith("http") ? searchUrl : `${siteUrl}${searchUrl}`;

  return (
    <EmailTemplate title="Kayıtlı Arama Eşleşmesi">
      <h2 style={{ color: '#1a1a1a', marginTop: 0 }}>
        🎯 Yeni Eşleşmeler Bulundu!
      </h2>
      <p style={{ color: '#666666', fontSize: '16px', lineHeight: '1.6' }}>
        <strong>{searchName}</strong> aramanız için <strong>{matches.length}</strong> yeni ilan bulduk:
      </p>

      {matches.map((match, index) => {
        const fullUrl = match.url.startsWith("http") ? match.url : `${siteUrl}${match.url}`;
        return (
          <div
            key={index}
            style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
              margin: '20px 0',
            }}
          >
            {match.imageUrl && (
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                <img
                  src={match.imageUrl}
                  alt={match.title}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                  }}
                />
              </div>
            )}
            <h3 style={{ color: '#1a1a1a', marginTop: 0, fontSize: '18px' }}>
              {match.title}
            </h3>
            {match.price && (
              <p style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: 'bold', margin: '10px 0' }}>
                {match.price}
              </p>
            )}
            {match.location && (
              <p style={{ color: '#666666', margin: '10px 0' }}>
                📍 {match.location}
              </p>
            )}
            <div style={{ marginTop: '15px' }}>
              <a
                href={fullUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  padding: '8px 20px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                İlanı Görüntüle
              </a>
            </div>
          </div>
        );
      })}

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a
          href={fullSearchUrl}
          style={{
            display: 'inline-block',
            backgroundColor: '#1a1a1a',
            color: '#ffffff',
            padding: '12px 30px',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
          }}
        >
          Tüm Eşleşmeleri Görüntüle
        </a>
      </div>
    </EmailTemplate>
  );
}

