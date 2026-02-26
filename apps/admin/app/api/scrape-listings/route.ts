import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and Service Role Key must be set');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function parsePrice(text: string): number {
    const clean = text.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
}

async function scrapeListing(url: string) {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        const title = $('h1').text().trim() || $('h2.text-2xl').text().trim() || $('h4.text-brand-navy').text().trim() || $('title').text().trim();

        let priceText = '';
        $('*').each((i, el) => {
            const text = $(el).text().trim();
            if (text.includes('TL') && text.length < 30) {
                priceText = text;
            }
        });

        const price = parsePrice(priceText);

        let rooms = '';
        let sizeM2 = 0;

        $('div, span, li, p').each((i, el) => {
            const text = $(el).text().replace(/\s+/g, ' ').trim();
            if (text.includes('Oda Sayısı')) {
                const match = text.match(/Oda Sayısı\s*([\d\+]+)/);
                if (match) rooms = match[1];
            }
            if (text.includes('Metrekare')) {
                const match = text.match(/Metrekare\s*(\d+)/);
                if (match) sizeM2 = parseInt(match[1], 10);
            }
        });

        if (!rooms || !sizeM2) {
            const fullText = $('body').text().replace(/\s+/g, ' ');
            const matchRooms = fullText.match(/Oda Sayısı\s*([\d\+]+)/);
            if (matchRooms) rooms = matchRooms[1];

            const matchSq = fullText.match(/Metrekare\s*(\d+)/);
            if (matchSq) sizeM2 = parseInt(matchSq[1], 10);
        }

        const description = $('p').text().trim().substring(0, 1000);

        const images: string[] = [];
        $('img').each((i, el) => {
            const src = $(el).attr('src');
            if (src && src.includes('uploads') && !src.includes('logo') && !src.includes('icon')) {
                images.push(new URL(src, 'https://karasusatilikev.com').href);
            }
        });

        if (!title) return null;

        let property_type = 'daire';
        if (title.toLowerCase().includes('villa')) property_type = 'villa';
        if (title.toLowerCase().includes('arsa')) property_type = 'arsa';
        if (title.toLowerCase().includes('müstakil') || title.toLowerCase().includes('ev')) property_type = 'ev';
        if (title.toLowerCase().includes('yazlık')) property_type = 'yazlik';

        const slug = `${generateSlug(title)}-${Date.now()}`;

        const lowerTitle = title.toLowerCase();
        let neighborhood = 'Merkez';
        ['Yalı', 'Aziziye', 'İncilli', 'Kabakoz', 'Kuzuluk', 'Plaj', 'Yenimahalle'].forEach(n => {
            if (lowerTitle.includes(n.toLowerCase())) {
                neighborhood = n;
            }
        });

        const parsedRooms = parseInt(rooms.split('+')[0] || '2', 10);

        return {
            title,
            slug,
            status: 'satilik',
            property_type,
            location_neighborhood: neighborhood,
            location_district: 'Karasu',
            location_city: 'Sakarya',
            price_amount: price > 0 ? price : 2500000,
            price_currency: 'TRY',
            description_short: description.substring(0, 120) || title,
            description_long: `<p>${description || title}</p>`,
            images: Array.from(new Set(images)).slice(0, 10),
            features: {
                sizeM2: sizeM2 || 100,
                rooms: parsedRooms,
            },
            published: true,
            available: true
        };
    } catch (err) {
        console.error(`Error scraping ${url}:`, err);
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const url = 'https://karasusatilikev.com/ilanlar/';
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);

        const links = new Set<string>();

        $('a').each((i, el) => {
            const href = $(el).attr('href');
            if (href && (href.includes('ilan/') || href.includes('gayrimenkul/'))) {
                links.add(href);
            }
        });

        const uniqueLinks = Array.from(links);

        const { data: existingListings } = await supabase.from('listings').select('title');
        const existingTitles = new Set(existingListings?.map(l => l.title));

        let addedCount = 0;
        const addedTitles = [];

        // Note: Doing too many requests synchronously inside an API endpoint might hit execution timeouts on Vercel. 
        // We will do a subset or await them up to limits of edge function time.
        // Given uniqueLinks is ~12-20, it should be fine.

        const maxProcess = 15;
        const processLinks = uniqueLinks.slice(0, maxProcess);

        for (const link of processLinks) {
            if (link === 'https://karasusatilikev.com/ilanlar/') continue;

            const data = await scrapeListing(link);
            if (!data) continue;

            if (existingTitles.has(data.title)) {
                continue;
            }

            if (data.title && data.title.length > 5) {
                const { error } = await supabase.from('listings').insert(data);
                if (!error) {
                    existingTitles.add(data.title);
                    addedTitles.push(data.title);
                    addedCount++;
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `${addedCount} yeni ilan başarıyla içe aktarıldı.`,
            addedTitles
        });

    } catch (error: any) {
        console.error('Failed to scrape:', error);
        return NextResponse.json(
            { success: false, error: 'Web sitesi taranırken bir hata oluştu: ' + error.message },
            { status: 500 }
        );
    }
}
