import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { pagesAPI } from '../../utils/api';

const PageEditor = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  const [pageData, setPageData] = useState({
    slug: '',
    title: { fr: '', en: '', he: '' },
    published: false,
  });

  useEffect(() => {
    if (slug) {
      loadPage();
    } else {
      initializeEditor();
    }
  }, [slug]);

  const loadPage = async () => {
    try {
      const response = await pagesAPI.getBySlug(slug);
      setPage(response.data);
      setPageData({
        slug: response.data.slug,
        title: response.data.title,
        published: response.data.published,
      });
      initializeEditor(response.data);
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Error loading page');
    } finally {
      setLoading(false);
    }
  };

  const initializeEditor = (pageContent = null) => {
    if (!editorRef.current) return;

    const grapesEditor = grapesjs.init({
      container: editorRef.current,
      plugins: [gjsPresetWebpage],
      storageManager: false,
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

    if (pageContent && pageContent.content_json) {
      try {
        const projectData = JSON.parse(pageContent.content_json);
        grapesEditor.loadProjectData(projectData);
      } catch (error) {
        console.error('Error loading page content:', error);
      }
    }

    setEditor(grapesEditor);
  };

  const handleSave = async () => {
    if (!editor) return;

    setSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const projectData = JSON.stringify(editor.getProjectData());

      const payload = {
        ...pageData,
        content_json: projectData,
        content_html: html,
        content_css: css,
      };

      if (slug) {
        await pagesAPI.update(slug, payload);
        toast.success('Page updated successfully!');
      } else {
        await pagesAPI.create(payload);
        toast.success('Page created successfully!');
        navigate('/admin/pages');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Error saving page');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPageData({ ...pageData, published: !pageData.published });
    if (slug) {
      try {
        await pagesAPI.update(slug, { published: !pageData.published });
        toast.success(pageData.published ? 'Page unpublished' : 'Page published!');
      } catch (error) {
        toast.error('Error updating publish status');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="page-editor">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 text-gray-600 hover:text-[#0052CC] transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {slug ? 'Edit Page' : 'Create New Page'}
              </h1>
              <p className="text-sm text-gray-500">{pageData.slug || 'New page'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="flex items-center space-x-1 border border-gray-300 rounded-lg overflow-hidden">
              {['fr', 'en', 'he'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentLang === lang
                      ? 'bg-[#0052CC] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                  data-testid={`lang-button-${lang}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={handlePublish}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                pageData.published
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="publish-button"
            >
              <Eye size={18} />
              <span>{pageData.published ? 'Published' : 'Draft'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg font-medium hover:bg-[#003D99] transition-colors disabled:opacity-50"
              data-testid="save-button"
            >
              <Save size={18} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page Settings */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Slug (URL)</label>
            <input
              type="text"
              value={pageData.slug}
              onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
              disabled={!!slug}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent disabled:bg-gray-100"
              placeholder="about-us"
              data-testid="slug-input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Title ({currentLang.toUpperCase()})
            </label>
            <input
              type="text"
              value={pageData.title[currentLang] || ''}
              onChange={(e) =>
                setPageData({
                  ...pageData,
                  title: { ...pageData.title, [currentLang]: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent"
              placeholder="Enter page title"
              data-testid="title-input"
            />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex" style={{ height: 'calc(100vh - 200px)' }}>
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

export default PageEditor;
