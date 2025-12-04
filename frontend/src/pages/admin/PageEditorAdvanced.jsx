import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pagesAPI } from 'utils/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Eye, Globe, ChevronLeft, ChevronRight,
  Layers, Paintbrush, Box, GripVertical, AlertCircle
} from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import '../../styles/grapesjs-igv-theme.css';
import '../../styles/page-editor-advanced.css';

const PageEditorAdvanced = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const leftResizerRef = useRef(null);
  const rightResizerRef = useRef(null);
  const initAttempted = useRef(false);
  
  const [editor, setEditor] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  const [pageNotFound, setPageNotFound] = useState(false);
  
  // Panel states
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('blocks');
  
  const [pageData, setPageData] = useState({
    slug: '',
    title: { fr: '', en: '', he: '' },
    published: false,
  });

  // ===== RESIZING HANDLERS =====
  useEffect(() => {
    const handleLeftResize = (e) => {
      const newWidth = e.clientX;
      if (newWidth >= 60 && newWidth <= 400) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleRightResize = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 60 && newWidth <= 500) {
        setRightPanelWidth(newWidth);
      }
    };

    const startLeftResize = () => {
      document.addEventListener('mousemove', handleLeftResize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    const startRightResize = () => {
      document.addEventListener('mousemove', handleRightResize);
      document.addEventListener('mouseup', stopResize);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    };

    const stopResize = () => {
      document.removeEventListener('mousemove', handleLeftResize);
      document.removeEventListener('mousemove', handleRightResize);
      document.removeEventListener('mouseup', stopResize);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const leftResizer = leftResizerRef.current;
    const rightResizer = rightResizerRef.current;

    if (leftResizer) {
      leftResizer.addEventListener('mousedown', startLeftResize);
    }
    if (rightResizer) {
      rightResizer.addEventListener('mousedown', startRightResize);
    }

    return () => {
      if (leftResizer) {
        leftResizer.removeEventListener('mousedown', startLeftResize);
      }
      if (rightResizer) {
        rightResizer.removeEventListener('mousedown', startRightResize);
      }
    };
  }, []);

  // ===== INITIALIZATION =====
  useEffect(() => {
    if (slug && !initAttempted.current) {
      initAttempted.current = true;
      loadPage();
    } else if (!slug && !initAttempted.current) {
      initAttempted.current = true;
      // Attendre que le DOM soit prêt
      setTimeout(() => {
        initializeEditor();
      }, 100);
    }
  }, [slug]);

  // ===== LOAD PAGE FROM API =====
  const loadPage = async () => {
    try {
      console.log('[CMS] 📥 Loading page:', slug);
      const response = await pagesAPI.getBySlug(slug);
      
      console.log('[CMS] ✅ Page loaded:', {
        slug: response.data.slug,
        title: response.data.title,
        hasHTML: !!response.data.content_html,
        hasCSS: !!response.data.content_css,
        hasJSON: !!response.data.content_json,
        htmlLength: response.data.content_html?.length || 0,
      });

      setPage(response.data);
      setPageData({
        slug: response.data.slug,
        title: response.data.title,
        published: response.data.published,
      });
      
      setPageNotFound(false);
      
      // Attendre que le DOM soit prêt avant d'initialiser
      setTimeout(() => {
        initializeEditor(response.data);
      }, 100);
      
    } catch (error) {
      console.error('[CMS] ❌ Error loading page:', error);
      
      if (error.response?.status === 404) {
        console.warn('[CMS] ⚠️ Page not found, will create new');
        setPageNotFound(true);
        setPageData({
          slug: slug,
          title: { fr: '', en: '', he: '' },
          published: false,
        });
        setTimeout(() => {
          initializeEditor();
        }, 100);
      } else {
        toast.error('Erreur lors du chargement de la page');
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== INITIALIZE GRAPESJS EDITOR =====
  const initializeEditor = (pageContent = null) => {
    // Vérification du conteneur
    if (!editorRef.current) {
      console.error('[CMS] ❌ Editor container ref not ready, retrying...');
      setTimeout(() => initializeEditor(pageContent), 200);
      return;
    }

    // Ne pas réinitialiser si déjà créé
    if (editor) {
      console.log('[CMS] ℹ️ Editor already exists, updating content only');
      if (pageContent) {
        updateEditorContent(editor, pageContent);
      }
      return;
    }

    console.log('[CMS] 🚀 Initializing GrapesJS editor', {
      hasContainer: !!editorRef.current,
      hasPageContent: !!pageContent,
      slug: pageContent?.slug || 'new',
    });

    try {
      const grapesEditor = grapesjs.init({
        container: editorRef.current,
        plugins: [gjsPresetWebpage],
        storageManager: false,
        height: '100%',
        width: 'auto',
        panels: { defaults: [] },
        blockManager: {
          appendTo: '#blocks-container',
        },
        styleManager: {
          appendTo: '#styles-container',
          sectors: [
            {
              name: 'Dimensions',
              open: false,
              buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
            },
            {
              name: 'Typographie',
              open: false,
              buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-decoration'],
            },
            {
              name: 'Apparence',
              open: false,
              buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background', 'background-image', 'opacity'],
            },
            {
              name: 'Disposition',
              open: false,
              buildProps: ['display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'z-index'],
            },
            {
              name: 'Flexbox',
              open: false,
              buildProps: ['flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap', 'flex', 'align-self'],
            },
          ],
        },
        layersManager: {
          appendTo: '#layers-container',
        },
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
          ],
        },
      });

      console.log('[CMS] ✅ GrapesJS instance created');

      // Ajouter les blocs personnalisés IGV
      addCustomBlocks(grapesEditor.BlockManager);

      // Charger le contenu si disponible
      if (pageContent && pageContent.content_html) {
        updateEditorContent(grapesEditor, pageContent);
      } else if (pageNotFound) {
        // Message pour page non trouvée
        grapesEditor.setComponents(`
          <section style="min-height: 400px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 60px 20px;">
            <div style="text-align: center; max-width: 600px;">
              <div style="font-size: 72px; margin-bottom: 24px;">📄</div>
              <h1 style="font-size: 32px; color: #2d3748; margin-bottom: 16px; font-weight: 800;">Page non trouvée</h1>
              <p style="font-size: 18px; color: #718096; margin-bottom: 32px; line-height: 1.6;">Cette page n'existe pas encore dans la base de données. Commencez à créer du contenu avec les blocs de la barre latérale, puis cliquez sur "Enregistrer" pour la créer.</p>
              <div style="padding: 16px 24px; background: white; border-left: 4px solid #0052CC; border-radius: 8px; text-align: left;">
                <p style="margin: 0; color: #4a5568; font-size: 14px;"><strong>Slug:</strong> /${slug}</p>
              </div>
            </div>
          </section>
        `);
        toast.info('Page non trouvée - Créez du contenu et enregistrez');
      } else {
        // Template par défaut pour nouvelle page
        grapesEditor.setComponents(`
          <section style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); color: white;">
            <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: 800;">Nouvelle Page</h1>
            <p style="font-size: 22px; opacity: 0.95; line-height: 1.5;">Commencez à construire votre page avec les blocs de la barre latérale</p>
          </section>
        `);
      }

      setEditor(grapesEditor);
      console.log('[CMS] 🎉 Editor fully initialized and ready');
      
    } catch (error) {
      console.error('[CMS] ❌ Failed to initialize editor:', error);
      toast.error('Erreur lors de l\'initialisation de l\'éditeur');
    }
  };

  // ===== UPDATE EDITOR CONTENT =====
  const updateEditorContent = (grapesEditor, pageContent) => {
    if (!grapesEditor) {
      console.error('[CMS] ❌ No editor instance to update');
      return;
    }

    try {
      console.log('[CMS] 🔄 Updating editor with page content:', {
        slug: pageContent.slug,
        hasHTML: !!pageContent.content_html,
        hasCSS: !!pageContent.content_css,
        hasJSON: !!pageContent.content_json,
        htmlPreview: pageContent.content_html?.substring(0, 100) + '...',
      });

      // Priorité: Charger le HTML complet
      if (pageContent.content_html && pageContent.content_html.trim()) {
        console.log('[CMS] ✅ Loading HTML content');
        grapesEditor.setComponents(pageContent.content_html);
      } else {
        console.warn('[CMS] ⚠️ No HTML content found');
      }

      // Charger les styles CSS
      if (pageContent.content_css && pageContent.content_css.trim()) {
        console.log('[CMS] ✅ Loading CSS styles');
        grapesEditor.setStyle(pageContent.content_css);
      }

      // Charger le JSON (état complet GrapesJS)
      if (pageContent.content_json && pageContent.content_json !== '{}' && pageContent.content_json.trim()) {
        try {
          console.log('[CMS] ✅ Loading JSON project data');
          const projectData = JSON.parse(pageContent.content_json);
          grapesEditor.loadProjectData(projectData);
        } catch (jsonError) {
          console.warn('[CMS] ⚠️ JSON parse error (HTML/CSS loaded):', jsonError.message);
        }
      }

      console.log('[CMS] ✅ Content successfully loaded into editor');
      toast.success('Page chargée avec succès!');
      
    } catch (error) {
      console.error('[CMS] ❌ Error updating content:', error);
      toast.error('Erreur lors du chargement du contenu');
    }
  };

  // ===== ADD CUSTOM BLOCKS =====
  const addCustomBlocks = (blockManager) => {
    // SECTIONS
    blockManager.add('hero-section', {
      label: '🎯 Section Héro',
      category: 'Sections',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 100px 20px; text-align: center; color: white; position: relative; overflow: hidden;">
          <div style="max-width: 1200px; margin: 0 auto; position: relative; z-index: 10;">
            <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: 800; line-height: 1.2;">Transformez Votre Vision</h1>
            <p style="font-size: 22px; margin-bottom: 40px; opacity: 0.95; max-width: 700px; margin-left: auto; margin-right: auto; line-height: 1.6;">Développez votre activité en Israël avec un accompagnement expert et personnalisé</p>
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <a href="/packs" style="display: inline-block; padding: 18px 48px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; transition: all 0.3s; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">Découvrir nos packs</a>
              <a href="/contact" style="display: inline-block; padding: 18px 48px; background: transparent; border: 3px solid white; color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; transition: all 0.3s;">Nous contacter</a>
            </div>
          </div>
        </section>
      `,
    });

    blockManager.add('two-columns', {
      label: '📊 Deux Colonnes',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
            <div>
              <h2 style="font-size: 42px; margin-bottom: 24px; color: #1a202c; font-weight: 800; line-height: 1.2;">Excellence & Innovation</h2>
              <p style="font-size: 18px; line-height: 1.8; color: #4a5568; margin-bottom: 20px;">Nous accompagnons les entreprises dans leur développement en Israël avec une expertise reconnue et des solutions sur mesure.</p>
              <a href="#" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #0052CC; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; transition: all 0.3s;">En savoir plus →</a>
            </div>
            <div style="background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%); height: 400px; border-radius: 24px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 18px;">
              [Votre Image]
            </div>
          </div>
        </section>
      `,
    });

    blockManager.add('three-columns', {
      label: '🏢 Trois Colonnes',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; background: #f7fafc;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; font-size: 42px; margin-bottom: 16px; color: #1a202c; font-weight: 800;">Nos Services</h2>
            <p style="text-align: center; font-size: 18px; color: #718096; margin-bottom: 60px;">Des solutions complètes pour réussir</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
              <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 36px;">🎯</div>
                <h3 style="font-size: 24px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Stratégie</h3>
                <p style="color: #4a5568; line-height: 1.7;">Élaboration de votre plan de développement stratégique.</p>
              </div>
              <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 36px;">🚀</div>
                <h3 style="font-size: 24px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Exécution</h3>
                <p style="color: #4a5568; line-height: 1.7;">Mise en œuvre opérationnelle de votre projet.</p>
              </div>
              <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 36px;">💡</div>
                <h3 style="font-size: 24px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Innovation</h3>
                <p style="color: #4a5568; line-height: 1.7;">Accès à l'écosystème innovation israélien.</p>
              </div>
            </div>
          </div>
        </section>
      `,
    });

    // CONTENU
    blockManager.add('testimonial', {
      label: '💬 Témoignage',
      category: 'Contenu',
      content: `
        <div style="background: white; padding: 48px; margin: 60px auto; max-width: 900px; border-left: 5px solid #0052CC; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border-radius: 16px;">
          <p style="font-size: 22px; font-style: italic; color: #2d3748; line-height: 1.8; margin-bottom: 32px;">"IGV a été un partenaire exceptionnel dans notre développement en Israël."</p>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px;">JD</div>
            <div>
              <div style="font-weight: 700; color: #1a202c; font-size: 17px;">Jean Dupont</div>
              <div style="color: #718096; font-size: 14px;">CEO, TechStartup</div>
            </div>
          </div>
        </div>
      `,
    });

    blockManager.add('cta', {
      label: '📣 Appel à l\'Action',
      category: 'Contenu',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 80px 20px; text-align: center; margin: 60px 0;">
          <div style="max-width: 800px; margin: 0 auto;">
            <h2 style="color: white; font-size: 42px; margin-bottom: 20px; font-weight: 800;">Prêt à Démarrer ?</h2>
            <p style="color: rgba(255,255,255,0.95); font-size: 20px; margin-bottom: 40px;">Rejoignez les entreprises qui nous font confiance</p>
            <a href="/contact" style="display: inline-block; padding: 18px 48px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px;">Prendre contact</a>
          </div>
        </section>
      `,
    });

    // FORMULAIRES
    blockManager.add('contact-form', {
      label: '📧 Formulaire Contact',
      category: 'Formulaires',
      content: `
        <section style="padding: 80px 20px; max-width: 700px; margin: 0 auto; background: white; border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
          <h2 style="text-align: center; font-size: 36px; margin-bottom: 40px; color: #1a202c; font-weight: 800;">Contactez-Nous</h2>
          <form style="display: flex; flex-direction: column; gap: 24px;">
            <div>
              <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600;">Nom complet *</label>
              <input type="text" placeholder="Jean Dupont" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600;">Email *</label>
              <input type="email" placeholder="jean@entreprise.com" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600;">Message *</label>
              <textarea placeholder="Votre message..." rows="5" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; resize: vertical;"></textarea>
            </div>
            <button type="submit" style="padding: 18px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer;">Envoyer</button>
          </form>
        </section>
      `,
    });

    // BOUTONS
    blockManager.add('button-primary', {
      label: '🔘 Bouton Principal',
      category: 'Boutons',
      content: `
        <a href="#" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,82,204,0.3); font-size: 16px;">
          Cliquez ici
        </a>
      `,
    });

    blockManager.add('button-secondary', {
      label: '⚪ Bouton Secondaire',
      category: 'Boutons',
      content: `
        <a href="#" style="display: inline-block; padding: 14px 36px; background: transparent; border: 2px solid #0052CC; color: #0052CC; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s; font-size: 16px;">
          Cliquez ici
        </a>
      `,
    });
  };

  // ===== SAVE PAGE =====
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

      console.log('[CMS] 💾 Saving page:', {
        slug: pageData.slug,
        htmlLength: html.length,
        cssLength: css.length,
        isUpdate: !!slug,
      });

      if (slug && !pageNotFound) {
        await pagesAPI.update(slug, payload);
        toast.success('✅ Page mise à jour avec succès!');
      } else {
        const created = await pagesAPI.create(payload);
        toast.success('✅ Page créée avec succès!');
        // Rediriger vers l'édition de la page créée
        setTimeout(() => {
          navigate(`/admin/pages/${created.data.slug}`);
        }, 1000);
      }
    } catch (error) {
      console.error('[CMS] ❌ Error saving:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // ===== PUBLISH/UNPUBLISH =====
  const handlePublish = async () => {
    const newPublished = !pageData.published;
    setPageData({ ...pageData, published: newPublished });
    
    if (slug && !pageNotFound) {
      try {
        await pagesAPI.update(slug, { published: newPublished });
        toast.success(newPublished ? '✅ Page publiée!' : '📝 Page en brouillon');
      } catch (error) {
        console.error('[CMS] ❌ Error updating publish status:', error);
        toast.error('Erreur lors de la mise à jour');
        setPageData({ ...pageData, published: !newPublished });
      }
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement de la page...</p>
        </div>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="editor-advanced-container">
      {/* Header */}
      <header className="editor-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/pages')} className="back-button" title="Retour">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="header-title">
              {pageNotFound ? 'Créer' : slug ? 'Modifier' : 'Créer'} la Page
            </h1>
            <p className="header-slug">/{pageData.slug || 'nouvelle-page'}</p>
          </div>
        </div>

        <div className="header-right">
          {/* Language Selector */}
          <div className="lang-selector">
            {['fr', 'en', 'he'].map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`lang-button ${currentLang === lang ? 'active' : ''}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {!pageNotFound && (
            <button onClick={handlePublish} className={`publish-button ${pageData.published ? 'published' : ''}`}>
              <Eye size={18} />
              <span>{pageData.published ? 'Publié' : 'Brouillon'}</span>
            </button>
          )}

          <button onClick={handleSave} disabled={saving} className="save-button">
            <Save size={18} />
            <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </header>

      {/* Page Settings */}
      <div className="page-settings">
        <div className="settings-grid">
          <div>
            <label className="settings-label">Slug (URL)</label>
            <input
              type="text"
              value={pageData.slug}
              onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
              disabled={!!slug && !pageNotFound}
              className="settings-input"
              placeholder="a-propos"
            />
          </div>
          <div className="settings-title-group">
            <label className="settings-label">Titre ({currentLang.toUpperCase()})</label>
            <input
              type="text"
              value={pageData.title[currentLang] || ''}
              onChange={(e) =>
                setPageData({
                  ...pageData,
                  title: { ...pageData.title, [currentLang]: e.target.value },
                })
              }
              className="settings-input"
              placeholder={`Titre en ${currentLang.toUpperCase()}`}
            />
          </div>
        </div>
      </div>

      {/* Editor Layout */}
      <div className="editor-layout">
        {/* Left Panel - Layers */}
        <div 
          className={`left-panel ${leftPanelCollapsed ? 'collapsed' : ''}`}
          style={{ width: leftPanelCollapsed ? '60px' : `${leftPanelWidth}px` }}
        >
          <div className="panel-header">
            <button 
              className="panel-toggle"
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              title={leftPanelCollapsed ? 'Développer' : 'Réduire'}
            >
              {leftPanelCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
            {!leftPanelCollapsed && (
              <div className="panel-title">
                <Layers size={18} />
                <span>Structure</span>
              </div>
            )}
          </div>
          {!leftPanelCollapsed && (
            <div className="panel-content">
              <div id="layers-container" style={{ minHeight: '200px' }}></div>
            </div>
          )}
        </div>

        {/* Left Resizer */}
        {!leftPanelCollapsed && (
          <div ref={leftResizerRef} className="resizer resizer-left">
            <GripVertical size={16} />
          </div>
        )}

        {/* Canvas */}
        <div className="editor-canvas">
          <div ref={editorRef} style={{ height: '100%', width: '100%' }}></div>
        </div>

        {/* Right Resizer */}
        {!rightPanelCollapsed && (
          <div ref={rightResizerRef} className="resizer resizer-right">
            <GripVertical size={16} />
          </div>
        )}

        {/* Right Panel - Blocks & Styles */}
        <div 
          className={`right-panel ${rightPanelCollapsed ? 'collapsed' : ''}`}
          style={{ width: rightPanelCollapsed ? '60px' : `${rightPanelWidth}px` }}
        >
          <div className="panel-header">
            {!rightPanelCollapsed && (
              <div className="panel-tabs">
                <button
                  className={`panel-tab ${activeRightTab === 'blocks' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('blocks')}
                >
                  <Box size={18} />
                  <span>Blocs</span>
                </button>
                <button
                  className={`panel-tab ${activeRightTab === 'styles' ? 'active' : ''}`}
                  onClick={() => setActiveRightTab('styles')}
                >
                  <Paintbrush size={18} />
                  <span>Styles</span>
                </button>
              </div>
            )}
            <button 
              className="panel-toggle"
              onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
              title={rightPanelCollapsed ? 'Développer' : 'Réduire'}
            >
              {rightPanelCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
          
          {!rightPanelCollapsed && (
            <div className="panel-content">
              {/* Blocs Container - Toujours dans le DOM */}
              <div 
                id="blocks-container" 
                style={{ 
                  minHeight: '400px',
                  display: activeRightTab === 'blocks' ? 'block' : 'none'
                }}
              ></div>
              
              {/* Styles Container - Toujours dans le DOM */}
              <div 
                id="styles-container" 
                style={{ 
                  minHeight: '400px',
                  display: activeRightTab === 'styles' ? 'block' : 'none'
                }}
              >
                {/* Message par défaut quand aucun élément sélectionné */}
                <div className="styles-empty-message" style={{ display: editor ? 'none' : 'block' }}>
                  <Paintbrush size={32} />
                  <p>Sélectionnez un élément<br/>pour modifier ses styles</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditorAdvanced;
