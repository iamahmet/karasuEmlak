/**
 * Setup Navigation Menu
 * Creates navigation menu structure in database
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface MenuItem {
  title: string;
  url: string;
  icon?: string;
  description?: string;
  children?: MenuItem[];
}

const menuStructure: MenuItem[] = [
  {
    title: 'Satılık',
    url: '/satilik',
    icon: 'Home',
    description: 'Satılık konut, villa, arsa ve işyerleri',
  },
  {
    title: 'Kiralık',
    url: '/kiralik',
    icon: 'Key',
    description: 'Kiralık daire, ev ve yazlık seçenekleri',
  },
  {
    title: 'Emlak Türleri',
    icon: 'Building',
    children: [
      { title: 'Daire', url: '/tip/daire', icon: 'Building' },
      { title: 'Villa', url: '/tip/villa', icon: 'Home' },
      { title: 'Ev', url: '/tip/ev', icon: 'Home' },
      { title: 'Yazlık', url: '/tip/yazlik', icon: 'Building2' },
      { title: 'Arsa', url: '/tip/arsa', icon: 'Landmark' },
      { title: 'İşyeri', url: '/tip/isyeri', icon: 'Building2' },
    ],
  },
  {
    title: 'Bölgeler',
    icon: 'MapPin',
    children: [
      { title: 'Karasu', url: '/karasu' },
      { title: 'Kocaali', url: '/kocaali' },
      { title: 'Gezilecek Yerler', url: '/karasu/gezilecek-yerler' },
      { title: 'Hastaneler', url: '/karasu/hastaneler' },
      { title: 'Nöbetçi Eczaneler', url: '/karasu/nobetci-eczaneler' },
      { title: 'Restoranlar', url: '/karasu/restoranlar' },
      { title: 'Ulaşım', url: '/karasu/ulasim' },
      { title: 'Önemli Telefonlar', url: '/karasu/onemli-telefonlar' },
    ],
  },
  {
    title: 'Hizmetler & Yatırım',
    icon: 'TrendingUp',
    children: [
      { title: 'Emlak Değerleme', url: '/hizmetler/emlak-degerleme', icon: 'Scale' },
      { title: 'Danışmanlık', url: '/hizmetler/danismanlik', icon: 'Info' },
      { title: 'Hukuki Destek', url: '/hizmetler/hukuki-destek', icon: 'Scale' },
      { title: 'Sigorta Danışmanlığı', url: '/hizmetler/sigorta', icon: 'Shield' },
      { title: 'Yatırım Rehberi', url: '/rehber/yatirim', icon: 'BookOpen' },
      { title: 'Piyasa Analizi', url: '/yatirim/piyasa-analizi', icon: 'BarChart3' },
      { title: 'Yatırım Hesaplayıcı', url: '/yatirim-hesaplayici', icon: 'Calculator' },
      { title: 'ROI Hesaplayıcı', url: '/yatirim/roi-hesaplayici', icon: 'TrendingUp' },
      { title: 'Piyasa Raporları', url: '/istatistikler/piyasa-raporlari', icon: 'FileText' },
      { title: 'Fiyat Trendleri', url: '/istatistikler/fiyat-trendleri', icon: 'LineChart' },
      { title: 'Bölge Analizi', url: '/istatistikler/bolge-analizi', icon: 'PieChart' },
    ],
  },
];

async function setupNavigationMenu() {

  try {
    console.log('🚀 Setting up navigation menu...');

    // Get or create header menu
    let { data: menu, error: menuError } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('position', 'header')
      .eq('is_active', true)
      .single();

    if (menuError || !menu) {
      // Create menu if doesn't exist
      const { data: newMenu, error: createError } = await supabase
        .from('navigation_menus')
        .insert({
          title: 'Header Menu',
          slug: 'header-menu',
          position: 'header',
          is_active: true,
          display_order: 1,
        })
        .select()
        .single();

      if (createError || !newMenu) {
        throw new Error(`Failed to create menu: ${createError?.message}`);
      }

      menu = newMenu;
      console.log('✅ Created header menu');
    } else {
      console.log('✅ Found existing header menu');
    }

    // Delete existing items
    const { error: deleteError } = await supabase
      .from('navigation_items')
      .delete()
      .eq('menu_id', menu.id);

    if (deleteError) {
      console.warn('⚠️  Could not delete existing items:', deleteError.message);
    } else {
      console.log('✅ Cleared existing menu items');
    }

    // Insert menu items
    let displayOrder = 1;
    const itemsToInsert: any[] = [];

    for (const item of menuStructure) {
      const parentItem = {
        menu_id: menu.id,
        parent_id: null,
        title: item.title,
        url: item.url || '#',
        icon: item.icon || null,
        description: item.description || null,
        is_active: true,
        display_order: displayOrder++,
        open_in_new_tab: false,
        css_class: null,
      };

      itemsToInsert.push(parentItem);
    }

    // Insert parent items first
    const { data: insertedParents, error: parentsError } = await supabase
      .from('navigation_items')
      .insert(itemsToInsert)
      .select();

    if (parentsError || !insertedParents) {
      throw new Error(`Failed to insert parent items: ${parentsError?.message}`);
    }

    console.log(`✅ Inserted ${insertedParents.length} parent items`);

    // Insert child items
    const childItemsToInsert: any[] = [];
    let childOrder = 1;

    for (let i = 0; i < menuStructure.length; i++) {
      const parentItem = menuStructure[i];
      const parentId = insertedParents[i].id;

      if (parentItem.children) {
        for (const child of parentItem.children) {
          childItemsToInsert.push({
            menu_id: menu.id,
            parent_id: parentId,
            title: child.title,
            url: child.url,
            icon: child.icon || null,
            description: child.description || null,
            is_active: true,
            display_order: childOrder++,
            open_in_new_tab: false,
            css_class: null,
          });
        }
      }
    }

    if (childItemsToInsert.length > 0) {
      const { data: insertedChildren, error: childrenError } = await supabase
        .from('navigation_items')
        .insert(childItemsToInsert)
        .select();

      if (childrenError || !insertedChildren) {
        throw new Error(`Failed to insert child items: ${childrenError?.message}`);
      }

      console.log(`✅ Inserted ${insertedChildren.length} child items`);
    }

    console.log('🎉 Navigation menu setup completed successfully!');
    console.log(`   Total items: ${insertedParents.length} parents, ${childItemsToInsert.length} children`);

  } catch (error) {
    console.error('❌ Error setting up navigation menu:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupNavigationMenu();
}

export { setupNavigationMenu };
