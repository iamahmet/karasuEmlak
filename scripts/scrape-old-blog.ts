/**
 * Script to scrape blog article URLs from old site
 * 
 * This script visits karasuemlak.net/blog and extracts all article URLs
 * 
 * Usage: pnpm tsx scripts/scrape-old-blog.ts
 */

import * as cheerio from 'cheerio';

interface BlogArticle {
  title: string;
  url: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
}

async function scrapeBlogUrls(): Promise<BlogArticle[]> {
  const articles: BlogArticle[] = [];
  
  try {
    console.log('🔍 Fetching blog page from karasuemlak.net/blog...');
    
    const response = await fetch('https://karasuemlak.net/blog', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Find all article links
    // Adjust selectors based on actual HTML structure
    $('article a, .article-link, .blog-post a').each((_, element) => {
      const $link = $(element);
      const href = $link.attr('href');
      const title = $link.text().trim() || $link.attr('title') || '';
      
      if (href && href.includes('/blog/')) {
        const fullUrl = href.startsWith('http') ? href : `https://karasuemlak.net${href}`;
        const slug = href.split('/blog/')[1]?.split('?')[0] || '';
        
        if (slug && title) {
          articles.push({
            title,
            url: fullUrl,
            slug,
          });
        }
      }
    });
    
    // Also check for pagination and scrape all pages
    const paginationLinks = $('.pagination a, .page-numbers a');
    const totalPages = paginationLinks.length > 0 
      ? Math.max(...paginationLinks.map((_, el) => {
          const pageNum = parseInt($(el).text()) || 0;
          return pageNum;
        }).get())
      : 1;
    
    console.log(`📄 Found ${totalPages} page(s) to scrape`);
    
    // Scrape additional pages if needed
    for (let page = 2; page <= totalPages; page++) {
      try {
        const pageResponse = await fetch(`https://karasuemlak.net/blog?page=${page}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        
        if (pageResponse.ok) {
          const pageHtml = await pageResponse.text();
          const $page = cheerio.load(pageHtml);
          
          $page('article a, .article-link, .blog-post a').each((_, element) => {
            const $link = $page(element);
            const href = $link.attr('href');
            const title = $link.text().trim() || $link.attr('title') || '';
            
            if (href && href.includes('/blog/')) {
              const fullUrl = href.startsWith('http') ? href : `https://karasuemlak.net${href}`;
              const slug = href.split('/blog/')[1]?.split('?')[0] || '';
              
              if (slug && title && !articles.find(a => a.slug === slug)) {
                articles.push({
                  title,
                  url: fullUrl,
                  slug,
                });
              }
            }
          });
        }
        
        // Delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`⚠️  Error scraping page ${page}:`, error);
      }
    }
    
    console.log(`✅ Found ${articles.length} unique articles`);
    
  } catch (error) {
    console.error('❌ Error scraping blog:', error);
    throw error;
  }
  
  return articles;
}

async function scrapeArticleContent(article: BlogArticle): Promise<{
  content: string;
  excerpt?: string;
  publishedAt?: string;
  author?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
}> {
  try {
    console.log(`📄 Fetching content for: ${article.title}`);
    
    const response = await fetch(article.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract content - adjust selectors based on actual HTML structure
    const content = $('.article-content, .post-content, .entry-content, article').html() || '';
    const excerpt = $('.excerpt, .summary, .article-excerpt').text().trim() || undefined;
    const publishedAt = $('time[datetime], .published-date, .date').attr('datetime') || 
                       $('time[datetime], .published-date, .date').text().trim() || undefined;
    const author = $('.author, .by-author, [rel="author"]').text().trim() || undefined;
    const category = $('.category, .post-category').text().trim() || undefined;
    const tags = $('.tags a, .tag a').map((_, el) => $(el).text().trim()).get();
    const featuredImage = $('.featured-image img, .post-thumbnail img, article img').first().attr('src') || undefined;
    
    return {
      content: content || '',
      excerpt,
      publishedAt,
      author,
      category,
      tags: tags.length > 0 ? tags : undefined,
      featuredImage,
    };
  } catch (error) {
    console.error(`❌ Error fetching content for ${article.url}:`, error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  scrapeBlogUrls()
    .then(async (articles) => {
      console.log(`\n📋 Found ${articles.length} articles:\n`);
      articles.forEach((article, index) => {
        console.log(`${index + 1}. ${article.title} - ${article.url}`);
      });
      
      // Save to JSON file
      const fs = await import('fs/promises');
      await fs.writeFile(
        'scripts/old-blog-articles.json',
        JSON.stringify(articles, null, 2)
      );
      console.log('\n✅ Article URLs saved to scripts/old-blog-articles.json');
      
      // Optionally fetch content for all articles
      if (process.argv.includes('--fetch-content')) {
        console.log('\n📄 Fetching article content...\n');
        const articlesWithContent = [];
        
        for (const article of articles) {
          try {
            const content = await scrapeArticleContent(article);
            articlesWithContent.push({
              ...article,
              ...content,
            });
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`⚠️  Skipping ${article.title} due to error`);
          }
        }
        
        await fs.writeFile(
          'scripts/old-blog-articles-with-content.json',
          JSON.stringify(articlesWithContent, null, 2)
        );
        console.log('\n✅ Article content saved to scripts/old-blog-articles-with-content.json');
      }
    })
    .catch((error) => {
      console.error('💥 Scraping failed:', error);
      process.exit(1);
    });
}

export { scrapeBlogUrls, scrapeArticleContent };
