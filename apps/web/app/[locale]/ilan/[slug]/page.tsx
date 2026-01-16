import { notFound } from 'next/navigation';
import { getListingBySlug, getListingsByNeighborhood, getListings } from '@/lib/supabase/queries';
import type { Metadata } from 'next';
import { siteConfig } from '@karasu-emlak/config';
import { routing } from '@/i18n/routing';
import { withTimeout } from '@/lib/utils/timeout';
import { cleanDescription } from '@/lib/utils/clean-description';
import { ContentRenderer } from '@/components/content/ContentRenderer';
import { getPropertyPlaceholder } from '@/lib/utils/placeholder-images';
import { generateListingFAQs } from '@/lib/utils/listing-faqs';
import { CardImage } from '@/components/images';
import { getOptimizedCloudinaryUrl } from '@/lib/cloudinary/optimization';
import { Button } from '@karasu/ui';
import Link from 'next/link';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateRealEstateListingSchema, generateFAQSchema } from '@/lib/seo/structured-data';
import { generatePropertyImageAlt } from '@/lib/seo/image-alt-generator';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { GoogleMapsLoader } from '@/components/maps/GoogleMapsLoader';
import { getNonce } from '@/lib/security/nonce';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Building2, 
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { ComparisonButton } from '@/components/comparison/ComparisonButton';
import { ListingImageSlider } from '@/components/listings/ListingImageSlider';
import { FAQBlock } from '@/components/content/FAQBlock';
import dynamic from 'next/dynamic';
import './print.css';

// Lazy load client components
const TrustBadges = dynamic(() => import('@/components/trust/TrustBadges').then(mod => ({ default: mod.default })), {
  loading: () => null,
});

const SocialProofWidget = dynamic(() => import('@/components/conversion/SocialProofWidget').then(mod => ({ default: mod.default })), {
  loading: () => null,
});

const ShareButtons = dynamic(() => import('@/components/share/ShareButtons').then(mod => ({ default: mod.default })), {
  loading: () => null,
});
// Lazy load conversion components
const StickyCTABar = dynamic(() => import('@/components/conversion/StickyCTABar').then(mod => ({ default: mod.default })), {
  loading: () => null,
});

// Lazy load client components
const PremiumRelatedListings = dynamic(() => import('@/components/related/PremiumRelatedListings').then(mod => ({ default: mod.default })), {
  loading: () => null,
});

const CommentsSection = dynamic(() => import('@/components/comments/CommentsSection').then(mod => ({ default: mod.CommentsSection })), {
  loading: () => null,
});

const SidebarRelatedListings = dynamic(() => import('@/components/related/SidebarRelatedListings').then(mod => ({ default: mod.SidebarRelatedListings })), {
  loading: () => null,
});

const VirtualTour = dynamic(() => import('@/components/virtual-tour/VirtualTour').then(mod => ({ default: mod.default })), {
  loading: () => null,
});

const ViewingBooking = dynamic(() => import('@/components/booking/ViewingBooking').then(mod => ({ default: mod.default })), {
  loading: () => null,
});

const MortgageCalculator = dynamic(() => import('@/components/listings/MortgageCalculator').then(mod => ({ default: mod.MortgageCalculator })), {
  loading: () => null,
});

const NearbyPlaces = dynamic(() => import('@/components/listings/NearbyPlaces').then(mod => ({ default: mod.NearbyPlaces })), {
  loading: () => null,
});

const LocationAdvantages = dynamic(() => import('@/components/listings/LocationAdvantages').then(mod => ({ default: mod.LocationAdvantages })), {
  loading: () => null,
});

const PrintButton = dynamic(() => import('@/components/listings/PrintButton').then(mod => ({ default: mod.PrintButton })), {
  loading: () => null,
});

const PropertyHighlights = dynamic(() => import('@/components/listings/PropertyHighlights').then(mod => ({ default: mod.PropertyHighlights })), {
  loading: () => null,
});


const ContactFormWidget = dynamic(() => import('@/components/listings/ContactFormWidget').then(mod => ({ default: mod.ContactFormWidget })), {
  loading: () => null,
});

const PriceHistory = dynamic(() => import('@/components/listings/PriceHistory').then(mod => ({ default: mod.PriceHistory })), {
  loading: () => null,
});

const InvestmentAnalysis = dynamic(() => import('@/components/listings/InvestmentAnalysis').then(mod => ({ default: mod.InvestmentAnalysis })), {
  loading: () => null,
});

const NeighborhoodStats = dynamic(() => import('@/components/listings/NeighborhoodStats').then(mod => ({ default: mod.NeighborhoodStats })), {
  loading: () => null,
});

const ScrollReveal = dynamic(() => import('@/components/animations/ScrollReveal').then(mod => ({ default: mod.ScrollReveal })), {
  loading: () => null,
});

const ExitIntentPopup = dynamic(() => import('@/components/conversion/ExitIntentPopup').then(mod => ({ default: mod.ExitIntentPopup })), {
  loading: () => null,
});

const StickyMobileCTAs = dynamic(() => import('@/components/conversion/StickyMobileCTAs').then(mod => ({ default: mod.StickyMobileCTAs })), {
  loading: () => null,
});

