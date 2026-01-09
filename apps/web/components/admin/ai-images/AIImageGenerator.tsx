'use client';

import { useState } from 'react';
import { Button, Input, Label, Textarea, Switch } from '@karasu/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@karasu/ui';
import { Card } from '@karasu/ui';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

interface GenerationResult {
  success: boolean;
  cached?: boolean;
  public_id?: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  media_asset_id?: string;
  revised_prompt?: string;
  cost?: number;
  error?: string;
}

export function AIImageGenerator() {
  const [type, setType] = useState<'listing' | 'article' | 'neighborhood' | 'hero' | 'custom'>('listing');
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState({
    title: '',
    propertyType: 'daire',
    location: 'Karasu, Sakarya',
    status: 'satilik' as 'satilik' | 'kiralik',
    category: '',
    name: '',
    district: '',
    description: '',
    theme: '',
  });
  const [options, setOptions] = useState({
    size: '1792x1024' as '1024x1024' | '1792x1024' | '1024x1792',
    quality: 'hd' as 'standard' | 'hd',
    style: 'natural' as 'vivid' | 'natural',
  });
  const [upload, setUpload] = useState({
    folder: '',
    entityType: 'listing' as 'listing' | 'article' | 'news' | 'neighborhood' | 'other',
    entityId: '',
    alt: '',
    tags: [] as string[],
  });
  const [skipCache, setSkipCache] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai-images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt: type === 'custom' ? prompt : undefined,
          context: type !== 'custom' ? context : undefined,
          options,
          upload: upload.entityId ? upload : undefined,
          skipCache,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Görsel üretilemedi');
      }

      setResult(data);
      
      if (data.cached) {
        toast.success('Görsel cache\'den alındı (Maliyet: $0)');
      } else {
        toast.success(`Görsel üretildi! (Maliyet: $${data.cost?.toFixed(2) || '0.00'})`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Görsel üretilemedi');
      setResult({ success: false, error: error.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Görsel Üretme
        </h2>

        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <Label htmlFor="type">Görsel Tipi</Label>
            <Select value={type} onValueChange={(value) => setType(value as any)}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="listing">İlan Görseli</SelectItem>
                <SelectItem value="article">Makale Görseli</SelectItem>
                <SelectItem value="neighborhood">Mahalle Görseli</SelectItem>
                <SelectItem value="hero">Hero Banner</SelectItem>
                <SelectItem value="custom">Özel Prompt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Prompt */}
          {type === 'custom' && (
            <div>
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Detaylı görsel açıklaması..."
                rows={4}
              />
            </div>
          )}

          {/* Context Fields */}
          {type !== 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {type === 'listing' && (
                <>
                  <div>
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={context.title}
                      onChange={(e) => setContext({ ...context, title: e.target.value })}
                      placeholder="Modern Daire"
                    />
                  </div>
                  <div>
                    <Label htmlFor="propertyType">Emlak Tipi</Label>
                    <Select value={context.propertyType} onValueChange={(value) => setContext({ ...context, propertyType: value })}>
                      <SelectTrigger id="propertyType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daire">Daire</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="ev">Ev</SelectItem>
                        <SelectItem value="yazlik">Yazlık</SelectItem>
                        <SelectItem value="arsa">Arsa</SelectItem>
                        <SelectItem value="isyeri">İşyeri</SelectItem>
                        <SelectItem value="dukkan">Dükkan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Konum</Label>
                    <Input
                      id="location"
                      value={context.location}
                      onChange={(e) => setContext({ ...context, location: e.target.value })}
                      placeholder="Karasu, Sakarya"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Durum</Label>
                    <Select value={context.status} onValueChange={(value) => setContext({ ...context, status: value as any })}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="satilik">Satılık</SelectItem>
                        <SelectItem value="kiralik">Kiralık</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {type === 'article' && (
                <>
                  <div>
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={context.title}
                      onChange={(e) => setContext({ ...context, title: e.target.value })}
                      placeholder="Makale başlığı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Input
                      id="category"
                      value={context.category}
                      onChange={(e) => setContext({ ...context, category: e.target.value })}
                      placeholder="Emlak Rehberi"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={context.description}
                      onChange={(e) => setContext({ ...context, description: e.target.value })}
                      placeholder="Makale içeriği..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {type === 'neighborhood' && (
                <>
                  <div>
                    <Label htmlFor="name">Mahalle Adı</Label>
                    <Input
                      id="name"
                      value={context.name}
                      onChange={(e) => setContext({ ...context, name: e.target.value })}
                      placeholder="Merkez Mahallesi"
                    />
                  </div>
                  <div>
                    <Label htmlFor="district">İlçe</Label>
                    <Input
                      id="district"
                      value={context.district}
                      onChange={(e) => setContext({ ...context, district: e.target.value })}
                      placeholder="Karasu"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      value={context.description}
                      onChange={(e) => setContext({ ...context, description: e.target.value })}
                      placeholder="Mahalle açıklaması..."
                      rows={3}
                    />
                  </div>
                </>
              )}

              {type === 'hero' && (
                <>
                  <div>
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={context.title}
                      onChange={(e) => setContext({ ...context, title: e.target.value })}
                      placeholder="Hero başlığı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="theme">Tema</Label>
                    <Input
                      id="theme"
                      value={context.theme}
                      onChange={(e) => setContext({ ...context, theme: e.target.value })}
                      placeholder="Lüks emlak"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="size">Boyut</Label>
              <Select value={options.size} onValueChange={(value) => setOptions({ ...options, size: value as any })}>
                <SelectTrigger id="size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">1024x1024</SelectItem>
                  <SelectItem value="1792x1024">1792x1024 (Landscape)</SelectItem>
                  <SelectItem value="1024x1792">1024x1792 (Portrait)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quality">Kalite</Label>
              <Select value={options.quality} onValueChange={(value) => setOptions({ ...options, quality: value as any })}>
                <SelectTrigger id="quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard ($0.04-0.08)</SelectItem>
                  <SelectItem value="hd">HD ($0.08-0.12)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="style">Stil</Label>
              <Select value={options.style} onValueChange={(value) => setOptions({ ...options, style: value as any })}>
                <SelectTrigger id="style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Natural</SelectItem>
                  <SelectItem value="vivid">Vivid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload Options */}
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Upload Ayarları (Opsiyonel)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entityType">Entity Tipi</Label>
                <Select value={upload.entityType} onValueChange={(value) => setUpload({ ...upload, entityType: value as any })}>
                  <SelectTrigger id="entityType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="listing">İlan</SelectItem>
                    <SelectItem value="article">Makale</SelectItem>
                    <SelectItem value="news">Haber</SelectItem>
                    <SelectItem value="neighborhood">Mahalle</SelectItem>
                    <SelectItem value="other">Diğer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="entityId">Entity ID</Label>
                <Input
                  id="entityId"
                  value={upload.entityId}
                  onChange={(e) => setUpload({ ...upload, entityId: e.target.value })}
                  placeholder="UUID veya slug"
                />
              </div>
              <div>
                <Label htmlFor="alt">Alt Text</Label>
                <Input
                  id="alt"
                  value={upload.alt}
                  onChange={(e) => setUpload({ ...upload, alt: e.target.value })}
                  placeholder="Görsel açıklaması"
                />
              </div>
              <div>
                <Label htmlFor="folder">Klasör</Label>
                <Input
                  id="folder"
                  value={upload.folder}
                  onChange={(e) => setUpload({ ...upload, folder: e.target.value })}
                  placeholder="ai-generated"
                />
              </div>
            </div>
          </div>

          {/* Skip Cache */}
          <div className="flex items-center gap-2">
            <Switch
              id="skipCache"
              checked={skipCache}
              onCheckedChange={setSkipCache}
            />
            <Label htmlFor="skipCache" className="cursor-pointer">
              Cache'i atla (Yeni görsel üret)
            </Label>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Üretiliyor...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Görsel Üret
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Result */}
      {result && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Sonuç</h3>
          {result.success ? (
            <div className="space-y-4">
              {result.cached && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                  ✅ Cache'den alındı (Maliyet: $0)
                </div>
              )}
              {result.url && (
                <div>
                  <img
                    src={result.url}
                    alt={result.revised_prompt || 'Generated image'}
                    className="w-full max-w-2xl rounded-lg border"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Public ID</p>
                  <p className="font-mono text-xs break-all">{result.public_id}</p>
                </div>
                {result.width && result.height && (
                  <>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Boyut</p>
                      <p>{result.width}x{result.height}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Format</p>
                      <p>{result.format}</p>
                    </div>
                  </>
                )}
                {result.cost !== undefined && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Maliyet</p>
                    <p>${result.cost.toFixed(2)}</p>
                  </div>
                )}
              </div>
              {result.revised_prompt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Revised Prompt</p>
                  <p className="text-sm italic">{result.revised_prompt}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
              ❌ {result.error || 'Görsel üretilemedi'}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

