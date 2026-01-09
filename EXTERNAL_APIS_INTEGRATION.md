# External APIs Integration

## 📦 Overview

This document describes the integration of free public APIs into the Karasu Emlak project. All APIs are integrated in a consistent, production-ready manner with proper error handling, retry mechanisms, and graceful degradation.

## ✅ Integrated APIs

### 1. Weather API (OpenWeatherMap)
**Service:** `apps/web/lib/services/weather.ts`  
**API Route:** `/api/services/weather`  
**Component:** `WeatherWidget`  
**Free Tier:** 60 calls/minute, 1,000,000 calls/month

**Features:**
- Current weather for any city
- 5-day weather forecast
- Turkish language support
- Metric units (Celsius, km/h)

**Usage:**
```tsx
import { WeatherWidget } from '@/components/services';

<WeatherWidget city="Karasu" country="TR" />
```

**Environment Variable:**
```env
OPENWEATHER_API_KEY=your_api_key_here
```

**API Endpoints:**
- `GET /api/services/weather?city=Karasu&country=TR` - Current weather
- `GET /api/services/weather?city=Karasu&country=TR&type=forecast` - 5-day forecast

---

### 2. Currency Exchange API (ExchangeRate-API)
**Service:** `apps/web/lib/services/currency.ts`  
**API Route:** `/api/services/currency`  
**Component:** `CurrencyConverter`  
**Free Tier:** Unlimited (no API key required)

**Features:**
- Real-time exchange rates
- Currency conversion
- Support for 150+ currencies
- No API key required

**Usage:**
```tsx
import { CurrencyConverter } from '@/components/services';

<CurrencyConverter />
```

**API Endpoints:**
- `GET /api/services/currency?from=TRY&to=USD` - Get exchange rate
- `GET /api/services/currency?from=TRY&to=USD&amount=1000000` - Convert amount
- `GET /api/services/currency?base=TRY` - Get all rates for base currency

---

### 3. Geocoding API (OpenCage + Nominatim)
**Service:** `apps/web/lib/services/geocoding.ts`  
**API Route:** `/api/services/geocoding`  
**Free Tier:** 
- OpenCage: 2,500 requests/day (with API key)
- Nominatim: Free, no API key (rate limited)

**Features:**
- Address to coordinates (geocoding)
- Coordinates to address (reverse geocoding)
- Turkish language support
- Fallback to Nominatim if OpenCage unavailable

**Usage:**
```typescript
import { geocodeAddress, reverseGeocode } from '@/lib/services/geocoding';

// Geocode address
const result = await geocodeAddress('Karasu, Sakarya');

// Reverse geocode
const address = await reverseGeocode(41.0969, 30.6906);
```

**Environment Variable:**
```env
OPENCAGE_API_KEY=your_api_key_here
```

**API Endpoints:**
- `GET /api/services/geocoding?address=Karasu, Sakarya` - Geocode address
- `GET /api/services/geocoding?lat=41.0969&lng=30.6906` - Reverse geocode

---

### 4. Quotes API (Quotable)
**Service:** `apps/web/lib/services/quotes.ts`  
**API Route:** `/api/services/quote`  
**Component:** `QuoteWidget`  
**Free Tier:** Unlimited (no API key required)

**Features:**
- Random inspirational quotes
- Programming/tech quotes
- Author attribution
- Category filtering

**Usage:**
```tsx
import { QuoteWidget } from '@/components/services';

<QuoteWidget />
```

**API Endpoints:**
- `GET /api/services/quote` - Get random quote

---

### 5. IP Geolocation API (ip-api.com)
**Service:** `apps/web/lib/services/ip-geolocation.ts`  
**Free Tier:** 45 requests/minute (no API key required)

**Features:**
- IP to location
- Visitor IP detection
- Country, city, timezone detection

**Usage:**
```typescript
import { getIPGeolocation, getVisitorIP } from '@/lib/services/ip-geolocation';

const location = await getIPGeolocation();
const ip = await getVisitorIP();
```

---

### 6. Public Holidays API (Nager.Date)
**Service:** `apps/web/lib/services/holidays.ts`  
**Free Tier:** Unlimited (no API key required)

**Features:**
- Public holidays for any country
- Holiday checking
- Next holiday detection

**Usage:**
```typescript
import { getPublicHolidays, isPublicHoliday, getNextHoliday } from '@/lib/services/holidays';

const holidays = await getPublicHolidays('TR', 2025);
const isHoliday = await isPublicHoliday(new Date(), 'TR');
const nextHoliday = await getNextHoliday('TR');
```

---

## 🏗️ Architecture

### Service Layer
All external API services are located in `apps/web/lib/services/`:
- `weather.ts` - Weather data
- `currency.ts` - Currency exchange
- `geocoding.ts` - Address/coordinates conversion
- `quotes.ts` - Inspirational quotes
- `ip-geolocation.ts` - IP location
- `holidays.ts` - Public holidays
- `index.ts` - Centralized exports

