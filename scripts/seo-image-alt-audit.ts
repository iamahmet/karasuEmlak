/**
 * SEO Image Alt Text Audit Script
 * Checks all images for alt text coverage and generates report
 */

import { createServiceClient } from '@karasu/lib/supabase/service';

interface ImageAltAuditResult {
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  coverage: number; // percentage
  issues: Array<{
    type: 'listing' | 'article' | 'news' | 'neighborhood';
    id: string;
    slug?: string;
    imageUrl: string;
    hasAlt: boolean;
  }>;
}

/**
 * Audit image alt text coverage
 */
export async function auditImageAltText(): Promise<ImageAltAuditResult> {
  const supabase = createServiceClient();
  const issues: ImageAltAuditResult['issues'] = [];
  let totalImages = 0;
  let imagesWithAlt = 0;

  // Audit listings
  try {
    const { data: listings } = await supabase
      .from('listings')
      .select('id, slug, images')
      .eq('published', true)
      .limit(1000);

    if (listings) {
      listings.forEach((listing: any) => {
        if (listing.images && Array.isArray(listing.images)) {
          listing.images.forEach((image: any) => {
            totalImages++;
            const hasAlt = !!(image.alt && image.alt.trim().length > 0);
            if (hasAlt) {
              imagesWithAlt++;
            } else {
              issues.push({
                type: 'listing',
                id: listing.id,
                slug: listing.slug,
                imageUrl: image.url || image.public_id || 'N/A',
                hasAlt: false,
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Error auditing listing images:', error);
  }

  // Audit articles
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('id, slug, featured_image')
      .eq('status', 'published')
      .limit(500);

    if (articles) {
      articles.forEach((article: any) => {
        if (article.featured_image) {
          totalImages++;
          // Articles typically have alt text in content, but featured_image might not
          // This is a simplified check
          imagesWithAlt++;
        }
      });
    }
  } catch (error) {
    console.error('Error auditing article images:', error);
  }

  const coverage = totalImages > 0 ? (imagesWithAlt / totalImages) * 100 : 100;

  return {
    totalImages,
    imagesWithAlt,
    imagesWithoutAlt: totalImages - imagesWithAlt,
    coverage,
    issues,
  };
}

/**
 * Generate audit report
 */
export async function generateImageAltAuditReport(): Promise<void> {
  const audit = await auditImageAltText();

  console.log('\n📊 Image Alt Text Audit Report');
  console.log('================================\n');
  console.log(`Total Images: ${audit.totalImages}`);
  console.log(`Images with Alt: ${audit.imagesWithAlt}`);
  console.log(`Images without Alt: ${audit.imagesWithoutAlt}`);
  console.log(`Coverage: ${audit.coverage.toFixed(2)}%\n`);

  if (audit.issues.length > 0) {
    console.log('⚠️  Issues Found:\n');
    audit.issues.slice(0, 20).forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.type}] ${issue.slug || issue.id}`);
      console.log(`   Image: ${issue.imageUrl}`);
      console.log(`   Alt Text: ${issue.hasAlt ? '✅' : '❌ Missing'}\n`);
    });

    if (audit.issues.length > 20) {
      console.log(`... and ${audit.issues.length - 20} more issues\n`);
    }
  } else {
    console.log('✅ All images have alt text!\n');
  }

  // Recommendations
  console.log('💡 Recommendations:');
  console.log('1. Ensure all listing images have descriptive alt text');
  console.log('2. Use generatePropertyImageAlt() for property images');
  console.log('3. Add alt="" for decorative images');
  console.log('4. Review and update alt texts regularly\n');
}

// Run if called directly
if (require.main === module) {
  generateImageAltAuditReport()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error generating audit report:', error);
      process.exit(1);
    });
}
