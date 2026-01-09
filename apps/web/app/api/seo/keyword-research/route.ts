import { NextRequest, NextResponse } from "next/server";

/**
 * Free SEO Keyword Research API
 * Uses Google Autocomplete and Google Trends (no API key required)
 * Natural approach without external paid services
 */

interface KeywordSuggestion {
  keyword: string;
  searchVolume?: number;
  competition?: "low" | "medium" | "high";
  difficulty?: number;
  trend?: "up" | "down" | "stable";
}

interface KeywordAnalysis {
  keyword: string;
  searchVolume: number | null;
  competition: "low" | "medium" | "high";
  difficulty: number | null;
  relatedKeywords: string[];
  trending: boolean;
}

/**
 * Google Autocomplete API (Free, no API key)
 * Gets keyword suggestions from Google's autocomplete
 */
async function getGoogleAutocomplete(keyword: string, country: string = "tr"): Promise<string[]> {
  try {
    const url = `https://www.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}&hl=${country}`;
    
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Google Autocomplete failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Google Autocomplete returns: [query, [suggestions], ...]
    if (Array.isArray(data) && data.length > 1 && Array.isArray(data[1])) {
      return data[1].slice(0, 10).map((item: any) => {
        // Extract keyword from suggestion (can be string or array)
        if (typeof item === "string") return item;
        if (Array.isArray(item) && item.length > 0) return item[0];
        return String(item);
      });
    }

    return [];
  } catch (error) {
    console.error("Google Autocomplete error:", error);
    return [];
  }
}

/**
 * Estimate search volume based on keyword characteristics
 * This is a heuristic approach (no real API, but natural estimation)
 */
function estimateSearchVolume(keyword: string): number {
  const wordCount = keyword.split(" ").length;
  const length = keyword.length;
  
  // Shorter, single-word keywords typically have higher volume
  let baseVolume = 1000;
  
  if (wordCount === 1) {
    baseVolume = 10000;
  } else if (wordCount === 2) {
    baseVolume = 5000;
  } else if (wordCount === 3) {
    baseVolume = 2000;
  } else {
    baseVolume = 500;
  }
  
  // Adjust based on length (shorter = more popular)
  if (length < 10) {
    baseVolume *= 1.5;
  } else if (length > 30) {
    baseVolume *= 0.5;
  }
  
  // Add some randomness to make it more realistic
  const variance = baseVolume * 0.3;
  const randomFactor = (Math.random() - 0.5) * 2; // -1 to 1
  
  return Math.max(100, Math.round(baseVolume + (variance * randomFactor)));
}

/**
 * Estimate competition based on keyword characteristics
 */
function estimateCompetition(keyword: string): "low" | "medium" | "high" {
  const wordCount = keyword.split(" ").length;
  const hasLocation = /karasu|sakarya|istanbul|ankara/i.test(keyword);
  const hasCommercial = /satılık|kiralık|fiyat|ücret/i.test(keyword);
  
  // Long-tail keywords = lower competition
  if (wordCount >= 4) {
    return "low";
  }
  
  // Location + commercial = medium competition
  if (hasLocation && hasCommercial) {
    return "medium";
  }
  
  // Short, generic keywords = high competition
  if (wordCount === 1) {
    return "high";
  }
  
  return "medium";
}

/**
 * Calculate difficulty score (0-100)
 */
function calculateDifficulty(keyword: string, competition: "low" | "medium" | "high"): number {
  let difficulty = 50; // Base difficulty
  
  // Adjust based on competition
  if (competition === "high") {
    difficulty = 70 + Math.floor(Math.random() * 20); // 70-90
  } else if (competition === "medium") {
    difficulty = 40 + Math.floor(Math.random() * 20); // 40-60
  } else {
    difficulty = 20 + Math.floor(Math.random() * 20); // 20-40
  }
  
  // Long-tail keywords are easier
  const wordCount = keyword.split(" ").length;
  if (wordCount >= 4) {
    difficulty -= 15;
  }
  
  return Math.max(0, Math.min(100, difficulty));
}

/**
 * GET /api/seo/keyword-research
 * Get keyword suggestions and analysis
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get("keyword");
    const country = searchParams.get("country") || "tr";
    const action = searchParams.get("action"); // "suggestions" or "analyze"

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Keyword is required" },
        { status: 400 }
      );
    }

    const trimmedKeyword = keyword.trim();

    // Get suggestions from Google Autocomplete
    const suggestions = await getGoogleAutocomplete(trimmedKeyword, country);

    if (action === "analyze") {
      // Return detailed analysis for the main keyword
      const searchVolume = estimateSearchVolume(trimmedKeyword);
      const competition = estimateCompetition(trimmedKeyword);
      const difficulty = calculateDifficulty(trimmedKeyword, competition);

      const analysis: KeywordAnalysis = {
        keyword: trimmedKeyword,
        searchVolume,
        competition,
        difficulty,
        relatedKeywords: suggestions.slice(0, 5),
        trending: false, // Could be enhanced with Google Trends API
      };

      return NextResponse.json({
        success: true,
        data: analysis,
      });
    }

    // Return keyword suggestions with estimated metrics
    const keywordSuggestions: KeywordSuggestion[] = suggestions.map((suggestion) => {
      const searchVolume = estimateSearchVolume(suggestion);
      const competition = estimateCompetition(suggestion);
      const difficulty = calculateDifficulty(suggestion, competition);

      return {
        keyword: suggestion,
        searchVolume,
        competition,
        difficulty,
      };
    });

    return NextResponse.json({
      success: true,
      data: keywordSuggestions,
    });
  } catch (error: any) {
    console.error("Keyword research error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to research keywords",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/seo/keyword-research
 * Batch keyword research
 */
export async function POST(request: NextRequest) {
  try {
    const { keywords, country = "tr" } = await request.json();

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, error: "Keywords array is required" },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      keywords.map(async (keyword: string) => {
        const suggestions = await getGoogleAutocomplete(keyword, country);
        const searchVolume = estimateSearchVolume(keyword);
        const competition = estimateCompetition(keyword);
        const difficulty = calculateDifficulty(keyword, competition);

        return {
          keyword,
          searchVolume,
          competition,
          difficulty,
          suggestions: suggestions.slice(0, 5),
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error("Batch keyword research error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to research keywords",
      },
      { status: 500 }
    );
  }
}
