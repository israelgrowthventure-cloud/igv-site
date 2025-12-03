import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pagesAPI } from 'utils/api';
import { toast } from 'sonner';
import { ArrowLeft, Save, Eye, Globe } from 'lucide-react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import gjsPresetWebpage from 'grapesjs-preset-webpage';

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
            name: 'Décorations',
            open: false,
            buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'background', 'background-image'],
          },
          {
            name: 'Disposition',
            open: false,
            buildProps: ['display', 'position', 'top', 'right', 'bottom', 'left', 'float', 'z-index'],
          },
          {
            name: 'Flexbox',
            open: false,
            buildProps: ['flex-direction', 'justify-content', 'align-items', 'flex-wrap', 'gap'],
          },
        ],
      },
      layersManager: {
        appendTo: '.layers-container',
      },
    });

    // Ajouter des blocs personnalisés modernes
    const blockManager = grapesEditor.BlockManager;
    
    // Bloc Section Héro
    blockManager.add('hero-section', {
      label: 'Section Héro',
      category: 'Sections',
      content: `
        <section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 80px 20px; text-align: center; color: white;">
          <h1 style="font-size: 48px; margin-bottom: 20px; font-weight: bold;">Titre Principal</h1>
          <p style="font-size: 20px; margin-bottom: 30px; opacity: 0.9;">Un sous-titre accrocheur pour captiver votre audience</p>
          <a href="#" style="display: inline-block; padding: 15px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 30px; font-weight: bold; transition: transform 0.3s;">Commencer</a>
        </section>
      `,
      attributes: { class: 'fa fa-star' }
    });
    
    // Bloc Deux Colonnes
    blockManager.add('two-columns', {
      label: 'Deux Colonnes',
      category: 'Sections',
      content: `
        <section style="padding: 60px 20px; max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center;">
            <div>
              <h2 style="font-size: 36px; margin-bottom: 20px; color: #333;">Titre de Section</h2>
              <p style="font-size: 18px; line-height: 1.6; color: #666;">Votre contenu textuel ici. Décrivez votre service, produit ou message de manière claire et engageante.</p>
              <a href="#" style="display: inline-block; margin-top: 20px; padding: 12px 30px; background: #0052CC; color: white; text-decoration: none; border-radius: 8px;">En savoir plus</a>
            </div>
            <div style="background: #f5f5f5; height: 300px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #999;">
              [Image]
            </div>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-columns' }
    });
    
    // Bloc Trois Colonnes avec Icônes
    blockManager.add('three-columns-icons', {
      label: 'Trois Colonnes',
      category: 'Sections',
      content: `
        <section style="padding: 60px 20px; background: #f9fafb;">
          <h2 style="text-align: center; font-size: 36px; margin-bottom: 50px; color: #333;">Nos Services</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px; max-width: 1200px; margin: 0 auto;">
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="width: 60px; height: 60px; background: #0052CC; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🎯</div>
              <h3 style="font-size: 24px; margin-bottom: 15px; color: #333;">Service 1</h3>
              <p style="color: #666; line-height: 1.6;">Description courte de votre premier service ou fonctionnalité.</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="width: 60px; height: 60px; background: #0052CC; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">🚀</div>
              <h3 style="font-size: 24px; margin-bottom: 15px; color: #333;">Service 2</h3>
              <p style="color: #666; line-height: 1.6;">Description courte de votre deuxième service ou fonctionnalité.</p>
            </div>
            <div style="background: white; padding: 30px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="width: 60px; height: 60px; background: #0052CC; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">💡</div>
              <h3 style="font-size: 24px; margin-bottom: 15px; color: #333;">Service 3</h3>
              <p style="color: #666; line-height: 1.6;">Description courte de votre troisième service ou fonctionnalité.</p>
            </div>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-th' }
    });
    
    // Bloc Témoignage / Avis Client
    blockManager.add('testimonial', {
      label: 'Témoignage',
      category: 'Contenu',
      content: `
        <div style="background: white; padding: 40px; margin: 40px auto; max-width: 800px; border-left: 4px solid #0052CC; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px;">
          <p style="font-size: 20px; font-style: italic; color: #333; line-height: 1.8; margin-bottom: 20px;">"Ce service a transformé notre activité en Israël. L'équipe est professionnelle et les résultats sont au rendez-vous."</p>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="width: 50px; height: 50px; background: #0052CC; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">JD</div>
            <div>
              <div style="font-weight: bold; color: #333;">Jean Dupont</div>
              <div style="color: #666; font-size: 14px;">Directeur Commercial, Entreprise XYZ</div>
            </div>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-quote-right' }
    });
    
    // Bloc FAQ / Accordéon
    blockManager.add('faq', {
      label: 'FAQ',
      category: 'Contenu',
      content: `
        <section style="padding: 60px 20px; max-width: 900px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 36px; margin-bottom: 40px; color: #333;">Questions Fréquentes</h2>
          <div style="background: white; border-radius: 12px; overflow: hidden;">
            <details style="border-bottom: 1px solid #e5e7eb; padding: 20px; cursor: pointer;">
              <summary style="font-size: 18px; font-weight: 600; color: #333; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                Question 1: Comment fonctionne le processus ?
                <span style="font-size: 24px;">+</span>
              </summary>
              <p style="margin-top: 15px; color: #666; line-height: 1.6;">Réponse détaillée à la première question. Expliquez clairement le processus étape par étape.</p>
            </details>
            <details style="border-bottom: 1px solid #e5e7eb; padding: 20px; cursor: pointer;">
              <summary style="font-size: 18px; font-weight: 600; color: #333; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                Question 2: Quels sont les délais ?
                <span style="font-size: 24px;">+</span>
              </summary>
              <p style="margin-top: 15px; color: #666; line-height: 1.6;">Réponse détaillée sur les délais et le planning.</p>
            </details>
            <details style="padding: 20px; cursor: pointer;">
              <summary style="font-size: 18px; font-weight: 600; color: #333; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                Question 3: Quels sont les tarifs ?
                <span style="font-size: 24px;">+</span>
              </summary>
              <p style="margin-top: 15px; color: #666; line-height: 1.6;">Information sur les tarifs et options de paiement.</p>
            </details>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-question-circle' }
    });
    
    // Bloc CTA (Call-to-Action)
    blockManager.add('cta', {
      label: 'Appel à l\'Action',
      category: 'Contenu',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 60px 20px; text-align: center; margin: 40px 0;">
          <h2 style="color: white; font-size: 36px; margin-bottom: 20px;">Prêt à Démarrer ?</h2>
          <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 30px; max-width: 600px; margin-left: auto; margin-right: auto;">Rejoignez les entreprises qui ont choisi IGV pour leur développement en Israël.</p>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <a href="/packs" style="display: inline-block; padding: 15px 40px; background: white; color: #0052CC; text-decoration: none; border-radius: 8px; font-weight: bold;">Voir nos packs</a>
            <a href="/contact" style="display: inline-block; padding: 15px 40px; background: transparent; border: 2px solid white; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Nous contacter</a>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-bullhorn' }
    });
    
    // Bloc Formulaire de Contact
    blockManager.add('contact-form', {
      label: 'Formulaire Contact',
      category: 'Formulaires',
      content: `
        <section style="padding: 60px 20px; max-width: 700px; margin: 0 auto; background: #f9fafb; border-radius: 12px;">
          <h2 style="text-align: center; font-size: 32px; margin-bottom: 30px; color: #333;">Contactez-Nous</h2>
          <form style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Nom complet *</label>
              <input type="text" placeholder="Votre nom" required style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Email *</label>
              <input type="email" placeholder="votre@email.com" required style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Téléphone</label>
              <input type="tel" placeholder="+33 X XX XX XX XX" style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 8px; color: #333; font-weight: 500;">Message *</label>
              <textarea placeholder="Votre message..." rows="5" required style="width: 100%; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
            </div>
            <button type="submit" style="padding: 15px; background: #0052CC; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer;">Envoyer le message</button>
          </form>
        </section>
      `,
      attributes: { class: 'fa fa-envelope' }
    });
    
    // Bloc Image Pleine Largeur
    blockManager.add('full-width-image', {
      label: 'Image Pleine',
      category: 'Média',
      content: `
        <div style="width: 100%; height: 400px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
          [Image pleine largeur - 1920x400px]
        </div>
      `,
      attributes: { class: 'fa fa-image' }
    });
    
    // Bloc Bouton Primaire
    blockManager.add('button-primary', {
      label: 'Bouton Primaire',
      category: 'Boutons',
      content: `
        <a href="#" style="display: inline-block; padding: 12px 30px; background: #0052CC; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; transition: background 0.3s;">
          Cliquez ici
        </a>
      `,
      attributes: { class: 'fa fa-hand-pointer' }
    });
    
    // Bloc Bouton Secondaire
    blockManager.add('button-secondary', {
      label: 'Bouton Secondaire',
      category: 'Boutons',
      content: `
        <a href="#" style="display: inline-block; padding: 12px 30px; background: transparent; border: 2px solid #0052CC; color: #0052CC; text-decoration: none; border-radius: 8px; font-weight: 600; transition: all 0.3s;">
          Cliquez ici
        </a>
      `,
      attributes: { class: 'fa fa-hand-pointer-o' }
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
        toast.success('Page mise à jour avec succès!');
      } else {
        await pagesAPI.create(payload);
        toast.success('Page créée avec succès!');
        navigate('/admin/pages');
      }
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPageData({ ...pageData, published: !pageData.published });
    if (slug) {
      try {
        await pagesAPI.update(slug, { published: !pageData.published });
        toast.success(pageData.published ? 'Page dépubliée' : 'Page publiée!');
      } catch (error) {
        toast.error('Erreur lors de la mise à jour');
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
                {slug ? 'Modifier la Page' : 'Créer une Nouvelle Page'}
              </h1>
              <p className="text-sm text-gray-500">{pageData.slug || 'Nouvelle page'}</p>
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
              <span>{pageData.published ? 'Publié' : 'Brouillon'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-[#0052CC] text-white rounded-lg font-medium hover:bg-[#003D99] transition-colors disabled:opacity-50"
              data-testid="save-button"
            >
              <Save size={18} />
              <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Page Settings */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug de la Page (URL)</label>
            <input
              type="text"
              value={pageData.slug}
              onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
              disabled={!!slug}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:border-transparent disabled:bg-gray-100"
              placeholder="a-propos"
              data-testid="slug-input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre de la Page ({currentLang.toUpperCase()})
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
              placeholder="Entrez le titre de la page"
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
            <h3 className="font-semibold text-gray-900 mb-3">Éléments</h3>
            <div className="blocks-container"></div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Calques</h3>
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

