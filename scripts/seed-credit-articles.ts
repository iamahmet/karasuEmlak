import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

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

const articles = [
    {
        title: 'Karasu Satılık Daire Alırken Konut Kredisi Rehberi 2026',
        slug: 'karasu-satilik-daire-alirken-konut-kredisi-rehberi-2026',
        excerpt: 'Karasu satılık daire yatırımı yaparken en uygun konut kredisi, ev kredisi ve emlak kredisi fırsatlarını nasıl değerlendirebileceğinize dair detaylı uzman rehberi.',
        meta_description: 'Karasu satılık daire ilanlarını değerlendirirken ev kredisi oranları nasıl hesaplanır? 2026 yılı emlak kredisi oranlarıyla desteklenmiş Karasu yatırım rehberi.',
        content: `<h2>Karasu Satılık Daire Piyasasında Konut Kredisi Fırsatları</h2>
<p>Karasu, Türkiye'nin son yıllarda en çok değer kazanan kıyı ilçelerinden biridir. Denize sıfır projeleri, doğası ve gelişen altyapısı sayesinde <strong>Karasu satılık daire</strong> piyasası her geçen gün hareketleniyor. Eğer siz de Karasu'da bir yatırım yapmayı ya da yazlık sahibi olmayı planlıyorsanız, <a href="/kredi-hesaplayici">konut kredisi hesaplama</a> araçlarını kullanarak bütçenize en uygun adımı atabilirsiniz.</p>

<h3>Ev Kredisi mi Nakit mi?</h3>
<p>Genellikle gayrimenkul alımlarında nakit avantajlı görünse de, artan emlak değerleri <strong>ev kredisi</strong> kullanmayı çok daha mantıklı bir yatırım aracına dönüştürdü. Peşinatınızı verip, kalan tutarı sizin için en uygun <strong>emlak kredisi</strong> vade planıyla ödeyerek, evinizin değer kazanmasından çok daha hızlı fayda sağlarsınız. Özellikle <a href="/satilik">Karasu satılık daire ilanları</a> gibi hızlı değer artışı gösteren bölgelerde, enflasyonist sistemde kredi ile borçlanmak uzun vadede ciddi kazanç sağlar.</p>

<h3>Konut Kredisi Alırken Nelere Dikkat Edilmeli?</h3>
<ul>
  <li><strong>Faiz Oranları:</strong> Kredi faiz oranlarının anaparanızı ne kadar etkilediğini önceden <a href="/kredi-hesaplayici">Kredi Hesaplayıcı</a> sayfamızdan test edin.</li>
  <li><strong>Krediye Uygunluk:</strong> Seçtiğiniz <em>Karasu satılık daire</em> ilanının konut kredisine uygun olması gerekir (kat mülkiyeti durumu/iskanı sorunsuz olmalı). Firmamız portföyündeki emlakların %95'i krediye uygundur.</li>
  <li><strong>Amortisman Süresi (Kira Çarpanı):</strong> Eğer evinizi <a href="/kiralik">Karasu kiralık daire</a> olarak değerlendirmek ve kira getirisiyle kredi taksitlerinizi ödemek istiyorsanız mutlaka sitemizdeki kira oranlarına göz atın.</li>
</ul>

<h3>Karasu Emlak Piyasasında Kredi Adımları</h3>
<p>Karasu Emlak olarak <strong>ev kredisi</strong> ve <strong>konut kredisi</strong> ile ilgili tüm bürokratik işlemlerinizde danışmanlık yapıyoruz. Sadece bir daire almak değil; bu süreçte bankalarla olan değerleme (ekspertiz) operasyonlarınızı profesyonelce tamamlıyoruz. Sizin tek yapmanız gereken hayalinizdeki <a href="/satilik">Karasu satılık daireyi</a> seçmek.</p>`,
        category: 'Yatırım Danışmanlığı',
        tags: ['Karasu Satılık Daire', 'Konut Kredisi', 'Ev Kredisi', 'Emlak Kredisi', 'Kredi Hesaplama', 'Karasu Emlak'],
        author: 'Ahmet Bulut',
        status: 'published',
        published_at: new Date().toISOString(),
        featured_image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
        views: 0
    },
    {
        title: 'Karasu Kiralık Daire Mi? Ev Kredisi İle Kendi Evini Almak Mı?',
        slug: 'karasu-kiralik-daire-ev-kredisi-karsilastirma',
        excerpt: 'Karasu kiralık daire fiyatları her geçen gün artarken, kira öder gibi konut kredisi kullanarak kendi evinize nasıl sahip olabileceğinizi anlatıyoruz.',
        meta_description: 'Karasu kiralık daire fiyatlarını ev kredisi ve konut kredisi ödemeleriyle karşılaştırdık. Kira ödemek mi, emlak kredisiyle Karasu satılık daire almak mı mantıklı?',
        content: `<h2>Karasu'da Kira Ödemek ve Konut Kredisi Arasındaki İnce Çizgi</h2>
<p>Günümüzde artan <strong>Karasu kiralık daire</strong> ve sezonluk yazlık kiraları, potansiyel yatırımcıları ve tatilcileri yeni arayışlara itiyor. Sadece birkaç aylık sezon kirası için yüksek bütçeler harcamak yerine, <a href="/kredi-hesaplayici">konut kredisi</a> ya da <strong>ev kredisi</strong> kullanarak kendi mülkünüzün sahibi olabilirsiniz.</p>

<h3>Kirasını Ödeyen Emlak: Ev Kredisi</h3>
<p>Karasu piyasasının yaz aylarındaki canlılığı, emlak alıcılarına büyük bir fırsat sunar: "Kirasıyla taksitlerini ödeyen daire modeli." Uygun peşinatla aldığınız <strong>Karasu satılık daire</strong> için bankadan çekeceğiniz <strong>emlak kredisi</strong>, siz burayı kullanmadığınız sezon dışı ve sezon aylarında kısa veya uzun dönem kiralama yöntemiyle (<a href="/kiralik">Karasu kiralık daire</a> konseptinde) aylık taksitlerinin büyük bir bölümünü kendi kendine ödeyebilir.</p>

<h3>Neden Emlak Kredisi Kullanmalısınız?</h3>
<p>Enflasyon rakamları göz önünde bulundurulduğunda, bugün sabit bir faiz oranıyla bağladığınız <strong>ev kredisi</strong> taksitleriniz 2-3 yıl sonra cebinizi çok daha az yoracak bir hale gelecektir. Buna karşın, <strong>Karasu kiralık daire</strong> piyasasında fiyatlar yıllar içinde daha hızlı güncellenecek ve kiralayanlar aleyhine maliyetlenecektir.</p>

<h3>Nasıl Hesaplama Yapabilirsiniz?</h3>
<ol>
  <li>Önce almak istediğiniz <a href="/satilik">Satılık Evlere</a> göz atarak ortalama bir ev bedeli saptayın.</li>
  <li>Bizim geliştirdiğimiz uzman <a href="/kredi-hesaplayici">Konut ve Ev Kredisi Hesaplama Aracı</a> ile güncel faizlerle ne kadar aylık taksit ödeyeceğinizi simüle edin.</li>
  <li>Seçtiğiniz lokasyondaki güncel <a href="/kiralik">Kiralık daire</a> fiyatlarına ve yıllık kira getirisine bakarak bu iki veriyi karşılaştırın. </li>
</ol>

<p>Son kararı verirken her zaman Karasu Emlak ofisimize danışabilir ve güncel yerel analizleri uzman kadromuzdan dinleyebilirsiniz.</p>`,
        category: 'Emlak Rehberi',
        tags: ['Karasu Kiralık Daire', 'Ev Kredisi', 'Emlak Kredisi', 'Konut Kredisi', 'Karasu Satılık Ev'],
        author: 'Ahmet Bulut',
        status: 'published',
        published_at: new Date().toISOString(),
        featured_image: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80',
        views: 0
    }
];

async function main() {
    console.log('Inserting SEO optimized articles...');

    for (const article of articles) {
        const { data: existing } = await supabase.from('articles').select('id').eq('slug', article.slug);

        if (existing && existing.length > 0) {
            console.log(`Article ${article.slug} already exists. Updating...`);
            const { error } = await supabase.from('articles').update(article).eq('id', existing[0].id);
            if (error) console.error('Error updating:', error);
            else console.log('Successfully updated', article.slug);
        } else {
            console.log(`Creating ${article.slug}...`);
            const { error } = await supabase.from('articles').insert([article]);
            if (error) console.error('Error inserting:', error);
            else console.log('Successfully inserted', article.slug);
        }
    }

    console.log('Done.');
}

main();
