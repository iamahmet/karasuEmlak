/**
 * Navigation Menu Queries
 * Fetch navigation menus and items from database
 */

import { createClient } from '../client';

export interface NavigationItem {
  id: string;
  menu_id: string;
  parent_id: string | null;
  title: string;
  url: string;
  icon: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
  open_in_new_tab: boolean;
  css_class: string | null;
  children?: NavigationItem[];
}

export interface NavigationMenu {
  id: string;
  title: string;
  slug: string;
  position: string;
  is_active: boolean;
  display_order: number;
  items: NavigationItem[];
}

/**
 * Get navigation menu by position (header, footer, mobile)
 */
export async function getNavigationMenu(position: string = 'header'): Promise<NavigationMenu | null> {
  const supabase = createClient();

  try {
    // Get menu
    const { data: menu, error: menuError } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('position', position)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1)
      .single();

    if (menuError || !menu) {
      console.error('Error fetching navigation menu:', menuError);
      return null;
    }

    // Get menu items
    const { data: items, error: itemsError } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('menu_id', menu.id)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching navigation items:', itemsError);
      return null;
    }

    // Build hierarchical structure (parent-child)
    const itemsMap = new Map<string, NavigationItem>();
    const rootItems: NavigationItem[] = [];

    // First pass: create map
    items?.forEach((item) => {
      itemsMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    items?.forEach((item) => {
      const navItem = itemsMap.get(item.id);
      if (!navItem) return;

      if (item.parent_id) {
        const parent = itemsMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(navItem);
        }
      } else {
        rootItems.push(navItem);
      }
    });

    return {
      ...menu,
      items: rootItems,
    };
  } catch (error) {
    console.error('Error in getNavigationMenu:', error);
    return null;
  }
}

/**
 * Get all navigation menus
 */
export async function getAllNavigationMenus(): Promise<NavigationMenu[]> {
  const supabase = createClient();

  try {
    const { data: menus, error: menusError } = await supabase
      .from('navigation_menus')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (menusError || !menus) {
      console.error('Error fetching navigation menus:', menusError);
      return [];
    }

    // Get all items for all menus
    const menuIds = menus.map(m => m.id);
    const { data: allItems, error: itemsError } = await supabase
      .from('navigation_items')
      .select('*')
      .in('menu_id', menuIds)
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (itemsError) {
      console.error('Error fetching navigation items:', itemsError);
      return menus.map(menu => ({ ...menu, items: [] }));
    }

    // Group items by menu_id
    const itemsByMenu = new Map<string, NavigationItem[]>();
    allItems?.forEach((item) => {
      if (!itemsByMenu.has(item.menu_id)) {
        itemsByMenu.set(item.menu_id, []);
      }
      itemsByMenu.get(item.menu_id)!.push(item);
    });

    // Build hierarchical structure for each menu
    return menus.map((menu) => {
      const menuItems = itemsByMenu.get(menu.id) || [];
      const itemsMap = new Map<string, NavigationItem>();
      const rootItems: NavigationItem[] = [];

      // First pass: create map
      menuItems.forEach((item) => {
        itemsMap.set(item.id, { ...item, children: [] });
      });

      // Second pass: build hierarchy
      menuItems.forEach((item) => {
        const navItem = itemsMap.get(item.id);
        if (!navItem) return;

        if (item.parent_id) {
          const parent = itemsMap.get(item.parent_id);
          if (parent) {
            parent.children = parent.children || [];
            parent.children.push(navItem);
          }
        } else {
          rootItems.push(navItem);
        }
      });

      return {
        ...menu,
        items: rootItems,
      };
    });
  } catch (error) {
    console.error('Error in getAllNavigationMenus:', error);
    return [];
  }
}

