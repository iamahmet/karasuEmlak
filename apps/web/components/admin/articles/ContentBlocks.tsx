"use client";

import { useState } from "react";
import { Card, CardContent } from "@karasu/ui";
import { Button } from "@karasu/ui";
import { Input } from "@karasu/ui";
import { Textarea } from "@karasu/ui";
import { 
  GripVertical,
  Plus,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  Quote,
  Code,
  List,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Link2,
  X,
  Move,
  Copy,
  Edit
} from "lucide-react";
import { cn } from "@karasu/lib";

export type BlockType = 
  | "paragraph"
  | "heading"
  | "image"
  | "video"
  | "quote"
  | "code"
  | "list"
  | "link";

export interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  attributes?: Record<string, any>;
}

interface ContentBlocksProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  className?: string;
}

export function ContentBlocks({ blocks, onChange, className }: ContentBlocksProps) {
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  const addBlock = (type: BlockType, afterIndex?: number) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content: "",
      attributes: type === "heading" ? { level: 2 } : {},
    };

    const newBlocks = [...blocks];
    if (afterIndex !== undefined) {
      newBlocks.splice(afterIndex + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    onChange(newBlocks);
    setEditingBlock(newBlock.id);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(
      blocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter(block => block.id !== id));
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (block) {
      const newBlock: ContentBlock = {
        ...block,
        id: `block-${Date.now()}`,
      };
      const index = blocks.findIndex(b => b.id === id);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      onChange(newBlocks);
    }
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex(b => b.id === id);
    if (index === -1) return;

    const newBlocks = [...blocks];
    if (direction === "up" && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    } else if (direction === "down" && index < newBlocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    }
    onChange(newBlocks);
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const isEditing = editingBlock === block.id;

    return (
      <div
        key={block.id}
        className="group relative border border-transparent hover:border-design-light/50 rounded-lg p-2 transition-all"
      >
        <div className="flex items-start gap-2">
          {/* Drag Handle */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
            <GripVertical className="h-4 w-4 text-design-gray dark:text-gray-400 cursor-move" />
          </div>

          {/* Block Content */}
          <div className="flex-1">
            {block.type === "paragraph" && (
              <div>
                {isEditing ? (
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    onBlur={() => setEditingBlock(null)}
                    className="input-modern min-h-[100px]"
                    placeholder="Paragraf yazın..."
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingBlock(block.id)}
                    className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-text min-h-[50px]"
                    dangerouslySetInnerHTML={{ __html: block.content || "<p>Paragraf yazın...</p>" }}
                  />
                )}
              </div>
            )}

            {block.type === "heading" && (
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <select
                      value={block.attributes?.level || 2}
                      onChange={(e) => updateBlock(block.id, { 
                        attributes: { ...block.attributes, level: parseInt(e.target.value) }
                      })}
                      className="input-modern text-xs"
                    >
                      <option value={1}>H1</option>
                      <option value={2}>H2</option>
                      <option value={3}>H3</option>
                      <option value={4}>H4</option>
                      <option value={5}>H5</option>
                      <option value={6}>H6</option>
                    </select>
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      onBlur={() => setEditingBlock(null)}
                      className="input-modern font-bold"
                      placeholder="Başlık yazın..."
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingBlock(block.id)}
                    className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-text"
                  >
                    {block.attributes?.level === 1 && <h1 className="text-3xl font-bold">{block.content || "Başlık 1"}</h1>}
                    {block.attributes?.level === 2 && <h2 className="text-2xl font-bold">{block.content || "Başlık 2"}</h2>}
                    {block.attributes?.level === 3 && <h3 className="text-xl font-bold">{block.content || "Başlık 3"}</h3>}
                    {block.attributes?.level === 4 && <h4 className="text-lg font-bold">{block.content || "Başlık 4"}</h4>}
                    {block.attributes?.level === 5 && <h5 className="text-base font-bold">{block.content || "Başlık 5"}</h5>}
                    {block.attributes?.level === 6 && <h6 className="text-sm font-bold">{block.content || "Başlık 6"}</h6>}
                  </div>
                )}
              </div>
            )}

            {block.type === "image" && (
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      onBlur={() => setEditingBlock(null)}
                      className="input-modern"
                      placeholder="Görsel URL'si..."
                      autoFocus
                    />
                    {block.content && (
                      <img src={block.content} alt="" className="max-w-full h-auto rounded-lg" />
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => setEditingBlock(block.id)}
                    className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-pointer"
                  >
                    {block.content ? (
                      <img src={block.content} alt="" className="max-w-full h-auto rounded-lg" />
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">Görsel URL'si ekleyin</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {block.type === "quote" && (
              <div>
                {isEditing ? (
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    onBlur={() => setEditingBlock(null)}
                    className="input-modern min-h-[100px] border-l-4 border-design-light"
                    placeholder="Alıntı yazın..."
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingBlock(block.id)}
                    className="p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-text border-l-4 border-design-light bg-gray-50 dark:bg-gray-900/10"
                  >
                    <Quote className="h-5 w-5 text-design-light mb-2" />
                    <p className="text-lg italic">{block.content || "Alıntı yazın..."}</p>
                  </div>
                )}
              </div>
            )}

            {block.type === "code" && (
              <div>
                {isEditing ? (
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    onBlur={() => setEditingBlock(null)}
                    className="input-modern min-h-[150px] font-mono text-sm"
                    placeholder="Kod yazın..."
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingBlock(block.id)}
                    className="p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-text bg-gray-900 dark:bg-gray-950 font-mono text-sm"
                  >
                    <Code className="h-5 w-5 text-design-light mb-2" />
                    <pre className="whitespace-pre-wrap">{block.content || "Kod yazın..."}</pre>
                  </div>
                )}
              </div>
            )}

            {block.type === "list" && (
              <div>
                {isEditing ? (
                  <Textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    onBlur={() => setEditingBlock(null)}
                    className="input-modern min-h-[100px]"
                    placeholder="Her satıra bir madde yazın..."
                    autoFocus
                  />
                ) : (
                  <div
                    onClick={() => setEditingBlock(block.id)}
                    className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/20 cursor-text"
                  >
                    <ul className="list-disc list-inside space-y-1">
                      {block.content.split("\n").filter(Boolean).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                      {!block.content && <li className="text-gray-400">Liste yazın...</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Block Actions */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveBlock(block.id, "up")}
              disabled={index === 0}
              className="h-7 w-7 p-0"
            >
              <Move className="h-3 w-3 rotate-90" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => duplicateBlock(block.id)}
              className="h-7 w-7 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => deleteBlock(block.id)}
              className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => moveBlock(block.id, "down")}
              disabled={index === blocks.length - 1}
              className="h-7 w-7 p-0"
            >
              <Move className="h-3 w-3 -rotate-90" />
            </Button>
          </div>
        </div>

        {/* Add Block Button */}
        <div className="flex justify-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addBlock("paragraph", index)}
            className="h-8 px-3 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Blok Ekle
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {blocks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-400 mb-4">İçerik bloğu yok</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => addBlock("paragraph")}
          >
            <Plus className="h-4 w-4 mr-2" />
            İlk Bloğu Ekle
          </Button>
        </div>
      ) : (
        <>
          {blocks.map((block, index) => renderBlock(block, index))}
          <div className="flex justify-center pt-4">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("paragraph")}
                className="h-8 px-3 text-xs"
              >
                <Type className="h-3 w-3 mr-1" />
                Paragraf
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("heading")}
                className="h-8 px-3 text-xs"
              >
                <Heading2 className="h-3 w-3 mr-1" />
                Başlık
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("image")}
                className="h-8 px-3 text-xs"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                Görsel
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("quote")}
                className="h-8 px-3 text-xs"
              >
                <Quote className="h-3 w-3 mr-1" />
                Alıntı
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("list")}
                className="h-8 px-3 text-xs"
              >
                <List className="h-3 w-3 mr-1" />
                Liste
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addBlock("code")}
                className="h-8 px-3 text-xs"
              >
                <Code className="h-3 w-3 mr-1" />
                Kod
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

