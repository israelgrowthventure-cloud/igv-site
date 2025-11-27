import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Block } from '../types';
import SortableBlock from './SortableBlock';
import { Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';

interface CanvasProps {
  blocks: Block[];
  onReorder: (blocks: Block[]) => void;
  onSelectBlock: (block: Block | null) => void;
  selectedBlock: Block | null;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
}

export default function Canvas({
  blocks,
  onReorder,
  onSelectBlock,
  selectedBlock,
  onDeleteBlock,
  onDuplicateBlock,
}: CanvasProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(oldIndex, 1);
      newBlocks.splice(newIndex, 0, removed);

      onReorder(newBlocks);
    }
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto">
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Canvas Preview</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('desktop')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'desktop'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="view-desktop"
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`p-2 rounded-lg transition ${
              viewMode === 'mobile'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            data-testid="view-mobile"
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-8 flex justify-center">
        <div
          className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300"
          style={{
            width: viewMode === 'mobile' ? '375px' : '100%',
            maxWidth: viewMode === 'desktop' ? '1200px' : '375px',
          }}
        >
          {blocks.length === 0 ? (
            <div className="p-20 text-center text-gray-400">
              <p className="text-lg">Drag blocks from the library to start building</p>
            </div>
          ) : (
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                {blocks.map((block) => (
                  <SortableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlock?.id === block.id}
                    onSelect={() => onSelectBlock(block)}
                    onDelete={() => onDeleteBlock(block.id)}
                    onDuplicate={() => onDuplicateBlock(block.id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}