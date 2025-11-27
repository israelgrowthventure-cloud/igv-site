import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Block } from '../types';
import BlockRenderer from './BlockRenderer';
import { GripVertical, Copy, Trash2 } from 'lucide-react';

interface SortableBlockProps {
  block: Block;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function SortableBlock({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${
        isSelected ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gray-100 border-r border-gray-200 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-2 bg-white rounded shadow hover:bg-gray-50 transition"
          data-testid="duplicate-block"
        >
          <Copy className="w-4 h-4 text-gray-600" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 bg-white rounded shadow hover:bg-red-50 transition"
          data-testid="delete-block"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      <BlockRenderer block={block} />
    </div>
  );
}