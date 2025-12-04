import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pagesAPI } from 'utils/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, EyeOff, Layout, Type, Image, Video, Grid, Layers } from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import '../../styles/grapesjs-igv-theme.css';  // Thème IGV personnalisé

const PageEditorModern = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [editor, setEditor] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  const [showBlocks, setShowBlocks] = useState(true);
  const [showLayers, setShowLayers] = useState(false);
  const [pageData, setPageData] = useState({
    slug: '',
    title: { fr: '', en: '', he: '' },
    published: false,
  });

  useEffect(() => {
    if (slug && slug !== 'new') {
      loadPage();
    } else {
      // Petite pause pour laisser le DOM se monter
      setTimeout(() => initializeEditor(), 100);
    }
  }, [slug]);

  const loadPage = async () => {
    try {
      const response = await pagesAPI.getBySlug(slug);
      const loadedPage = response.data;
      
      setPage(loadedPage);
      setPageData({
        slug: loadedPage.slug,
        title: loadedPage.title,
        published: loadedPage.published,
      });
      
      // Petite pause pour laisser le DOM se monter
      setTimeout(() => initializeEditor(loadedPage), 100);
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Erreur lors du chargement de la page');
      navigate('/admin/pages');
    } finally {
      setLoading(false);
    }
  };

  const initializeEditor = (pageContent = null) => {
    if (!editorRef.current) {
      console.error('Editor container not ready');
      return;
    }

    try {
      const grapesEditor = grapesjs.init({
        container: editorRef.current,
        plugins: [gjsPresetWebpage],
        storageManager: false,
        height: 'calc(100vh - 200px)',
        width: 'auto',
        fromElement: false,
        canvas: {
          styles: ['https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'],
        },
        blockManager: {
          appendTo: '.blocks-container',
        },
        styleManager: {
          appendTo: '.styles-container',
          sectors: [
            {
              name: 'Dimensions',
              open: true,
              buildProps: ['width', 'height', 'padding', 'margin'],
            },
            {
              name: 'Texte',
              open: false,
              buildProps: ['font-size', 'font-weight', 'color', 'text-align'],
            },
            {
              name: 'Apparence',
              open: false,
              buildProps: ['background-color', 'border-radius', 'border', 'box-shadow'],
            },
          ],
        },
        layersManager: {
          appendTo: '.layers-container',
        },
      });

      // Charger le contenu existant si disponible
      if (pageContent && pageContent.content_html) {
        console.log('Loading existing content for:', pageContent.slug);
        
        // Charger le HTML
        grapesEditor.setComponents(pageContent.content_html);
        
        // Charger le CSS
        if (pageContent.content_css) {
          grapesEditor.setStyle(pageContent.content_css);
        }
      } else {
        // Template de démarrage moderne pour nouvelle page
        const startTemplate = `
          <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 100px 20px; text-align: center; color: white; min-height: 500px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <h1 style="font-size: 56px; font-weight: bold; margin-bottom: 20px; animation: fadeIn 1s;">Nouvelle Page</h1>
            <p style="font-size: 24px; opacity: 0.95; margin-bottom: 40px; max-width: 700px;">Commencez à construire votre page en ajoutant des sections depuis le panneau de gauche</p>
            <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center;">
              <a href="#" style="padding: 16px 40px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">Commencer</a>
              <a href="#" style="padding: 16px 40px; background: transparent; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; border: 2px solid white; transition: all 0.3s;">En savoir plus</a>
            </div>
          </section>
        `;
        grapesEditor.setComponents(startTemplate);
      }

      // Ajouter des blocs modernes IGV
      addModernBlocks(grapesEditor);

      setEditor(grapesEditor);
    } catch (error) {
      console.error('Error initializing editor:', error);
      toast.error('Erreur lors de l\'initialisation de l\'éditeur');
    }
  };

  const addModernBlocks = (editor) => {
    const bm = editor.BlockManager;

    // Section Héro
    bm.add('hero-modern', {
      label: '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 5px;">⭐</div><div>Héro</div></div>',
      category: 'Sections',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 100px 20px; text-align: center; color: white; min-height: 600px; display: flex; flex-direction: column; justify-content: center;">
          <h1 style="font-size: 56px; font-weight: bold; margin-bottom: 20px;">Titre Impactant</h1>
          <p style="font-size: 22px; opacity: 0.95; margin-bottom: 40px; max-width: 700px; margin-left: auto; margin-right: auto;">Sous-titre qui explique votre proposition de valeur unique</p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <a href="#" style="padding: 16px 40px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">Commencer</a>
            <a href="#" style="padding: 16px 40px; background: transparent; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; border: 2px solid white;">En savoir plus</a>
          </div>
        </section>
      `,
    });

    // Section 2 Colonnes
    bm.add('two-cols-modern', {
      label: '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 5px;">📑</div><div>2 Colonnes</div></div>',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
            <div>
              <h2 style="font-size: 42px; font-weight: bold; color: #1a202c; margin-bottom: 20px;">Titre de Section</h2>
              <p style="font-size: 18px; line-height: 1.8; color: #4a5568; margin-bottom: 30px;">Décrivez votre service ou produit ici. Expliquez les bénéfices et pourquoi vos clients doivent vous faire confiance.</p>
              <a href="#" style="display: inline-block; padding: 14px 35px; background: #0052CC; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">Découvrir</a>
            </div>
            <div style="background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); height: 400px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 18px; color: #718096; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
              <div style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">📸</div>
                <div>Votre Image Ici</div>
              </div>
            </div>
          </div>
        </section>
      `,
    });

    // Section 3 Cartes
    bm.add('three-cards', {
      label: '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 5px;">🎴</div><div>3 Cartes</div></div>',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; background: #f7fafc;">
          <h2 style="text-align: center; font-size: 42px; font-weight: bold; margin-bottom: 60px; color: #1a202c;">Nos Services</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 1200px; margin: 0 auto;">
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); transition: all 0.3s;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC, #0065FF); border-radius: 20px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; font-size: 36px;">🚀</div>
              <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 15px;">Service 1</h3>
              <p style="color: #4a5568; line-height: 1.7; font-size: 16px;">Description de votre premier service. Expliquez les avantages et la valeur ajoutée.</p>
            </div>
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); transition: all 0.3s;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC, #0065FF); border-radius: 20px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; font-size: 36px;">💼</div>
              <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 15px;">Service 2</h3>
              <p style="color: #4a5568; line-height: 1.7; font-size: 16px;">Description de votre deuxième service. Mettez en avant ce qui vous différencie.</p>
            </div>
            <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.08); transition: all 0.3s;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC, #0065FF); border-radius: 20px; margin: 0 auto 25px; display: flex; align-items: center; justify-content: center; font-size: 36px;">⚡</div>
              <h3 style="font-size: 24px; font-weight: 600; color: #1a202c; margin-bottom: 15px;">Service 3</h3>
              <p style="color: #4a5568; line-height: 1.7; font-size: 16px;">Description de votre troisième service. Convainquez vos visiteurs de passer à l'action.</p>
            </div>
          </div>
        </section>
      `,
    });

    // CTA Section
    bm.add('cta-modern', {
      label: '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 5px;">📢</div><div>Appel Action</div></div>',
      category: 'Sections',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 80px 20px; text-align: center; margin: 60px 0;">
          <h2 style="color: white; font-size: 42px; font-weight: bold; margin-bottom: 20px;">Prêt à Commencer ?</h2>
          <p style="color: rgba(255,255,255,0.95); font-size: 20px; margin-bottom: 40px; max-width: 700px; margin-left: auto; margin-right: auto;">Rejoignez les entreprises qui nous font confiance pour leur développement en Israël</p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <a href="/packs" style="padding: 16px 45px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">Voir nos Packs</a>
            <a href="/contact" style="padding: 16px 45px; background: transparent; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 18px; border: 2px solid white;">Nous Contacter</a>
          </div>
        </section>
      `,
    });

    // Vidéo
    bm.add('video-section', {
      label: '<div style="text-align: center;"><div style="font-size: 24px; margin-bottom: 5px;">🎥</div><div>Vidéo</div></div>',
      category: 'Média',
      content: `
        <section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 42px; font-weight: bold; margin-bottom: 50px; color: #1a202c;">Découvrez notre Vidéo</h2>
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
            <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        </section>
      `,
    });
  };

  const handleSave = async () => {
    if (!editor) {
      toast.error('Éditeur non initialisé');
      return;
    }

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

      if (slug && slug !== 'new') {
        await pagesAPI.update(slug, payload);
        toast.success('Page mise à jour avec succès !');
      } else {
        await pagesAPI.create(payload);
        toast.success('Page créée avec succès !');
        navigate('/admin/pages');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!slug || slug === 'new') {
      toast.error('Sauvegardez la page avant de la publier');
      return;
    }

    try {
      await pagesAPI.update(slug, { published: !pageData.published });
      setPageData({ ...pageData, published: !pageData.published });
      toast.success(pageData.published ? 'Page dépubliée' : 'Page publiée !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header moderne */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/pages')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {slug && slug !== 'new' ? 'Modifier la Page' : 'Nouvelle Page'}
              </h1>
              <p className="text-sm text-gray-500">{pageData.slug || 'nouvelle-page'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Langues */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              {['fr', 'en', 'he'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setCurrentLang(lang)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    currentLang === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Publish */}
            <button
              onClick={togglePublish}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                pageData.published
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {pageData.published ? <Eye size={18} /> : <EyeOff size={18} />}
              <span>{pageData.published ? 'Publié' : 'Brouillon'}</span>
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg"
            >
              <Save size={18} />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>

        {/* Page Settings */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
              <input
                type="text"
                value={pageData.slug}
                onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                disabled={slug && slug !== 'new'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="mon-slug"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre ({currentLang.toUpperCase()})
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Entrez le titre"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Editor Container */}
      <div className="flex" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Left Sidebar - Blocks/Layers */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setShowBlocks(true); setShowLayers(false); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                showBlocks ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layout size={16} className="inline mr-2" />
              Blocs
            </button>
            <button
              onClick={() => { setShowBlocks(false); setShowLayers(true); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                showLayers ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layers size={16} className="inline mr-2" />
              Calques
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {showBlocks && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Glissez-Déposez</p>
                <div className="blocks-container"></div>
              </div>
            )}
            {showLayers && (
              <div className="layers-container"></div>
            )}
          </div>
        </div>

        {/* Main Editor Canvas */}
        <div className="flex-1 bg-gray-100">
          <div ref={editorRef} className="h-full"></div>
        </div>

        {/* Right Sidebar - Styles */}
        <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3">Styles</h3>
            <div className="styles-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageEditorModern;
