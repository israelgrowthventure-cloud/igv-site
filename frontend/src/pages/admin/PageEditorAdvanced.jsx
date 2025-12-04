import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { pagesAPI } from 'utils/api';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Eye, Globe, ChevronLeft, ChevronRight,
  Layers, Paintbrush, Box, GripVertical
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
  
  const [editor, setEditor] = useState(null);
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);
  const [currentLang, setCurrentLang] = useState('fr');
  
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

  // Resizing handlers
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
        appendTo: '#layers-container',
      },
      canvas: {
        styles: [
          'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
        ],
        scripts: [],
      },
    });

    // Ajouter des blocs modernes et enrichis
    const blockManager = grapesEditor.BlockManager;
    
    // ========== SECTIONS ==========
    blockManager.add('hero-section', {
      label: 'Section Héro',
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
      attributes: { class: 'fa fa-star' }
    });

    blockManager.add('two-columns', {
      label: 'Deux Colonnes',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;">
            <div>
              <h2 style="font-size: 42px; margin-bottom: 24px; color: #1a202c; font-weight: 800; line-height: 1.2;">Excellence & Innovation</h2>
              <p style="font-size: 18px; line-height: 1.8; color: #4a5568; margin-bottom: 20px;">Nous accompagnons les entreprises dans leur développement en Israël avec une expertise reconnue et des solutions sur mesure adaptées à vos besoins spécifiques.</p>
              <p style="font-size: 18px; line-height: 1.8; color: #4a5568; margin-bottom: 32px;">Notre équipe pluridisciplinaire vous guide à chaque étape de votre projet.</p>
              <a href="#" style="display: inline-flex; align-items: center; gap: 8px; padding: 14px 32px; background: #0052CC; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,82,204,0.3);">En savoir plus →</a>
            </div>
            <div style="background: linear-gradient(135deg, #f7fafc 0%, #e2e8f0 100%); height: 400px; border-radius: 24px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 18px; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
              [Votre Image]
            </div>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-columns' }
    });

    blockManager.add('three-columns-icons', {
      label: 'Trois Colonnes',
      category: 'Sections',
      content: `
        <section style="padding: 80px 20px; background: #f7fafc;">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="text-align: center; font-size: 42px; margin-bottom: 16px; color: #1a202c; font-weight: 800;">Nos Services</h2>
            <p style="text-align: center; font-size: 18px; color: #718096; margin-bottom: 60px; max-width: 700px; margin-left: auto; margin-right: auto;">Des solutions complètes pour réussir votre implantation en Israël</p>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;">
              <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid #e2e8f0;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 8px 24px rgba(0,82,204,0.25);">🎯</div>
                <h3 style="font-size: 24px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Stratégie</h3>
                <p style="color: #4a5568; line-height: 1.7; font-size: 15px;">Élaboration de votre plan de développement stratégique en Israël avec nos experts.</p>
              </div>
              <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid #e2e8f0;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 8px 24px rgba(0,82,204,0.25);">🚀</div>
                <h3 style="font-size: 24px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Exécution</h3>
                <p style="color: #4a5568; line-height: 1.7; font-size: 15px;">Mise en œuvre opérationnelle complète de votre projet d'implantation.</p>
              </div>
              <div style="background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.06); transition: all 0.3s; border: 1px solid #e2e8f0;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; font-size: 36px; box-shadow: 0 8px 24px rgba(0,82,204,0.25);">💡</div>
                <h3 style="font-size: 24px; margin-bottom: 16px; color: #1a202c; font-weight: 700;">Innovation</h3>
                <p style="color: #4a5568; line-height: 1.7; font-size: 15px;">Accès à l'écosystème innovation israélien et aux meilleures opportunités.</p>
              </div>
            </div>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-th' }
    });

    // ========== CONTENU ==========
    blockManager.add('testimonial', {
      label: 'Témoignage',
      category: 'Contenu',
      content: `
        <div style="background: white; padding: 48px; margin: 60px auto; max-width: 900px; border-left: 5px solid #0052CC; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border-radius: 16px;">
          <p style="font-size: 22px; font-style: italic; color: #2d3748; line-height: 1.8; margin-bottom: 32px;">"IGV a été un partenaire exceptionnel dans notre développement en Israël. Leur expertise et leur réseau nous ont permis d'accélérer considérablement notre implantation."</p>
          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 20px; flex-shrink: 0;">JD</div>
            <div>
              <div style="font-weight: 700; color: #1a202c; font-size: 17px;">Jean Dupont</div>
              <div style="color: #718096; font-size: 14px; margin-top: 4px;">CEO, TechStartup France</div>
            </div>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-quote-right' }
    });

    blockManager.add('faq', {
      label: 'FAQ',
      category: 'Contenu',
      content: `
        <section style="padding: 80px 20px; max-width: 1000px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 42px; margin-bottom: 16px; color: #1a202c; font-weight: 800;">Questions Fréquentes</h2>
          <p style="text-align: center; font-size: 18px; color: #718096; margin-bottom: 60px;">Tout ce que vous devez savoir</p>
          <div style="background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
            <details style="border-bottom: 1px solid #e2e8f0; padding: 28px 32px; cursor: pointer; transition: all 0.3s;">
              <summary style="font-size: 19px; font-weight: 700; color: #1a202c; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                Comment démarrer avec IGV ?
                <span style="font-size: 28px; color: #0052CC; transition: transform 0.3s;">+</span>
              </summary>
              <p style="margin-top: 20px; color: #4a5568; line-height: 1.8; font-size: 16px;">Contactez-nous pour un premier échange gratuit. Nous analyserons vos besoins et vous proposerons un accompagnement personnalisé adapté à votre projet d'implantation en Israël.</p>
            </details>
            <details style="border-bottom: 1px solid #e2e8f0; padding: 28px 32px; cursor: pointer; transition: all 0.3s;">
              <summary style="font-size: 19px; font-weight: 700; color: #1a202c; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                Quels sont les délais d'implantation ?
                <span style="font-size: 28px; color: #0052CC; transition: transform 0.3s;">+</span>
              </summary>
              <p style="margin-top: 20px; color: #4a5568; line-height: 1.8; font-size: 16px;">Les délais varient selon votre projet. En moyenne, une implantation complète prend entre 3 et 6 mois, incluant les démarches administratives et opérationnelles.</p>
            </details>
            <details style="padding: 28px 32px; cursor: pointer; transition: all 0.3s;">
              <summary style="font-size: 19px; font-weight: 700; color: #1a202c; list-style: none; display: flex; justify-content: space-between; align-items: center;">
                Quels secteurs accompagnez-vous ?
                <span style="font-size: 28px; color: #0052CC; transition: transform 0.3s;">+</span>
              </summary>
              <p style="margin-top: 20px; color: #4a5568; line-height: 1.8; font-size: 16px;">Nous accompagnons tous types d'entreprises : tech, industrie, services, commerce. Notre expertise couvre l'ensemble de l'écosystème économique israélien.</p>
            </details>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-question-circle' }
    });

    blockManager.add('cta', {
      label: 'Appel à l\'Action',
      category: 'Contenu',
      content: `
        <section style="background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); padding: 80px 20px; text-align: center; margin: 60px 0; position: relative; overflow: hidden;">
          <div style="max-width: 800px; margin: 0 auto; position: relative; z-index: 10;">
            <h2 style="color: white; font-size: 42px; margin-bottom: 20px; font-weight: 800;">Prêt à Conquérir Israël ?</h2>
            <p style="color: rgba(255,255,255,0.95); font-size: 20px; margin-bottom: 40px; line-height: 1.6;">Rejoignez les dizaines d'entreprises qui ont choisi IGV pour leur développement en Israël. Notre expertise est à votre service.</p>
            <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
              <a href="/packs" style="display: inline-block; padding: 18px 48px; background: white; color: #0052CC; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; transition: all 0.3s; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">Voir nos packs</a>
              <a href="/contact" style="display: inline-block; padding: 18px 48px; background: transparent; border: 3px solid white; color: white; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 16px; transition: all 0.3s;">Prendre contact</a>
            </div>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-bullhorn' }
    });

    // ========== FORMULAIRES ==========
    blockManager.add('contact-form', {
      label: 'Formulaire Contact',
      category: 'Formulaires',
      content: `
        <section style="padding: 80px 20px; max-width: 700px; margin: 0 auto; background: white; border-radius: 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
          <h2 style="text-align: center; font-size: 36px; margin-bottom: 16px; color: #1a202c; font-weight: 800;">Contactez-Nous</h2>
          <p style="text-align: center; font-size: 16px; color: #718096; margin-bottom: 40px;">Nous vous répondons sous 24h</p>
          <form style="display: flex; flex-direction: column; gap: 24px;">
            <div>
              <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Nom complet *</label>
              <input type="text" placeholder="Jean Dupont" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; transition: all 0.3s; font-family: inherit;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Email *</label>
              <input type="email" placeholder="jean@entreprise.com" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; transition: all 0.3s; font-family: inherit;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Téléphone</label>
              <input type="tel" placeholder="+33 6 XX XX XX XX" style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; transition: all 0.3s; font-family: inherit;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 10px; color: #2d3748; font-weight: 600; font-size: 14px;">Message *</label>
              <textarea placeholder="Décrivez votre projet..." rows="5" required style="width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 16px; resize: vertical; transition: all 0.3s; font-family: inherit;"></textarea>
            </div>
            <button type="submit" style="padding: 18px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; border: none; border-radius: 12px; font-size: 17px; font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,82,204,0.3);">Envoyer le message</button>
          </form>
        </section>
      `,
      attributes: { class: 'fa fa-envelope' }
    });

    // ========== MÉDIA ==========
    blockManager.add('video-embed', {
      label: 'Vidéo',
      category: 'Média',
      content: `
        <div style="padding: 60px 20px; max-width: 1200px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 36px; margin-bottom: 40px; color: #1a202c; font-weight: 800;">Découvrez Notre Approche</h2>
          <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 20px; box-shadow: 0 12px 48px rgba(0,0,0,0.15);">
            <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
          <p style="text-align: center; margin-top: 20px; color: #718096; font-size: 14px;">Modifiez l'URL de la vidéo dans les propriétés</p>
        </div>
      `,
      attributes: { class: 'fa fa-video-camera' }
    });

    blockManager.add('image-carousel', {
      label: 'Carrousel',
      category: 'Média',
      content: `
        <section style="padding: 80px 20px; background: #f7fafc;">
          <h2 style="text-align: center; font-size: 42px; margin-bottom: 16px; color: #1a202c; font-weight: 800;">Nos Réalisations</h2>
          <p style="text-align: center; font-size: 18px; color: #718096; margin-bottom: 60px;">Découvrez les projets que nous avons accompagnés</p>
          <div style="max-width: 1400px; margin: 0 auto; position: relative;">
            <div style="display: flex; gap: 24px; overflow-x: auto; scroll-behavior: smooth; padding: 20px 0; scrollbar-width: thin;">
              <div style="min-width: 400px; height: 300px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 32px rgba(0,82,204,0.25); flex-shrink: 0;">
                <div style="font-size: 48px; margin-bottom: 16px;">🏢</div>
                <div style="font-size: 20px; font-weight: 700;">Projet 1</div>
                <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Tech Startup</div>
              </div>
              <div style="min-width: 400px; height: 300px; background: linear-gradient(135deg, #003D99 0%, #002366 100%); border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 32px rgba(0,61,153,0.25); flex-shrink: 0;">
                <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                <div style="font-size: 20px; font-weight: 700;">Projet 2</div>
                <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Scale-up Fintech</div>
              </div>
              <div style="min-width: 400px; height: 300px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 32px rgba(0,82,204,0.25); flex-shrink: 0;">
                <div style="font-size: 48px; margin-bottom: 16px;">💼</div>
                <div style="font-size: 20px; font-weight: 700;">Projet 3</div>
                <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Entreprise Industrielle</div>
              </div>
              <div style="min-width: 400px; height: 300px; background: linear-gradient(135deg, #003D99 0%, #002366 100%); border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 32px rgba(0,61,153,0.25); flex-shrink: 0;">
                <div style="font-size: 48px; margin-bottom: 16px;">🌟</div>
                <div style="font-size: 20px; font-weight: 700;">Projet 4</div>
                <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Commerce International</div>
              </div>
            </div>
            <p style="text-align: center; margin-top: 32px; color: #718096; font-size: 15px;">← Faites défiler pour voir plus →</p>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-picture-o' }
    });

    blockManager.add('gallery', {
      label: 'Galerie',
      category: 'Média',
      content: `
        <section style="padding: 80px 20px; max-width: 1200px; margin: 0 auto;">
          <h2 style="text-align: center; font-size: 42px; margin-bottom: 60px; color: #1a202c; font-weight: 800;">Galerie Photos</h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">📷</div>
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">📸</div>
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">🖼️</div>
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">🌄</div>
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">🎨</div>
            <div style="aspect-ratio: 1; background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%); border-radius: 16px; display: flex; align-items: center; justify-content: center; color: #a0aec0; font-size: 48px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">🏞️</div>
          </div>
        </section>
      `,
      attributes: { class: 'fa fa-th' }
    });

    blockManager.add('full-width-image', {
      label: 'Image Pleine',
      category: 'Média',
      content: `
        <div style="width: 100%; height: 500px; background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); display: flex; align-items: center; justify-content: center; color: white; position: relative; overflow: hidden;">
          <div style="text-align: center; z-index: 10;">
            <div style="font-size: 64px; margin-bottom: 16px;">🌆</div>
            <p style="font-size: 18px; opacity: 0.9;">Image pleine largeur - 1920x500px</p>
          </div>
        </div>
      `,
      attributes: { class: 'fa fa-image' }
    });

    // ========== BOUTONS ==========
    blockManager.add('button-primary', {
      label: 'Bouton Principal',
      category: 'Boutons',
      content: `
        <a href="#" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,82,204,0.3); font-size: 16px;">
          Cliquez ici
        </a>
      `,
      attributes: { class: 'fa fa-hand-pointer-o' }
    });

    blockManager.add('button-secondary', {
      label: 'Bouton Secondaire',
      category: 'Boutons',
      content: `
        <a href="#" style="display: inline-block; padding: 14px 36px; background: transparent; border: 2px solid #0052CC; color: #0052CC; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s; font-size: 16px;">
          Cliquez ici
        </a>
      `,
      attributes: { class: 'fa fa-hand-pointer-o' }
    });

    blockManager.add('button-group', {
      label: 'Groupe Boutons',
      category: 'Boutons',
      content: `
        <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center; margin: 32px 0;">
          <a href="#" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #0052CC 0%, #0065FF 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,82,204,0.3);">Action principale</a>
          <a href="#" style="display: inline-block; padding: 14px 36px; background: transparent; border: 2px solid #0052CC; color: #0052CC; text-decoration: none; border-radius: 12px; font-weight: 700; transition: all 0.3s;">Action secondaire</a>
        </div>
      `,
      attributes: { class: 'fa fa-hand-pointer-o' }
    });

    // ========== ÉLÉMENTS ==========
    blockManager.add('separator', {
      label: 'Séparateur',
      category: 'Éléments',
      content: `
        <div style="padding: 40px 0;">
          <hr style="border: none; border-top: 2px solid #e2e8f0; max-width: 200px; margin: 0 auto;">
        </div>
      `,
      attributes: { class: 'fa fa-minus' }
    });

    blockManager.add('spacer', {
      label: 'Espaceur',
      category: 'Éléments',
      content: `
        <div style="height: 60px;"></div>
      `,
      attributes: { class: 'fa fa-arrows-v' }
    });

    // CHARGER LE CONTENU EXISTANT
    if (pageContent) {
      try {
        if (pageContent.content_html) {
          grapesEditor.setComponents(pageContent.content_html);
        }
        if (pageContent.content_css) {
          grapesEditor.setStyle(pageContent.content_css);
        }
        if (pageContent.content_json && pageContent.content_json !== '{}') {
          const projectData = JSON.parse(pageContent.content_json);
          grapesEditor.loadProjectData(projectData);
        }
        toast.success('Page chargée avec succès!');
      } catch (error) {
        console.error('Erreur chargement:', error);
        toast.error('Erreur lors du chargement');
      }
    } else {
      grapesEditor.setComponents(`
        <section style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #0052CC 0%, #003D99 100%); color: white;">
          <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: 800;">Nouvelle Page</h1>
          <p style="font-size: 22px; opacity: 0.95;">Commencez à construire votre page avec les blocs de la barre latérale</p>
        </section>
      `);
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
        toast.success('Page mise à jour!');
      } else {
        await pagesAPI.create(payload);
        toast.success('Page créée!');
        navigate('/admin/pages');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    const newPublished = !pageData.published;
    setPageData({ ...pageData, published: newPublished });
    if (slug) {
      try {
        await pagesAPI.update(slug, { published: newPublished });
        toast.success(newPublished ? 'Page publiée!' : 'Page dépubliée');
      } catch (error) {
        toast.error('Erreur lors de la mise à jour');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-advanced-container">
      {/* Header */}
      <header className="editor-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin/pages')} className="back-button">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="header-title">{slug ? 'Modifier' : 'Créer'} la Page</h1>
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

          <button onClick={handlePublish} className={`publish-button ${pageData.published ? 'published' : ''}`}>
            <Eye size={18} />
            <span>{pageData.published ? 'Publié' : 'Brouillon'}</span>
          </button>

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
              disabled={!!slug}
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
        {/* Left Panel - Pages List */}
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
          <div ref={editorRef} style={{ height: '100%' }}></div>
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
              {activeRightTab === 'blocks' && (
                <div id="blocks-container" style={{ minHeight: '400px' }}></div>
              )}
              {activeRightTab === 'styles' && (
                <div id="styles-container" style={{ minHeight: '400px' }}></div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditorAdvanced;
