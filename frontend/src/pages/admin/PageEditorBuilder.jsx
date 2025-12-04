import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pagesAPI } from 'utils/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Eye, EyeOff, Home, FileText, Mail, Package,
  Globe, Settings, Trash2, Plus, Layers, Layout, Type, Image as ImageIcon
} from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

/**
 * PageEditorBuilder - Interface Squarespace-style pour l'édition de pages
 * Layout 3 zones : Navigation gauche | Canvas central | Panneau propriétés droite
 */
const PageEditorBuilder = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageData, setPageData] = useState({
    slug: '',
    title: { fr: '', en: '', he: '' },
    published: false,
  });

  // Icônes pour les pages selon le slug
  const getPageIcon = (pageSlug) => {
    if (pageSlug === 'home' || pageSlug === 'accueil') return <Home className="w-4 h-4" />;
    if (pageSlug.includes('pack')) return <Package className="w-4 h-4" />;
    if (pageSlug.includes('contact')) return <Mail className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  useEffect(() => {
    loadAllPages();
  }, []);

  useEffect(() => {
    if (slug && slug !== 'new' && allPages.length > 0) {
      loadPage(slug);
    } else if (slug === 'new') {
      setShowCreateModal(true);
      setLoading(false);
    }
  }, [slug, allPages]);

  const loadAllPages = async () => {
    try {
      const response = await pagesAPI.getAll();
      setAllPages(response.data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      toast.error('Erreur lors du chargement des pages');
    }
  };

  const loadPage = async (pageSlug) => {
    try {
      setLoading(true);
      const response = await pagesAPI.getBySlug(pageSlug);
      const loadedPage = response.data;
      
      setCurrentPage(loadedPage);
      setPageData({
        slug: loadedPage.slug,
        title: loadedPage.title,
        published: loadedPage.published,
      });
      
      setTimeout(() => initializeEditor(loadedPage), 100);
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Erreur lors du chargement de la page');
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
      height: '100%',
      width: 'auto',
      fromElement: false,
      canvas: {
        styles: ['https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'],
      },
      blockManager: {
        appendTo: '#blocks-container',
      },
      styleManager: {
        appendTo: '#styles-container',
        sectors: [{
          name: 'Dimensions',
          open: true,
          properties: ['width', 'height', 'max-width', 'min-height', 'padding', 'margin'],
        }, {
          name: 'Typographie',
          open: false,
          properties: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'],
        }, {
          name: 'Décorations',
          open: false,
          properties: ['background-color', 'border', 'border-radius', 'box-shadow'],
        }],
      },
      layerManager: {
        appendTo: '#layers-container',
      },
      panels: {
        defaults: [],
      },
      deviceManager: {
        devices: [
          { name: 'Desktop', width: '' },
          { name: 'Tablet', width: '768px', widthMedia: '768px' },
          { name: 'Mobile', width: '375px', widthMedia: '480px' },
        ],
      },
    });

    // Charger le contenu existant
    if (pageContent && pageContent.content_html) {
      grapesEditor.setComponents(pageContent.content_html);
      if (pageContent.content_css) {
        grapesEditor.setStyle(pageContent.content_css);
      }
    }

    // Custom blocks IGV style
    const bm = grapesEditor.BlockManager;
    
    bm.add('hero-igv', {
      label: 'Héro IGV',
      category: 'Sections',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 120px 20px; text-align: center; color: white; min-height: 600px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          <h1 style="font-size: 52px; font-weight: 700; margin-bottom: 25px; line-height: 1.2;">Titre Principal</h1>
          <p style="font-size: 22px; margin-bottom: 40px; max-width: 700px; opacity: 0.95;">Description accrocheuse qui explique votre valeur unique</p>
          <a href="#" style="padding: 18px 45px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.25); transition: all 0.3s;">Commencer</a>
        </section>
      `,
    });

    bm.add('two-cols-igv', {
      label: '2 Colonnes',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
            <div>
              <h2 style="font-size: 36px; font-weight: 700; color: #1a202c; margin-bottom: 20px;">Titre Section</h2>
              <p style="font-size: 18px; color: #4a5568; line-height: 1.8; margin-bottom: 30px;">Contenu descriptif qui explique les avantages et caractéristiques de votre offre.</p>
              <a href="#" style="display: inline-block; padding: 14px 35px; background: #0052CC; color: white; text-decoration: none; border-radius: 50px; font-weight: 600;">En savoir plus</a>
            </div>
            <div>
              <img src="https://via.placeholder.com/600x400/0052CC/FFFFFF?text=Image" style="width: 100%; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);" alt="Placeholder">
            </div>
          </div>
        </section>
      `,
    });

    bm.add('three-cards-igv', {
      label: '3 Cartes',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; background: #F7FAFC;">
          <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
            <h2 style="font-size: 40px; font-weight: 700; color: #1a202c; margin-bottom: 60px;">Nos Avantages</h2>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px;">
              <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: all 0.3s;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC, #0065FF); border-radius: 20px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; font-size: 36px;">🚀</div>
                <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 15px;">Rapidité</h3>
                <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Description de l'avantage en quelques lignes claires.</p>
              </div>
              <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: all 0.3s;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC, #0065FF); border-radius: 20px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; font-size: 36px;">💼</div>
                <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 15px;">Professionnel</h3>
                <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Description de l'avantage en quelques lignes claires.</p>
              </div>
              <div style="background: white; padding: 40px; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); transition: all 0.3s;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC, #0065FF); border-radius: 20px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; font-size: 36px;">⚡</div>
                <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 15px;">Efficace</h3>
                <p style="font-size: 16px; color: #4a5568; line-height: 1.6;">Description de l'avantage en quelques lignes claires.</p>
              </div>
            </div>
          </div>
        </section>
      `,
    });

    bm.add('cta-igv', {
      label: 'Call-to-Action',
      category: 'Sections',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 100px 20px; text-align: center; margin: 80px 0;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h2 style="font-size: 42px; font-weight: 700; color: white; margin-bottom: 25px;">Prêt à commencer ?</h2>
            <p style="font-size: 20px; color: rgba(255,255,255,0.95); margin-bottom: 40px;">Découvrez comment IGV peut transformer votre entreprise</p>
            <a href="/packs" style="padding: 18px 50px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">Voir nos Packs</a>
          </div>
        </section>
      `,
    });

    setEditor(grapesEditor);
  };

  const handleSave = async () => {
    if (!editor) return;

    setSaving(true);
    try {
      const html = editor.getHtml();
      const css = editor.getCss();
      const components = editor.getComponents();

      const payload = {
        slug: pageData.slug,
        title: pageData.title,
        content_html: html,
        content_css: css,
        content_json: JSON.stringify({ components }),
        published: pageData.published,
      };

      if (currentPage) {
        await pagesAPI.update(pageData.slug, payload);
        toast.success('Page mise à jour avec succès');
      } else {
        await pagesAPI.create(payload);
        toast.success('Page créée avec succès');
        navigate(`/admin/pages/${payload.slug}`);
      }

      await loadAllPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageSlug) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      await pagesAPI.delete(pageSlug);
      toast.success('Page supprimée');
      await loadAllPages();
      if (pageSlug === slug) {
        navigate('/admin/pages');
      }
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleCreatePage = async (pageType) => {
    const templates = {
      standard: {
        slug: 'nouvelle-page',
        title: { fr: 'Nouvelle Page', en: 'New Page', he: 'עמוד חדש' },
        content_html: '<section style="padding: 80px 20px; text-align: center;"><h1 style="font-size: 40px; font-weight: 700; color: #1a202c;">Nouvelle Page</h1><p style="font-size: 18px; color: #4a5568; margin-top: 20px;">Commencez à créer votre contenu ici</p></section>',
        content_css: '',
      },
      landing: {
        slug: 'landing-page',
        title: { fr: 'Landing Page', en: 'Landing Page', he: 'דף נחיתה' },
        content_html: `<section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 120px 20px; text-align: center; color: white; min-height: 100vh; display: flex; flex-direction: column; justify-content: center;"><h1 style="font-size: 52px; font-weight: 700; margin-bottom: 25px;">Transformez Votre Entreprise</h1><p style="font-size: 22px; margin-bottom: 40px; max-width: 700px; margin-left: auto; margin-right: auto;">Découvrez notre solution innovante</p><a href="#" style="padding: 18px 45px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px;">Commencer</a></section>`,
        content_css: '',
      },
      blog: {
        slug: 'article-blog',
        title: { fr: 'Article de Blog', en: 'Blog Post', he: 'פוסט בבלוג' },
        content_html: '<article style="max-width: 800px; margin: 80px auto; padding: 0 20px;"><h1 style="font-size: 42px; font-weight: 700; color: #1a202c; margin-bottom: 20px;">Titre de l\'Article</h1><p style="font-size: 18px; color: #4a5568; line-height: 1.8;">Contenu de votre article de blog...</p></article>',
        content_css: '',
      },
      contact: {
        slug: 'contact',
        title: { fr: 'Contact', en: 'Contact', he: 'צור קשר' },
        content_html: '<section style="padding: 80px 20px;"><div style="max-width: 600px; margin: 0 auto; text-align: center;"><h1 style="font-size: 40px; font-weight: 700; color: #1a202c; margin-bottom: 20px;">Contactez-nous</h1><p style="font-size: 18px; color: #4a5568; margin-bottom: 40px;">Nous sommes là pour vous aider</p></div></section>',
        content_css: '',
      },
    };

    const template = templates[pageType];
    setPageData({
      slug: template.slug,
      title: template.title,
      published: false,
    });

    setShowCreateModal(false);
    
    // Initialiser l'éditeur avec le template
    setTimeout(() => initializeEditor({
      slug: template.slug,
      title: template.title,
      content_html: template.content_html,
      content_css: template.content_css,
      published: false,
    }), 100);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/pages')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-xl font-semibold text-gray-900">
            {currentPage ? pageData.title[currentLang] || pageData.title.fr : 'Nouvelle Page'}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {['fr', 'en', 'he'].map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  currentLang === lang
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Publish Toggle */}
          <button
            onClick={() => setPageData({ ...pageData, published: !pageData.published })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              pageData.published
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {pageData.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {pageData.published ? 'Publié' : 'Brouillon'}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {/* Main Layout: 3 Zones */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Pages Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pages</h2>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setCurrentPage(null);
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Nouvelle page"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Pages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {allPages.map((page) => (
              <button
                key={page.slug}
                onClick={() => navigate(`/admin/pages/${page.slug}`)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  slug === page.slug
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {getPageIcon(page.slug)}
                    <span className="font-medium text-gray-900 text-sm">
                      {page.title.fr || page.title.en || page.slug}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(page.slug);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">/{page.slug}</span>
                  {page.published ? (
                    <span className="text-xs text-green-600 font-medium">● Publié</span>
                  ) : (
                    <span className="text-xs text-gray-400">○ Brouillon</span>
                  )}
                </div>
              </button>
            ))}

            {allPages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Aucune page</p>
                <p className="text-xs mt-1">Cliquez sur + pour créer</p>
              </div>
            )}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
          {/* Page Settings Bar */}
          {!loading && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                  <input
                    type="text"
                    value={pageData.slug}
                    onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="mon-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre ({currentLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={pageData.title[currentLang] || ''}
                    onChange={(e) => setPageData({
                      ...pageData,
                      title: { ...pageData.title, [currentLang]: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Titre de la page"
                  />
                </div>
              </div>
            </div>
          )}

          {/* GrapesJS Canvas */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            </div>
          ) : (
            <div ref={editorRef} className="flex-1"></div>
          )}
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 bg-blue-50">
                <Layout className="w-4 h-4 mx-auto mb-1" />
                Blocs
              </button>
              <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Type className="w-4 h-4 mx-auto mb-1" />
                Styles
              </button>
              <button className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <Layers className="w-4 h-4 mx-auto mb-1" />
                Calques
              </button>
            </div>
          </div>

          {/* Blocks Container */}
          <div id="blocks-container" className="flex-1 overflow-y-auto p-4"></div>
          <div id="styles-container" className="hidden"></div>
          <div id="layers-container" className="hidden"></div>
        </div>
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Créer une nouvelle page</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Page Standard */}
              <button
                onClick={() => handleCreatePage('standard')}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Page Standard</h3>
                <p className="text-gray-600">Page classique avec contenu libre et flexible</p>
              </button>

              {/* Landing Page */}
              <button
                onClick={() => handleCreatePage('landing')}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Landing Page</h3>
                <p className="text-gray-600">Page de conversion avec hero et CTA</p>
              </button>

              {/* Blog Post */}
              <button
                onClick={() => handleCreatePage('blog')}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Type className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Article de Blog</h3>
                <p className="text-gray-600">Format article avec mise en page optimisée</p>
              </button>

              {/* Contact Page */}
              <button
                onClick={() => handleCreatePage('contact')}
                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Page Contact</h3>
                <p className="text-gray-600">Page de contact avec formulaire intégré</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageEditorBuilder;