const RelatedArticles = dynamic(() => import('@/components/listings/RelatedArticles').then(mod => ({ default: mod.RelatedArticles })), {
  loading: () => null,
});

const InternalLinks = dynamic(() => import('@/components/listings/InternalLinks').then(mod => ({ default: mod.InternalLinks })), {
  loading: () => null,
});

const PropertyRecommendations = dynamic(() => import('@/components/listings/PropertyRecommendations').then(mod => ({ default: mod.PropertyRecommendations })), {
  loading: () => null,
});

const EnergyRating = dynamic(() => import('@/components/listings/EnergyRating').then(mod => ({ default: mod.EnergyRating })), {
  loading: () => null,
});

const DocumentsSection = dynamic(() => import('@/components/listings/DocumentsSection').then(mod => ({ default: mod.DocumentsSection })), {
  loading: () => null,
});

const ViewCounter = dynamic(() => import('@/components/listings/ViewCounter').then(mod => ({ default: mod.ViewCounter })), {
  loading: () => null,
});

const CompactHero = dynamic(() => import('@/components/listings/CompactHero').then(mod => ({ default: mod.CompactHero })), {
  loading: () => null,
});

const QuickActions = dynamic(() => import('@/components/listings/QuickActions').then(mod => ({ default: mod.QuickActions })), {
  loading: () => null,
});

const HeroOverlay = dynamic(() => import('@/components/listings/HeroOverlay').then(mod => ({ default: mod.HeroOverlay })), {
  loading: () => null,
});

const QRCodeGenerator = dynamic(() => import('@/components/services/QRCodeGenerator').then(mod => ({ default: mod.QRCodeGenerator })), {
  loading: () => null,
});

const BusinessHoursWidget = dynamic(() => import('@/components/services/BusinessHoursWidget').then(mod => ({ default: mod.BusinessHoursWidget })), {
  loading: () => null,
});

// ISR: Revalidate every hour
export const revalidate = 3600;

