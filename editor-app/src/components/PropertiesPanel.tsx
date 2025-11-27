import { Block } from '../types';
import { X } from 'lucide-react';

interface PropertiesPanelProps {
  block: Block | null;
  onUpdate: (updates: Partial<Block['props']>) => void;
  onClose: () => void;
}

export default function PropertiesPanel({ block, onUpdate, onClose }: PropertiesPanelProps) {
  if (!block) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="text-center text-gray-400 mt-20">
          <p>Select a block to edit its properties</p>
        </div>
      </div>
    );
  }

  const renderField = (label: string, key: string, type: string = 'text') => {
    if (type === 'textarea') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <textarea
            value={block.props[key as keyof typeof block.props] as string || ''}
            onChange={(e) => onUpdate({ [key]: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows={3}
          />
        </div>
      );
    }

    if (type === 'color') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={block.props[key as keyof typeof block.props] as string || '#000000'}
              onChange={(e) => onUpdate({ [key]: e.target.value })}
              className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={block.props[key as keyof typeof block.props] as string || ''}
              onChange={(e) => onUpdate({ [key]: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="#000000"
            />
          </div>
        </div>
      );
    }

    if (type === 'number') {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
          <input
            type="number"
            value={block.props[key as keyof typeof block.props] as number || 0}
            onChange={(e) => onUpdate({ [key]: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
        <input
          type={type}
          value={block.props[key as keyof typeof block.props] as string || ''}
          onChange={(e) => onUpdate({ [key]: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    );
  };

  const renderBlockProps = () => {
    switch (block.type) {
      case 'section':
        return (
          <>
            {renderField('Background Color', 'backgroundColor', 'color')}
            {renderField('Padding', 'padding')}
            {renderField('Margin', 'margin')}
          </>
        );

      case 'columns':
        return (
          <>
            {renderField('Number of Columns', 'columns', 'number')}
            {renderField('Padding', 'padding')}
            {renderField('Background Color', 'backgroundColor', 'color')}
          </>
        );

      case 'heading':
        return (
          <>
            {renderField('Heading Text', 'heading')}
            {renderField('Font Size', 'fontSize')}
            {renderField('Text Color', 'textColor', 'color')}
            {renderField('Text Align', 'textAlign')}
            {renderField('Margin', 'margin')}
          </>
        );

      case 'text':
        return (
          <>
            {renderField('Text Content', 'text', 'textarea')}
            {renderField('Font Size', 'fontSize')}
            {renderField('Text Color', 'textColor', 'color')}
            {renderField('Text Align', 'textAlign')}
            {renderField('Margin', 'margin')}
          </>
        );

      case 'image':
        return (
          <>
            {renderField('Image URL', 'imageUrl')}
            {renderField('Border Radius', 'borderRadius')}
            {renderField('Margin', 'margin')}
          </>
        );

      case 'button':
        return (
          <>
            {renderField('Button Text', 'buttonText')}
            {renderField('Button Link', 'buttonLink')}
            {renderField('Background Color', 'backgroundColor', 'color')}
            {renderField('Text Color', 'textColor', 'color')}
            {renderField('Padding', 'padding')}
            {renderField('Border Radius', 'borderRadius')}
            {renderField('Font Size', 'fontSize')}
          </>
        );

      case 'hero':
        return (
          <>
            {renderField('Heading', 'heading')}
            {renderField('Text', 'text', 'textarea')}
            {renderField('Button Text', 'buttonText')}
            {renderField('Button Link', 'buttonLink')}
            {renderField('Background Color', 'backgroundColor', 'color')}
            {renderField('Text Color', 'textColor', 'color')}
            {renderField('Padding', 'padding')}
          </>
        );

      case 'pricing':
        return (
          <>
            {renderField('Title', 'title')}
            {renderField('Price', 'price')}
            {renderField('Button Text', 'buttonText')}
            {renderField('Button Link', 'buttonLink')}
            {renderField('Background Color', 'backgroundColor', 'color')}
            {renderField('Text Color', 'textColor', 'color')}
            {renderField('Padding', 'padding')}
            {renderField('Border Radius', 'borderRadius')}
          </>
        );

      case 'spacer':
        return <>{renderField('Height', 'height')}</>;

      case 'divider':
        return (
          <>
            {renderField('Background Color', 'backgroundColor', 'color')}
            {renderField('Height', 'height')}
            {renderField('Margin', 'margin')}
          </>
        );

      default:
        return <p className="text-sm text-gray-500">No properties available</p>;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition"
          data-testid="close-properties"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      <div className="p-4">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Block Type</p>
          <p className="font-medium text-gray-900 capitalize">{block.type}</p>
        </div>
        {renderBlockProps()}
      </div>
    </div>
  );
}