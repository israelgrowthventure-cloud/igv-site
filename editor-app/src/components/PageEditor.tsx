import { useState, useEffect } from 'react';
import { Page, Block } from '../types';
import { pagesAPI } from '../api';
import BlockLibrary from './BlockLibrary';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import { blockTemplates } from '../utils/blockLibrary';
import { ArrowLeft, Save } from 'lucide-react';

interface PageEditorProps {
  page: Page | null;
  onBack: () => void;
  onSave: () => void;
}

export default function PageEditor({ page, onBack, onSave }: PageEditorProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setSlug(page.slug);
      setStatus(page.status);
      setBlocks(page.blocks);
    } else {
      setTitle('');
      setSlug('');
      setStatus('draft');
      setBlocks([]);
    }
  }, [page]);

  const addBlock = (blockType: string) => {
    const template = blockTemplates[blockType];
    if (!template) return;

    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random()}`,
      ...template,
    };

    setBlocks([...blocks, newBlock]);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id));
    if (selectedBlock?.id === id) {
      setSelectedBlock(null);
    }
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const duplicate: Block = {
      ...block,
      id: `block-${Date.now()}-${Math.random()}`,
    };

    const index = blocks.findIndex((b) => b.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicate);
    setBlocks(newBlocks);
  };

  const updateBlockProps = (updates: Partial<Block['props']>) => {
    if (!selectedBlock) return;

    const updatedBlocks = blocks.map((b) =>
      b.id === selectedBlock.id ? { ...b, props: { ...b.props, ...updates } } : b
    );

    setBlocks(updatedBlocks);
    setSelectedBlock({
      ...selectedBlock,
      props: { ...selectedBlock.props, ...updates },
    });
  };

  const handleSave = async () => {
    if (!title || !slug) {
      alert('Please fill in title and slug');
      return;
    }

    setSaving(true);
    try {
      const pageData = {
        title,
        slug,
        status,
        blocks,
      };

      if (page?.id) {
        await pagesAPI.update(page.id, pageData);
      } else {
        await pagesAPI.create(pageData);
      }

      onSave();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              data-testid="back-to-pages"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page Title"
                className="text-xl font-semibold border-b-2 border-transparent focus:border-blue-500 outline-none px-2"
                data-testid="page-title-input"
              />
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="page-slug"
                className="text-sm text-gray-600 border-b-2 border-transparent focus:border-blue-500 outline-none px-2"
                data-testid="page-slug-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              data-testid="page-status-select"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium flex items-center gap-2"
              data-testid="save-page"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex overflow-hidden">
        <BlockLibrary onAddBlock={addBlock} />
        <Canvas
          blocks={blocks}
          onReorder={setBlocks}
          onSelectBlock={setSelectedBlock}
          selectedBlock={selectedBlock}
          onDeleteBlock={deleteBlock}
          onDuplicateBlock={duplicateBlock}
        />
        <PropertiesPanel
          block={selectedBlock}
          onUpdate={updateBlockProps}
          onClose={() => setSelectedBlock(null)}
        />
      </div>
    </div>
  );
}