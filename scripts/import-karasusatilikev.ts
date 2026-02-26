import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
        const envFile = fs.readFileSync(envPath, 'utf-8');
        envFile.split('\n').forEach(line => {
            const [key, ...values] = line.split('=');
            if (key && values.length > 0) {
                process.env[key.trim()] = values.join('=').trim().replace(/^["']|["']$/g, '');
            }
        });
    }
}

loadEnv();

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

        // Scrape features
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

        // If not found in simple matches, try the DOM text parsing
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

        // Guess neighborhood
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
            images: Array.from(new Set(images)).slice(0, 10), // Unique first 10
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

async function main() {
    console.log('Fetching main listings page...');
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
    console.log(`Found ${uniqueLinks.length} listing links.`);

    const { data: existingListings } = await supabase.from('listings').select('title');
    const existingTitles = new Set(existingListings?.map(l => l.title));

    console.log(`Currently there are ${existingTitles.size} listings in DB.`);

    for (const link of uniqueLinks) {
        if (link === 'https://karasusatilikev.com/ilanlar/') continue;

        setTimeout(async () => { }, 1000); // Small pause visually
        const data = await scrapeListing(link);
        if (!data) continue;

        if (existingTitles.has(data.title)) {
            console.log(`Skipping existing: ${data.title}`);
            continue;
        }

        // Additional check: Does a matching slug already exist? (Just to be safe)
        if (data.title && data.title.length > 5) {
            console.log(`Adding: ${data.title} - ${data.price_amount} TL`);
            const { error } = await supabase.from('listings').insert(data);
            if (error) {
                console.error(`Error adding ${data.title}:`, error.message);
            } else {
                existingTitles.add(data.title);
                console.log(`Successfully added: ${data.title}`);
            }
        }
    }

    console.log('Done.');
}

main().catch(console.error);
