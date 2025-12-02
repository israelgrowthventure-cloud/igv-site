import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

const Editor = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initializeEditor();
  }, []);

  const initializeEditor = () => {
    if (!editorRef.current) return;

    const grapesEditor = grapesjs.init({
      container: editorRef.current,
      plugins: [gjsPresetWebpage],
      storageManager: {
        type: 'local',
        autosave: true,
        autoload: true,
      },
      height: '70vh',
      width: 'auto',
      panels: { defaults: [] },
      blockManager: {
        appendTo: '.blocks-container',
      },
      styleManager: {
        appendTo: '.styles-container',
        sectors: [
          {
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'],
          },
          {
            name: 'Decorations',
            open: false,
            buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background'],
          },
        ],
      },
      layersManager: {
        appendTo: '.layers-container',
      },
    });

    setEditor(grapesEditor);
  };

  const handleSave = () => {
    if (!editor) return;

    setSaving(true);
    try {
      editor.store();
      toast.success('Page saved successfully in local storage!');
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!editor) return;
    
    const html = editor.getHtml();
    const css = editor.getCss();
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <style>${css}</style>
</head>
<body>
  ${html}
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'page.html';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Page exported!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Page Editor</h1>
              <p className="text-sm text-gray-500">Drag & Drop CMS</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Export HTML
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="flex" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Panels */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Blocks</h3>
            <div className="blocks-container"></div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Layers</h3>
            <div className="layers-container"></div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 bg-gray-100">
          <div ref={editorRef} className="h-full"></div>
        </div>

        {/* Styles Panel */}
        <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Styles</h3>
            <div className="styles-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
