import { Plus } from 'lucide-react';
import { blockTemplates, blockNames } from '../utils/blockLibrary';

interface BlockLibraryProps {
  onAddBlock: (blockType: string) => void;
}

export default function BlockLibrary({ onAddBlock }: BlockLibraryProps) {
  const blockTypes = Object.keys(blockTemplates);

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Block Library</h2>
      <div className="space-y-2">
        {blockTypes.map((type) => (
          <button
            key={type}
            onClick={() => onAddBlock(type)}
            className="w-full flex items-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition group"
            data-testid={`add-block-${type}`}
          >
            <Plus className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {blockNames[type]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}