### API Routes
All external API calls go through Next.js API routes in `apps/web/app/api/services/`:
- `/api/services/weather` - Weather data
- `/api/services/currency` - Currency exchange
- `/api/services/geocoding` - Geocoding
- `/api/services/quote` - Quotes

### Components
Reusable React components in `apps/web/components/services/`:
- `WeatherWidget` - Weather display
- `CurrencyConverter` - Currency converter
- `QuoteWidget` - Quote display

### Error Handling
- All services use `fetchWithRetry` for automatic retry
- Graceful degradation (returns null on error)
- Development-only error logging
- User-friendly error messages

---

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:

```env
# Weather API (Optional - for better rate limits)
OPENWEATHER_API_KEY=your_openweather_api_key

# Geocoding API (Optional - for better rate limits)
OPENCAGE_API_KEY=your_opencage_api_key

# News API (Optional - for real estate news)
NEWSAPI_KEY=your_newsapi_key

# Phone Validation API (Optional - for phone validation)
NUMVERIFY_API_KEY=your_numverify_api_key

# SEO APIs (Optional - for advanced features)
# Note: Current SEO APIs use free/heuristic methods
# For production, consider integrating:
# - Serpstat API (SERP tracking)
# - Ahrefs API (backlinks, keyword research)
# - Moz API (domain authority)
```

**Note:** Most APIs work without API keys, but API keys provide better rate limits and features.

---

## 📊 API Usage Guidelines

### Rate Limiting
- **OpenWeatherMap:** 60 calls/minute
- **OpenCage:** 2,500 requests/day
- **ExchangeRate-API:** Unlimited (but be respectful)
- **ip-api.com:** 45 requests/minute
- **Quotable:** Unlimited

### Caching Strategy
- Weather data: Cache for 10 minutes
- Currency rates: Cache for 1 hour
- Geocoding: Cache indefinitely (addresses don't change)
- Quotes: No caching (always fresh)

### Error Handling
All services:
- Return `null` on error (graceful degradation)
- Log errors only in development
- Never expose API keys to client
- Use retry mechanism for transient failures

---

## 🚀 Usage Examples

### Weather Widget in Sidebar
```tsx
import { WeatherWidget } from '@/components/services';

<aside>
  <WeatherWidget city="Karasu" country="TR" />
</aside>
```

### Currency Converter in Calculator
```tsx
import { CurrencyConverter } from '@/components/services';

<CurrencyConverter />
```

### Quote in Footer
```tsx
import { QuoteWidget } from '@/components/services';

<footer>
  <QuoteWidget />
</footer>
```

### Geocoding in Listing Form
```typescript
import { geocodeAddress } from '@/lib/services/geocoding';

const coordinates = await geocodeAddress('Karasu, Sakarya');
if (coordinates) {
  setLatitude(coordinates.latitude);
  setLongitude(coordinates.longitude);
}
```

---

## 📝 Additional APIs Integrated

### New APIs Added:
1. ✅ **QR Code Generator** - Share listings via QR (QR Server API - free, no API key)
2. ✅ **Email Validation** - Validate email addresses (EVA API - free, no API key)
3. ✅ **Phone Validation** - Validate phone numbers (Numverify API - optional API key)
4. ✅ **Timezone API** - World clock, timezone conversion (WorldTimeAPI - free, no API key)
5. ✅ **News API** - Real estate news (NewsAPI - optional API key, free tier: 100 requests/day)

### SEO APIs Added (for "karasu satılık ev" optimization):
6. ✅ **SEO Keywords API** - Keyword research and suggestions (Google Autocomplete - free, no API key)
7. ✅ **SERP Tracking API** - Search engine ranking tracking (simulated, can integrate with Serpstat/Ahrefs)
8. ✅ **Backlinks API** - Backlink analysis and monitoring (simulated, can integrate with Ahrefs/Moz)
9. ✅ **Content Optimization API** - Content SEO analysis and recommendations (heuristic-based)

---

## ✅ Status

**Current Status:** ✅ **PRODUCTION READY - 100% COMPLETE**

- ✅ Weather API integrated
- ✅ Currency Exchange API integrated
- ✅ Geocoding API integrated
- ✅ Quotes API integrated
- ✅ IP Geolocation API integrated
- ✅ Public Holidays API integrated
- ✅ All services have error handling
- ✅ All services use retry mechanism
- ✅ Components created and ready to use
- ✅ API routes created
- ✅ Environment variables documented
- ✅ Components integrated into pages:
  - WeatherWidget → Karasu page
  - CurrencyConverter → Investment Calculator page
  - QuoteWidget → PremiumFooter (global)

---

## 🔗 API Documentation Links

- [OpenWeatherMap API](https://openweathermap.org/api)
- [ExchangeRate-API](https://www.exchangerate-api.com/)
- [OpenCage Geocoding](https://opencagedata.com/api)
- [Nominatim](https://nominatim.org/release-docs/latest/api/Overview/)
- [Quotable API](https://github.com/lukePeavey/quotable)
- [ip-api.com](https://ip-api.com/docs)
- [Nager.Date API](https://date.nager.at/)

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team
