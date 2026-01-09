#!/usr/bin/env tsx
/**
 * PHASE 0: UI/UX Parity Checklist
 * 
 * Defines what to compare across all key screens
 */

export interface ScreenChecklist {
  route: string;
  name: string;
  categories: {
    layout: string[];
    navigation: string[];
    listingCard: string[];
    filters: string[];
    trustSignals: string[];
    conversion: string[];
    performance: string[];
    accessibility: string[];
    mobile: string[];
  };
}

export const UI_PARITY_CHECKLIST: ScreenChecklist[] = [
  {
    route: '/',
    name: 'Homepage',
    categories: {
      layout: [
        'Hero section present',
        'Clear value proposition',
        'Search box above fold',
        'Featured listings section',
        'Trust signals visible',
        'Footer with NAP',
      ],
      navigation: [
        'Main nav visible',
        'Mobile menu functional',
        'Language switcher accessible',
        'Breadcrumbs (if applicable)',
      ],
      listingCard: [
        'Card has image',
        'Card has price',
        'Card has title',
        'Card has location',
        'Card has key features (m2, rooms)',
        'Card has CTA button',
        'Card hover state',
      ],
      filters: [
        'Quick filters visible',
        'Advanced filters accessible',
        'Filter chips show active state',
        'Clear filters option',
      ],
      trustSignals: [
        'Phone number visible',
        'Email visible',
        'Address visible',
        'Trust badges/certifications',
        'Testimonials/reviews',
      ],
      conversion: [
        'WhatsApp button visible',
        'Call button visible',
        'Contact form accessible',
        'Inquiry CTA on listings',
      ],
      performance: [
        'LCP < 2.5s',
        'CLS < 0.1',
        'TBT < 200ms',
        'Images optimized',
      ],
      accessibility: [
        'Keyboard navigation works',
        'Focus indicators visible',
        'Contrast ratios meet WCAG AA',
        'Alt text on images',
        'ARIA labels present',
      ],
      mobile: [
        'Sticky CTA on mobile',
        'Thumb-friendly button sizes',
        'Mobile menu accessible',
        'Filters in bottom sheet',
      ],
    },
  },
  {
    route: '/satilik',
    name: 'Satılık Listings',
    categories: {
      layout: [
        'Page title clear',
        'Results count visible',
        'Sort options visible',
        'Grid/list toggle',
      ],
      navigation: [
        'Breadcrumbs present',
        'Back to home link',
        'Category filters in nav',
      ],
      listingCard: [
        'All cards same height',
        'Price prominent',
        'Location clear',
        'Features visible',
        'Status badge (new/sold)',
        'Favorite button',
      ],
      filters: [
        'Filters sidebar/bar visible',
        'Price range slider',
        'Location selector',
        'Property type checkboxes',
        'Room count selector',
        'Area range',
        'Apply filters button',
        'Active filter count',
      ],
      trustSignals: [
        'Verified listings badge',
        'Updated date visible',
        'Agent info (if applicable)',
      ],
      conversion: [
        'Quick inquiry on card',
        'View details CTA',
        'Bulk inquiry option',
      ],
      performance: [
        'Lazy load images',
        'Infinite scroll or pagination',
        'Fast filter application',
      ],
      accessibility: [
        'Filter labels clear',
        'Form fields accessible',
        'Skip to results link',
      ],
      mobile: [
        'Sticky filter button',
        'Card swipe actions',
        'Bottom sheet filters',
      ],
    },
  },
  {
    route: '/ilan/[slug]',
    name: 'Listing Detail',
    categories: {
      layout: [
        'Hero image/gallery',
        'Title and price prominent',
        'Key info block',
        'Description section',
        'Features table',
        'Location map',
        'Similar listings',
      ],
      navigation: [
        'Breadcrumbs',
        'Back button',
        'Share buttons',
      ],
      listingCard: [
        'N/A (detail page)',
      ],
      filters: [
        'N/A (detail page)',
      ],
      trustSignals: [
        'Listing ID visible',
        'Last updated date',
        'Verified badge',
        'Agent contact info',
      ],
      conversion: [
        'Sticky contact CTA',
        'WhatsApp quick message',
        'Call button',
        'Inquiry form',
        'Schedule viewing',
      ],
      performance: [
        'Gallery loads fast',
        'Map lazy loads',
        'Images optimized',
      ],
      accessibility: [
        'Gallery keyboard nav',
        'Form accessible',
        'Skip to contact',
      ],
      mobile: [
        'Sticky contact bar',
        'Swipeable gallery',
        'Easy share',
      ],
    },
  },
  {
    route: '/karasu/[mahalle]',
    name: 'Neighborhood Page',
    categories: {
      layout: [
        'Neighborhood hero',
        'Overview section',
        'Listings in area',
        'Local info (schools, etc)',
        'Map of area',
      ],
      navigation: [
        'Breadcrumbs',
        'Related neighborhoods',
      ],
      listingCard: [
        'Listings in neighborhood',
        'Distance indicators',
      ],
      filters: [
        'Filter by property type',
        'Price range for area',
      ],
      trustSignals: [
        'Area statistics',
        'Market trends',
      ],
      conversion: [
        'Contact for area info',
        'View listings CTA',
      ],
      performance: [
        'Fast page load',
        'Optimized images',
      ],
      accessibility: [
        'Clear headings',
        'Accessible map',
      ],
      mobile: [
        'Mobile-friendly layout',
        'Easy navigation',
      ],
    },
  },
  {
    route: '/blog',
    name: 'Blog Listing',
    categories: {
      layout: [
        'Blog title/hero',
        'Article grid/list',
        'Categories sidebar',
        'Search box',
      ],
      navigation: [
        'Category filters',
        'Tag filters',
        'Pagination',
      ],
      listingCard: [
        'Article card with image',
        'Title and excerpt',
        'Date and author',
        'Read more CTA',
      ],
      filters: [
        'Category dropdown',
        'Tag chips',
        'Date range',
      ],
      trustSignals: [
        'Author credibility',
        'Update dates',
      ],
      conversion: [
        'Newsletter signup',
        'Related articles',
      ],
      performance: [
        'Fast article load',
        'Image optimization',
      ],
      accessibility: [
        'Semantic HTML',
        'Clear headings',
      ],
      mobile: [
        'Mobile-friendly cards',
        'Easy scrolling',
      ],
    },
  },
  {
    route: '/blog/[slug]',
    name: 'Blog Detail',
    categories: {
      layout: [
        'Article hero image',
        'Title and meta',
        'Table of contents',
        'Content sections',
        'Related articles',
        'Author bio',
      ],
      navigation: [
        'Breadcrumbs',
        'Share buttons',
        'Previous/next',
      ],
      listingCard: [
        'N/A',
      ],
      filters: [
        'N/A',
      ],
      trustSignals: [
        'Author info',
        'Publish date',
        'Update date',
      ],
      conversion: [
        'Newsletter CTA',
        'Related listings',
        'Contact form',
      ],
      performance: [
        'Fast content load',
        'Lazy load images',
      ],
      accessibility: [
        'Semantic structure',
        'Skip to content',
      ],
      mobile: [
        'Readable typography',
        'Easy sharing',
      ],
    },
  },
  {
    route: '/arama',
    name: 'Search',
    categories: {
      layout: [
        'Search box prominent',
        'Recent searches',
        'Suggestions',
        'Results display',
      ],
      navigation: [
        'Clear search',
        'Filter results',
      ],
      listingCard: [
        'Search result cards',
        'Relevance indicators',
      ],
      filters: [
        'Search filters',
        'Sort by relevance',
      ],
      trustSignals: [
        'Result count',
        'Search quality',
      ],
      conversion: [
        'Quick view',
        'Save search',
      ],
      performance: [
        'Fast search',
        'Debounced input',
      ],
      accessibility: [
        'Keyboard navigation',
        'Screen reader support',
      ],
      mobile: [
        'Mobile search UX',
        'Voice search (if available)',
      ],
    },
  },
  {
    route: '/iletisim',
    name: 'Contact',
    categories: {
      layout: [
        'Contact form',
        'Contact info block',
        'Map location',
        'Office hours',
      ],
      navigation: [
        'Breadcrumbs',
        'Back link',
      ],
      listingCard: [
        'N/A',
      ],
      filters: [
        'N/A',
      ],
      trustSignals: [
        'NAP visible',
        'Office address',
        'Business hours',
      ],
      conversion: [
        'Form submission',
        'WhatsApp link',
        'Call button',
      ],
      performance: [
        'Fast form load',
        'Quick submission',
      ],
      accessibility: [
        'Form labels',
        'Error messages',
      ],
      mobile: [
        'Mobile-friendly form',
        'Easy contact',
      ],
    },
  },
];

/**
 * Export checklist as JSON for other tools
 */
export function getChecklistForRoute(route: string): ScreenChecklist | undefined {
  return UI_PARITY_CHECKLIST.find(item => item.route === route);
}

export function getAllRoutes(): string[] {
  return UI_PARITY_CHECKLIST.map(item => item.route);
}
