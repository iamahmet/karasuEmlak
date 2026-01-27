'use client';

import { useState, useEffect } from 'react';
import { Button } from '@karasu/ui';
import { Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
import { createClient } from '@karasu/lib/supabase/client';
import type { NavigationMenu, NavigationItem } from '@karasu/lib/supabase/queries/navigation';

export function NavigationMenuManager() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  async function fetchMenus() {
    const supabase = createClient();
    setLoading(true);

    try {
      // Fetch all menus
      const { data: menusData, error: menusError } = await supabase
        .from('navigation_menus')
        .select('*')
        .order('display_order', { ascending: true });

      if (menusError) throw menusError;

      // Fetch all items
      const { data: itemsData, error: itemsError } = await supabase
        .from('navigation_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (itemsError) throw itemsError;

      // Group items by menu_id and build hierarchy
      const menusList: NavigationMenu[] = menusData?.map((menu: any) => {
        const menuItems = itemsData?.filter((item: any) => item.menu_id === menu.id) || [];
        
        // Build hierarchy
        const itemsMap = new Map<string, NavigationItem>();
        const rootItems: NavigationItem[] = [];

        menuItems.forEach((item: any) => {
          itemsMap.set(item.id, { ...item, children: [] });
        });

        menuItems.forEach((item: any) => {
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
      }) || [];

      setMenus(menusList);
      if (menusList.length > 0 && !selectedMenu) {
        setSelectedMenu(menusList[0].id);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedMenuData = menus.find((m) => m.id === selectedMenu);

  // Separate component for menu items to properly use hooks
  function MenuItem({ item, level = 0 }: { item: NavigationItem; level?: number }) {
    const [expanded, setExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div className="space-y-1">
        <div 
          className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-primary transition-colors"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
          
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}

          <div className="flex-1">
            <div className="font-medium text-sm">{item.title}</div>
            <div className="text-xs text-muted-foreground">{item.url}</div>
          </div>

          {item.icon && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {item.icon}
            </span>
          )}

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {hasChildren && expanded && (
          <div className="space-y-1">
            {item.children?.map((child) => (
              <MenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Menu List */}
      <div className="lg:col-span-1 space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Menüler</h2>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Yeni
          </Button>
        </div>

        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setSelectedMenu(menu.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedMenu === menu.id
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-medium text-sm">{menu.title}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {menu.position} • {menu.items.length} öğe
            </div>
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="lg:col-span-3 space-y-4">
        {selectedMenuData ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{selectedMenuData.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedMenuData.position} menüsü
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Menü Öğesi Ekle
              </Button>
            </div>

            <div className="space-y-2">
              {selectedMenuData.items.length > 0 ? (
                selectedMenuData.items.map((item: any) => (
                  <MenuItem key={item.id} item={item} />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <p className="text-muted-foreground mb-4">
                    Bu menüde henüz öğe yok
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Öğeyi Ekle
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-muted-foreground">
              Bir menü seçin veya yeni menü oluşturun
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