// Generate static params for popular listings
export async function generateStaticParams() {
  try {
    const result = await withTimeout(getListings({}, { field: 'created_at', order: 'desc' }, 50, 0), 5000, { listings: [], total: 0 });
    const listings = result?.listings || [];
    if (!listings || listings.length === 0) {
      return [];
    }
    return listings.map((listing) => ({
      slug: listing.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const listing = await withTimeout(getListingBySlug(slug), 2000, null);
  
  if (!listing) {
    return {
      title: 'İlan Bulunamadı | Karasu Emlak',
      description: 'Aradığınız ilan bulunamadı. Karasu\'da satılık ve kiralık emlak ilanlarımıza göz atın.',
    };
  }

  const canonicalPath = locale === routing.defaultLocale 
    ? `/ilan/${slug}` 
    : `/${locale}/ilan/${slug}`;
  
  const mainImage = listing.images?.[0];
  const ogImage = mainImage?.url 
    ? mainImage.url
    : mainImage?.public_id
    ? getOptimizedCloudinaryUrl(mainImage.public_id, { width: 1200, height: 630, crop: 'fill', quality: 90, format: 'auto' })
    : `${siteConfig.url}/og-image.jpg`;

  // Enhanced SEO title and description
  const statusLabel = listing.status === 'satilik' ? 'Satılık' : 'Kiralık';
  const propertyTypeLabel = listing.property_type === 'daire' ? 'Daire'
    : listing.property_type === 'villa' ? 'Villa'
    : listing.property_type === 'yazlik' ? 'Yazlık'
    : listing.property_type === 'arsa' ? 'Arsa'
    : listing.property_type === 'ev' ? 'Ev'
    : listing.property_type === 'isyeri' ? 'İşyeri'
    : 'Dükkan';

  const priceText = listing.price_amount 
    ? `₺${new Intl.NumberFormat('tr-TR').format(listing.price_amount)}${listing.status === 'kiralik' ? '/ay' : ''}`
    : '';

  const featuresText = [
    listing.features.rooms && `${listing.features.rooms} Oda`,
    listing.features.bathrooms && `${listing.features.bathrooms} Banyo`,
    listing.features.sizeM2 && `${listing.features.sizeM2} m²`,
  ].filter(Boolean).join(', ');

  const seoTitle = `${statusLabel} ${propertyTypeLabel} ${listing.location_neighborhood} ${priceText ? `- ${priceText}` : ''} | Karasu Emlak`;
  const seoDescription = listing.description_short 
    || `${listing.location_neighborhood}, Karasu'da ${statusLabel.toLowerCase()} ${propertyTypeLabel.toLowerCase()}. ${featuresText}. ${listing.description_long?.substring(0, 100) || 'Detaylı bilgi ve görüntüleme için iletişime geçin.'}`;

  // Generate keywords
  const keywords = [
    `karasu ${statusLabel.toLowerCase()} ${propertyTypeLabel.toLowerCase()}`,
    `${listing.location_neighborhood} ${statusLabel.toLowerCase()}`,
    `karasu emlak`,
    `karasu gayrimenkul`,
    listing.features.seaView && 'deniz manzaralı',
    listing.features.furnished && 'eşyalı',
    listing.features.parking && 'otoparklı',
  ].filter(Boolean).join(', ');

  return {
    title: seoTitle,
    description: seoDescription,
    keywords,
    alternates: {
      canonical: canonicalPath,
      languages: {
        'tr': locale === routing.defaultLocale ? `/ilan/${slug}` : `/tr/ilan/${slug}`,
        'en': `/en/ilan/${slug}`,
        'et': `/et/ilan/${slug}`,
        'ru': `/ru/ilan/${slug}`,
        'ar': `/ar/ilan/${slug}`,
      },
    },
    openGraph: {
      title: listing.title,
      description: seoDescription,
      url: `${siteConfig.url}${canonicalPath}`,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: generatePropertyImageAlt({
            propertyType: listing.property_type as any,
            status: listing.status,
            location: {
              neighborhood: listing.location_neighborhood,
              district: listing.location_district,
              city: 'Karasu',
            },
            features: {
              rooms: listing.features?.rooms,
              sizeM2: listing.features?.sizeM2,
            },
          }, listing.title),
        },
      ],
      type: 'website',
      siteName: 'Karasu Emlak',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description: seoDescription,
      images: [ogImage],
      creator: '@karasuemlak',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  
  // Fetch listing with timeout
  const listing = await withTimeout(getListingBySlug(slug), 3000, null);
  
  if (!listing) {
    notFound();
  }

  const basePath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const nonce = await getNonce();
  
  // Get similar listings from the same neighborhood (with timeout)
  const similarListings = await withTimeout(
    getListingsByNeighborhood(
      listing.location_neighborhood,
      3
    ).then(listings => listings.filter(l => l.id !== listing.id).slice(0, 3)),
    2000,
    []
  );

  // Generate SEO-optimized FAQs for this listing
  const listingFAQs = generateListingFAQs({
    title: listing.title,
    property_type: listing.property_type,
    status: listing.status,
    location_neighborhood: listing.location_neighborhood,
    location_district: listing.location_district,
    price_amount: listing.price_amount,
    size_m2: listing.features?.sizeM2,
    features: listing.features,
  });

  // Generate enhanced structured data with additional properties
  const listingSchema = generateRealEstateListingSchema({
    name: listing.title,
    description: listing.description_short || listing.description_long,
    image: listing.images?.map(img => img.url || (img.public_id ? getOptimizedCloudinaryUrl(img.public_id, { width: 1200, height: 630, quality: 90, format: 'auto' }) : '')) || [],
    address: {
      locality: listing.location_neighborhood,
      region: listing.location_district || 'Sakarya',
      country: 'TR',
      streetAddress: listing.location_full_address,
    },
    geo: listing.coordinates_lat && listing.coordinates_lng ? {
      latitude: parseFloat(listing.coordinates_lat.toString()),
      longitude: parseFloat(listing.coordinates_lng.toString()),
    } : undefined,
    price: listing.price_amount,
    priceCurrency: listing.price_currency || 'TRY',
    availability: listing.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: `${siteConfig.url}${basePath}/ilan/${listing.slug}`,
    propertyType: listing.property_type,
    numberOfRooms: listing.features.rooms,
    numberOfBathrooms: listing.features.bathrooms,
    floorSize: listing.features.sizeM2,
    yearBuilt: listing.features.buildingAge ? new Date().getFullYear() - listing.features.buildingAge : undefined,
    additionalProperty: [
      ...(listing.features.heating ? [{ '@type': 'PropertyValue', name: 'Isıtma', value: listing.features.heating }] : []),
      ...(listing.features.furnished !== undefined ? [{ '@type': 'PropertyValue', name: 'Eşyalı', value: listing.features.furnished ? 'Evet' : 'Hayır' }] : []),
      ...(listing.features.balcony ? [{ '@type': 'PropertyValue', name: 'Balkon', value: 'Var' }] : []),
      ...(listing.features.parking ? [{ '@type': 'PropertyValue', name: 'Otopark', value: 'Var' }] : []),
      ...(listing.features.elevator ? [{ '@type': 'PropertyValue', name: 'Asansör', value: 'Var' }] : []),
      ...(listing.features.seaView ? [{ '@type': 'PropertyValue', name: 'Deniz Manzarası', value: 'Var' }] : []),
      ...(listing.features.floor ? [{ '@type': 'PropertyValue', name: 'Kat', value: listing.features.floor.toString() }] : []),
    ],
  });

  // Schema is already enhanced in generateRealEstateListingSchema
  const enhancedSchema = listingSchema;

  // BreadcrumbList schema for better SERP display
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        position: 1,
        name: listing.status === 'satilik' ? 'Satılık' : 'Kiralık',
        item: `${siteConfig.url}${basePath}/${listing.status}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: listing.title,
        item: `${siteConfig.url}${basePath}/ilan/${listing.slug}`,
      },
    ],
  };

  // VideoObject schema for virtual/video tours when available
  const videos: Array<{ url: string; name: string; description: string; thumbnailUrl?: string }> = [];
  const thumb = listing.images?.[0]?.url || (listing.images?.[0]?.public_id
    ? getOptimizedCloudinaryUrl(listing.images[0].public_id, { width: 1200, height: 630, format: 'auto', quality: 85 })
    : undefined);

  const virtualUrl = (listing as any).virtual_tour_url;
  if (virtualUrl) {
    videos.push({
      url: virtualUrl,
      name: `${listing.title} Sanal Tur`,
      description: `${listing.title} sanal tur videosu`,
      thumbnailUrl: thumb,
    });
  }

  const videoUrl = (listing as any).video_tour_url;
  if (videoUrl) {
    videos.push({
      url: videoUrl,
      name: `${listing.title} Video Tur`,
      description: `${listing.title} video turu`,
      thumbnailUrl: thumb,
    });
  }

  const videoSchemas = videos.map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: new Date(listing.created_at).toISOString(),
    contentUrl: video.url,
  }));

  // Generate FAQ schema for SEO
  const faqSchema = listingFAQs && listingFAQs.length > 0 
    ? generateFAQSchema(listingFAQs)
    : null;

  // Render the listing detail page
  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={enhancedSchema} />
      <StructuredData data={breadcrumbSchema} />
      {faqSchema && <StructuredData data={faqSchema} />}
      {videoSchemas.map((schema, index) => (
        <StructuredData key={`video-schema-${index}`} data={schema} />
      ))}
      
      {/* Print-only header */}
      <div className="hidden print:block mb-8">
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-4">
          <h1 className="text-2xl font-bold mb-2">Karasu Emlak</h1>
          <p className="text-sm text-gray-600">www.karasuemlak.net | <a href="tel:+905325933854" className="hover:text-[#006AFF] transition-colors">+90 532 593 38 54</a></p>
        </div>
      </div>

      {/* Breadcrumbs - Enterprise Premium */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="container mx-auto px-4 lg:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: listing.status === 'satilik' ? 'Satılık' : 'Kiralık', href: `${basePath}/${listing.status}` },
                { label: listing.title },
              ]}
            />
            <div className="hidden md:block print:hidden">
              <PrintButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container - Enterprise Layout */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 md:py-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content - Expanded for Related Listings */}
          <div className="min-w-0">
            {/* Hero Section with Image Gallery - Enterprise Premium */}
            <div className="mb-4 sm:mb-6 md:mb-8 relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl border border-slate-200/60">
              {listing.images && listing.images.length > 0 ? (
                <>
                  <ListingImageSlider 
                    images={listing.images.map((img, index) => ({
                      public_id: img.public_id,
                      url: img.url,
                      alt: img.alt || generatePropertyImageAlt({
                        propertyType: listing.property_type as any,
                        status: listing.status,
                        location: {
                          neighborhood: listing.location_neighborhood,
                          district: listing.location_district,
                          city: 'Karasu',
                        },
                        features: {
                          rooms: listing.features?.rooms,
                          sizeM2: listing.features?.sizeM2,
                          seaView: listing.features?.seaView,
                          furnished: listing.features?.furnished,
                        },
                        price: listing.price_amount,
                      }, index === 0 ? listing.title : `${listing.title} - Görsel ${index + 1}`),
                      order: img.order || 0,
                    }))} 
                    title={listing.title}
                    initialIndex={0}
                    propertyType={listing.property_type}
                    status={listing.status}
                    neighborhood={listing.location_neighborhood}
                    autoPlay={false}
                    heroOverlay={listing.price_amount ? {
                      title: listing.title,
                      location: {
                        neighborhood: listing.location_neighborhood,
                        district: listing.location_district,
                        city: listing.location_city,
                      },
                      price: listing.price_amount,
                      status: listing.status,
                      featured: listing.featured,
                      verified: listing.featured,
                      hasDocuments: true,
                      shareUrl: `${siteConfig.url}${basePath}/ilan/${listing.slug}`,
                      shareTitle: listing.title,
                      shareDescription: listing.description_short || '',
                    } : undefined}
                  />
                  
                  {/* Image Disclaimer Note */}
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
                      <span className="font-semibold flex-shrink-0">ℹ️ Not:</span>
                      <span>Görseller temsili olabilir. Detaylı bilgi için bize ulaşabilirsiniz.</span>
                    </p>
                  </div>
                </>
              ) : (
              <div className="h-[500px] md:h-[600px] bg-muted rounded-xl flex items-center justify-center relative">
                <p className="text-muted-foreground">Görsel bulunmuyor</p>
                {listing.price_amount && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CompactHero
                      title={listing.title}
                      location={{
                        neighborhood: listing.location_neighborhood,
                        district: listing.location_district,
                        city: listing.location_city,
                      }}
                      price={listing.price_amount}
                      status={listing.status}
                      featured={listing.featured}
                      verified={listing.featured}
                      hasDocuments={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions - Enterprise Premium - Hidden on mobile (using StickyMobileCTAs) */}
          <div className="mb-4 sm:mb-6 md:mb-8 hidden md:block">
            <QuickActions
              propertyId={listing.id}
              propertyTitle={listing.title}
            />
          </div>

          {/* Key Features - Enterprise Premium Style - Mobile Optimized */}
          {(listing.features?.sizeM2 || listing.features?.rooms || listing.features?.bathrooms || listing.features?.floor || listing.features?.buildingAge) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10 p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-md sm:shadow-lg">
              {listing.features.sizeM2 && (
                <div className="flex flex-col items-start gap-2 sm:gap-3 group">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-sm font-semibold tracking-tight">m²</div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight group-active:text-[#006AFF] transition-colors">{listing.features.sizeM2}</div>
                </div>
              )}
              {listing.features.rooms && (
                <div className="flex flex-col items-start gap-2 sm:gap-3 group">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-sm font-semibold tracking-tight">
                    <Bed className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" strokeWidth={2.5} />
                    Oda
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight group-active:text-[#006AFF] transition-colors">{listing.features.rooms}</div>
                </div>
              )}
              {listing.features.bathrooms && (
                <div className="flex flex-col items-start gap-2 sm:gap-3 group">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-sm font-semibold tracking-tight">
                    <Bath className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" strokeWidth={2.5} />
                    Banyo
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight group-active:text-[#006AFF] transition-colors">{listing.features.bathrooms}</div>
                </div>
              )}
              {listing.features.floor && (
                <div className="flex flex-col items-start gap-2 sm:gap-3 group">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-sm font-semibold tracking-tight">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" strokeWidth={2.5} />
                    Kat
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight group-active:text-[#006AFF] transition-colors">{listing.features.floor}</div>
                </div>
              )}
              {listing.features.buildingAge && (
                <div className="flex flex-col items-start gap-2 sm:gap-3 group">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 text-xs sm:text-sm font-semibold tracking-tight">
                    <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" strokeWidth={2.5} />
                    Yaş
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-slate-900 tracking-tight group-active:text-[#006AFF] transition-colors">{listing.features.buildingAge}</div>
                </div>
              )}
            </div>
          )}

          {/* Property Highlights - Öne Çıkan Özellikler */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <PropertyHighlights
              features={listing.features}
              propertyType={listing.property_type}
              status={listing.status}
              neighborhood={listing.location_neighborhood}
            />
          </div>

            {/* Description - Listing Style (Utilitarian, Not Blog) - Mobile Optimized */}
            {listing.description_long && (
              <div className="mb-6 sm:mb-8 md:mb-10">
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 md:mb-5 text-slate-900">Açıklama</h2>
                <ContentRenderer
                  content={listing.description_long}
                  format="auto"
                  sanitize={true}
                  prose={false}
                  className="text-[15px] md:text-[16px] text-slate-700 leading-relaxed space-y-3 md:space-y-4
                    [&_p]:mb-3 [&_p]:md:mb-4 [&_p]:leading-relaxed
                    [&_strong]:font-semibold [&_strong]:text-slate-900
                    [&_a]:text-[#006AFF] [&_a]:font-medium [&_a]:hover:underline"
                />
              </div>
            )}

            {/* Additional Features - Enterprise Premium - Mobile Optimized */}
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 sm:mb-6 md:mb-8 text-slate-900 tracking-tight">Özellikler</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-5 p-4 sm:p-6 md:p-8 lg:p-10 bg-white border border-slate-200/80 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg">
                {listing.features.heating && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200/60 active:bg-slate-100/50 transition-colors touch-manipulation">
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-tight uppercase">Isıtma</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{listing.features.heating}</span>
                  </div>
                )}
                {listing.features.furnished !== undefined && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200/60 active:bg-slate-100/50 transition-colors touch-manipulation">
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-tight uppercase">Eşyalı</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{listing.features.furnished ? 'Evet' : 'Hayır'}</span>
                  </div>
                )}
                {listing.features.balcony && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200/60 active:bg-slate-100/50 transition-colors touch-manipulation">
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-tight uppercase">Balkon</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Var</span>
                  </div>
                )}
                {listing.features.parking && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200/60 active:bg-slate-100/50 transition-colors touch-manipulation">
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-tight uppercase">Otopark</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Var</span>
                  </div>
                )}
                {listing.features.elevator && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200/60 active:bg-slate-100/50 transition-colors touch-manipulation">
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-tight uppercase">Asansör</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Var</span>
                  </div>
                )}
                {listing.features.seaView && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200/60 active:bg-slate-100/50 transition-colors touch-manipulation">
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-tight uppercase">Deniz Manzarası</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Var</span>
                  </div>
                )}
                {listing.features.buildingAge && (
                  <div className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-slate-50/50 rounded-lg sm:rounded-xl border border-slate-200/60 active:bg-slate-100/50 transition-colors touch-manipulation">
                    <span className="text-[10px] sm:text-xs text-slate-600 font-semibold tracking-tight uppercase">Bina Yaşı</span>
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">{listing.features.buildingAge} yıl</span>
                  </div>
                )}
              </div>
            </div>

            {/* Map - Enterprise Premium - Mobile Optimized */}
            {listing.coordinates_lat && listing.coordinates_lng ? (
              <div className="mb-6 sm:mb-8 md:mb-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 sm:mb-6 md:mb-8 text-slate-900 tracking-tight">Konum</h2>
                <div className="border border-slate-200/80 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg sm:shadow-xl">
                  <GoogleMapsLoader nonce={nonce || undefined}>
                    <PropertyMap
                      latitude={listing.coordinates_lat}
                      longitude={listing.coordinates_lng}
                      title={listing.title}
                      address={listing.location_full_address || `${listing.location_neighborhood}, ${listing.location_district}`}
                    />
                  </GoogleMapsLoader>
                </div>
              </div>
            ) : listing.location_neighborhood ? (
              // Fallback: Show neighborhood info if no coordinates
              <div className="mb-6 sm:mb-8 md:mb-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 sm:mb-6 md:mb-8 text-slate-900 tracking-tight">Konum</h2>
                <div className="border border-slate-200/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-blue-50/30">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-[#006AFF] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{listing.location_neighborhood}</h3>
                      {listing.location_district && (
                        <p className="text-slate-600 mb-1">{listing.location_district}, Sakarya</p>
                      )}
                      {listing.location_full_address && (
                        <p className="text-sm text-slate-500">{listing.location_full_address}</p>
                      )}
                      <Link
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.location_neighborhood}, ${listing.location_district || 'Karasu'}, Sakarya`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 mt-4 text-[#006AFF] hover:text-[#0052CC] font-medium text-sm"
                      >
                        <MapPin className="h-4 w-4" />
                        Google Maps'te Aç
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Energy Rating */}
            {(listing.features.heating || listing.features.buildingAge) && (
              <div className="mb-6">
                <EnergyRating
                  heating={listing.features.heating}
                  buildingAge={listing.features.buildingAge}
                />
              </div>
            )}

            {/* Documents Section */}
            <div className="mb-6">
              <DocumentsSection
                propertyType={listing.property_type}
              />
            </div>

            {/* Location Advantages */}
            <div className="mb-6">
              <LocationAdvantages
                neighborhood={listing.location_neighborhood}
                propertyType={listing.property_type}
              />
            </div>

            {/* Nearby Places */}
            <div className="mb-6">
              <NearbyPlaces
                neighborhood={listing.location_neighborhood}
              />
            </div>

            {/* FAQ Section - SEO Optimized */}
            {listingFAQs && listingFAQs.length > 0 && (
              <div className="mb-10">
                <FAQBlock
                  faqs={listingFAQs}
                  title="Sık Sorulan Sorular"
                  className=""
                />
              </div>
            )}

            {/* Similar Listings - Zillow Style - Mobile Optimized */}
            {similarListings && similarListings.length > 0 && (
              <div className="mb-8 sm:mb-10">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold mb-4 sm:mb-6 text-gray-900">Benzer İlanlar</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  {similarListings.map((similar) => {
                    const similarImage = similar.images?.[0];
                    return (
                      <Link key={similar.id} href={`${basePath}/ilan/${similar.slug}`}>
                        <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-[#006AFF] transition-all cursor-pointer">
                          <div className="h-48 bg-gray-100 relative overflow-hidden">
                            {similarImage?.url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={similarImage.url}
                                alt={similarImage.alt || generatePropertyImageAlt({
                                  propertyType: similar.property_type as any,
                                  status: similar.status,
                                  location: {
                                    neighborhood: similar.location_neighborhood,
                                    district: similar.location_district,
                                    city: 'Karasu',
                                  },
                                  features: {
                                    rooms: similar.features?.rooms,
                                    sizeM2: similar.features?.sizeM2,
                                  },
                                }, similar.title)}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : similarImage?.public_id ? (
                              <CardImage
                                publicId={similarImage.public_id}
                                alt={similarImage.alt || generatePropertyImageAlt({
                                  propertyType: similar.property_type as any,
                                  status: similar.status,
                                  location: {
                                    neighborhood: similar.location_neighborhood,
                                    district: similar.location_district,
                                    city: 'Karasu',
                                  },
                                  features: {
                                    rooms: similar.features?.rooms,
                                    sizeM2: similar.features?.sizeM2,
                                  },
                                }, similar.title)}
                                className="w-full h-full object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                                fallback={getPropertyPlaceholder(
                                  similar.property_type || 'daire',
                                  similar.status || 'satilik',
                                  similar.location_neighborhood,
                                  400,
                                  300
                                )}
                              />
                            ) : (
                              <img
                                src={getPropertyPlaceholder(
                                  similar.property_type || 'daire',
                                  similar.status || 'satilik',
                                  similar.location_neighborhood,
                                  400,
                                  300
                                )}
                                alt={generatePropertyImageAlt({
                                  propertyType: similar.property_type as any,
                                  status: similar.status,
                                  location: {
                                    neighborhood: similar.location_neighborhood,
                                    district: similar.location_district,
                                    city: 'Karasu',
                                  },
                                }, similar.title)}
                                className="w-full h-full object-cover opacity-80"
                                loading="lazy"
                              />
                            )}
                            <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold text-white ${
                              similar.status === 'satilik' ? 'bg-[#006AFF]' : 'bg-[#00A862]'
                            }`}>
                              {similar.status === 'satilik' ? 'Sat' : 'Kir'}
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-bold mb-2 line-clamp-2 text-gray-900 text-base leading-snug">{similar.title}</h3>
                            <p className="text-sm text-gray-600 mb-3 font-medium flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {similar.location_neighborhood}
                            </p>
                            {similar.features?.sizeM2 && (
                              <p className="text-xs text-gray-500 mb-2">
                                {similar.features.sizeM2} m²
                                {similar.features.rooms && ` • ${similar.features.rooms} Oda`}
                              </p>
                            )}
                            {similar.price_amount && (
                              <p className="text-xl font-extrabold text-[#006AFF]">
                                ₺{new Intl.NumberFormat('tr-TR').format(Number(similar.price_amount))}
                                {similar.status === 'kiralik' && <span className="text-sm text-gray-500 font-medium">/ay</span>}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Enterprise Premium - Mobile: Top, Desktop: Sticky */}
          <aside className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-5 md:space-y-6">
              {/* Price Card - Enterprise Premium - Mobile Optimized */}
              {listing.price_amount && (
                <div className={`border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 bg-gradient-to-br shadow-lg sm:shadow-xl ${
                  listing.status === 'satilik' 
                    ? 'border-[#006AFF]/30 from-blue-50/90 to-indigo-50/70' 
                    : 'border-[#00A862]/30 from-emerald-50/90 to-green-50/70'
                }`}>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-bold mb-2 sm:mb-3 tracking-tight uppercase">Fiyat</div>
                    <div className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-2 sm:mb-3 tracking-tight ${
                      listing.status === 'satilik' ? 'text-[#006AFF]' : 'text-[#00A862]'
                    }`}>
                      ₺{new Intl.NumberFormat('tr-TR').format(listing.price_amount)}
                      {listing.status === 'kiralik' && (
                        <span className="text-lg sm:text-xl md:text-2xl text-slate-500 font-medium">/ay</span>
                      )}
                    </div>
                    {listing.status === 'satilik' && (
                      <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-semibold tracking-tight">
                        Tahmini aylık ödeme: ₺{new Intl.NumberFormat('tr-TR').format(Math.round(listing.price_amount * 0.006))}/ay
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Card - Enterprise Premium - Mobile Optimized */}
              <div className="border border-slate-200/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 bg-white shadow-lg sm:shadow-xl">
                <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold mb-4 sm:mb-6 md:mb-8 text-slate-900 tracking-tight">İletişim</h3>
              
              {listing.agent_name && (
                <div className="mb-4">
                  <p className="font-medium">{listing.agent_name}</p>
                </div>
              )}

              <div className="space-y-3">
                {listing.agent_phone && (
                  <a 
                    href={`tel:${listing.agent_phone}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{listing.agent_phone}</span>
                  </a>
                )}
                
                {listing.agent_whatsapp && (
                  <a 
                    href={`https://wa.me/${listing.agent_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </a>
                )}

                {listing.agent_email && (
                  <a 
                    href={`mailto:${listing.agent_email}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    <span>{listing.agent_email}</span>
                  </a>
                )}
              </div>

                <div className="mt-4 sm:mt-6 md:mt-8 space-y-2.5 sm:space-y-3">
                  <Button 
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 sm:py-4 text-sm sm:text-base md:text-lg shadow-xl hover:shadow-2xl transition-all rounded-lg sm:rounded-xl touch-manipulation" 
                    size="lg"
                    asChild
                  >
                    <a href="tel:+905325933854">
                      <Phone className="mr-2 h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
                      İletişime Geçin
                    </a>
                  </Button>
                {listing.agent_phone && (
                  <a 
                    href={`tel:${listing.agent_phone}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>{listing.agent_phone}</span>
                  </a>
                )}
                {listing.agent_whatsapp && (
                  <a 
                    href={`https://wa.me/${listing.agent_whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5C] text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp ile Yaz
                  </a>
                )}
              </div>
            </div>

              {/* Property Info Card - Enterprise Premium - Mobile Optimized */}
              <div className="border border-slate-200/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 bg-white shadow-md sm:shadow-lg">
                <h3 className="text-base sm:text-lg md:text-lg font-display font-bold mb-4 sm:mb-5 md:mb-6 text-slate-900 tracking-tight">İlan Bilgileri</h3>
              <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium tracking-tight">İlan No:</span>
                  <span className="font-bold text-slate-900 tracking-tight">{listing.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium tracking-tight">İlan Tarihi:</span>
                  <span className="font-bold text-slate-900 tracking-tight">
                    {new Date(listing.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600 font-medium tracking-tight">Güncelleme:</span>
                  <span className="font-bold text-slate-900 tracking-tight">
                    {new Date(listing.updated_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600 font-medium tracking-tight">Durum:</span>
                  <span className={`font-bold tracking-tight ${
                    listing.available ? 'text-[#00A862]' : 'text-slate-500'
                  }`}>
                    {listing.available ? 'Müsait' : 'Kiralandı/Satıldı'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="mb-4">
                  <ShareButtons
                    url={`${siteConfig.url}${basePath}/ilan/${listing.slug}`}
                    title={listing.title}
                    description={listing.description_short}
                    listingId={listing.id}
                    listingSlug={listing.slug}
                    image={listing.images?.[0]?.url || listing.images?.[0]?.public_id}
                    variant="enhanced"
                  />
                </div>
                <ComparisonButton listingId={listing.id} variant="detail" className="w-full" />
              </div>
            </div>

            {/* QR Code Generator */}
            <QRCodeGenerator listingSlug={listing.slug} />

            {/* Business Hours Widget */}
            <BusinessHoursWidget />

            {/* View Counter */}
            <ViewCounter propertyId={listing.id} />

            {/* Trust Badges */}
            <TrustBadges 
              verified={listing.featured}
              featured={listing.featured}
              agentVerified={!!listing.agent_name}
            />

            {/* Social Proof Widget */}
            <SocialProofWidget
              propertyId={listing.id}
              propertySlug={listing.slug}
              propertyType={listing.property_type}
            />

            {/* Virtual Tour */}
            {(listing as any).virtual_tour_url || (listing as any).video_tour_url || (listing as any).floor_plan_url ? (
              <VirtualTour
                virtualTourUrl={(listing as any).virtual_tour_url}
                videoTourUrl={(listing as any).video_tour_url}
                floorPlanUrl={(listing as any).floor_plan_url}
                propertyTitle={listing.title}
              />
            ) : null}

            {/* Viewing Booking */}
            <ViewingBooking
              propertyId={listing.id}
              propertySlug={listing.slug}
              propertyTitle={listing.title}
            />

            {/* Mortgage Calculator */}
            {listing.status === 'satilik' && listing.price_amount && (
              <MortgageCalculator propertyPrice={listing.price_amount} />
            )}

            {/* Investment Analysis / Price History */}
            {listing.price_amount && (
              listing.status === 'satilik' ? (
                <InvestmentAnalysis
                  price={listing.price_amount}
                  sizeM2={listing.features.sizeM2}
                  neighborhood={listing.location_neighborhood}
                  propertyType={listing.property_type}
                  status={listing.status}
                />
              ) : (
                <PriceHistory
                  currentPrice={listing.price_amount}
                  status={listing.status}
                />
              )
            )}

            {/* Neighborhood Stats */}
            <NeighborhoodStats
              neighborhood={listing.location_neighborhood}
              basePath={basePath}
            />

            {/* Contact Form Widget */}
            <ContactFormWidget
              propertyId={listing.id}
              propertyTitle={listing.title}
            />

            {/* Sidebar Related Listings - Sticky */}
            {similarListings && similarListings.length > 0 && (
              <SidebarRelatedListings
                listings={similarListings}
                currentListingId={listing.id}
                basePath={basePath}
                limit={3}
              />
            )}
          </div>
        </aside>
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <div className="container mx-auto px-4 mt-6 print:hidden">
        <ScrollReveal direction="up" delay={100}>
          <PropertyRecommendations
            currentListingId={listing.id}
            propertyType={listing.property_type}
            status={listing.status}
            neighborhood={listing.location_neighborhood}
            basePath={basePath}
          />
        </ScrollReveal>
      </div>

      {/* Premium Related Listings */}
      {similarListings && similarListings.length > 0 && (
        <ScrollReveal direction="up" delay={150}>
          <PremiumRelatedListings
            listings={similarListings}
            currentListing={listing}
            basePath={basePath}
          />
        </ScrollReveal>
      )}

      {/* Comments Section */}
      <div className="container mx-auto px-4 mt-12 print:hidden">
        <ScrollReveal direction="up" delay={200}>
          <CommentsSection listingId={listing.id} locale={locale} />
        </ScrollReveal>
      </div>

      {/* Related Articles */}
      <div className="container mx-auto px-4 mt-6 print:hidden">
        <ScrollReveal direction="up" delay={250}>
          <RelatedArticles
            articles={[]}
            neighborhood={listing.location_neighborhood}
          />
        </ScrollReveal>
      </div>

      {/* Internal Links - SEO */}
      <div className="container mx-auto px-4 mt-6 mb-6 print:hidden">
        <ScrollReveal direction="up" delay={250}>
          <InternalLinks
            propertyType={listing.property_type}
            status={listing.status}
            neighborhood={listing.location_neighborhood}
            basePath={basePath}
          />
        </ScrollReveal>
      </div>

      {/* Sticky CTA Bar - Desktop */}
      <StickyCTABar
        propertyTitle={listing.title}
        propertyId={listing.id}
        propertySlug={listing.slug}
        propertyType={listing.property_type}
      />

      {/* Sticky Mobile CTAs */}
      <StickyMobileCTAs
        propertyTitle={listing.title}
        propertyId={listing.id}
      />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />

      {/* Print-only footer */}
      <div className="hidden print:block mt-8 pt-4 border-t-2 border-gray-300">
        <div className="text-center text-sm text-gray-600">
          <p className="mb-2">Bu ilan {new Date().toLocaleDateString('tr-TR')} tarihinde yazdırılmıştır.</p>
          <p className="font-semibold">Karasu Emlak - Güvenilir Gayrimenkul Danışmanlığı</p>
          <p>İlan No: {listing.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}

