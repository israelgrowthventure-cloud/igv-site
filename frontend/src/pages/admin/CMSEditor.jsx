import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import 'grapesjs/dist/css/grapes.min.css';

let grapesjs = null;

const CMSEditor = () => {
    const { page_slug, language = 'fr' } = useParams();
    const navigate = useNavigate();
    const { getAuthHeader, isAuthenticated } = useAuth();
    const editorRef = useRef(null);
    const [editor, setEditor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/admin/login');
            return;
        }

        // Dynamically import GrapesJS
        import('grapesjs').then((module) => {
            grapesjs = module.default;
            initEditor();
        });

        return () => {
            if (editor) {
                editor.destroy();
            }
        };
    }, [page_slug, language]);

    const initEditor = async () => {
        if (!grapesjs || !editorRef.current) return;

        try {
            // Load existing page content
            let existingContent = null;
            try {
                const response = await axios.get(
                    `${BACKEND_URL}/cms/pages/${page_slug}/${language}`,
                    { headers: getAuthHeader() }
                );
                existingContent = response.data.data;
            } catch (err) {
                console.log('No existing content, starting fresh');
            }

            // Initialize GrapesJS
            const editorInstance = grapesjs.init({
                container: editorRef.current,
                height: '100vh',
                width: 'auto',
                storageManager: false, // We handle storage via backend
                plugins: [],
                pluginsOpts: {},
                canvas: {
                    styles: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css']
                },
                blockManager: {
                    blocks: [
                        {
                            id: 'section',
                            label: 'Section',
                            content: '<section style="padding: 40px 20px;"><h2>Section</h2><p>Add content here</p></section>',
                            category: 'Basic'
                        },
                        {
                            id: 'text',
                            label: 'Text',
                            content: '<div><p>Insert your text here</p></div>',
                            category: 'Basic'
                        },
                        {
                            id: 'image',
                            label: 'Image',
                            content: '<img src="https://via.placeholder.com/350x250" alt="placeholder"/>',
                            category: 'Basic'
                        },
                        {
                            id: 'button',
                            label: 'Button',
                            content: '<a href="#" class="btn btn-primary">Click me</a>',
                            category: 'Basic'
                        },
                        {
                            id: '2-columns',
                            label: '2 Columns',
                            content: '<div class="row"><div class="col-md-6"><p>Column 1</p></div><div class="col-md-6"><p>Column 2</p></div></div>',
                            category: 'Layout'
                        },
                        {
                            id: '3-columns',
                            label: '3 Columns',
                            content: '<div class="row"><div class="col-md-4"><p>Column 1</p></div><div class="col-md-4"><p>Column 2</p></div><div class="col-md-4"><p>Column 3</p></div></div>',
                            category: 'Layout'
                        }
                    ]
                }
            });

            // Load existing content if available
            if (existingContent) {
                editorInstance.setComponents(existingContent.gjs_html || '');
                editorInstance.setStyle(existingContent.gjs_css || '');
            }

            setEditor(editorInstance);
            setLoading(false);
        } catch (error) {
            console.error('Error initializing editor:', error);
            toast.error('Failed to initialize editor');
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editor) return;

        setSaving(true);
        try {
            const html = editor.getHtml();
            const css = editor.getCss();
            const components = editor.getComponents();
            const styles = editor.getStyle();

            const payload = {
                page_slug,
                language,
                gjs_html: html,
                gjs_css: css,
                gjs_components: components,
                gjs_styles: styles,
                published: false
            };

            // Try to create or update
            try {
                await axios.post(
                    `${BACKEND_URL}/cms/pages`,
                    payload,
                    { headers: getAuthHeader() }
                );
                toast.success('Page saved successfully!');
            } catch (createError) {
                // If exists, try update
                if (createError.response?.status === 400) {
                    const getResponse = await axios.get(
                        `${BACKEND_URL}/cms/pages/${page_slug}/${language}`,
                        { headers: getAuthHeader() }
                    );
                    const pageId = getResponse.data.data.id;

                    await axios.put(
                        `${BACKEND_URL}/cms/pages/${pageId}`,
                        {
                            gjs_html: html,
                            gjs_css: css,
                            gjs_components: components,
                            gjs_styles: styles
                        },
                        { headers: getAuthHeader() }
                    );
                    toast.success('Page updated successfully!');
                } else {
                    throw createError;
                }
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Failed to save page');
        } finally {
            setSaving(false);
        }
    };

    const handlePreview = () => {
        if (!editor) return;
        editor.runCommand('preview');
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/cms')}
                        className="inline-flex items-center gap-2 px-3 py-2  text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">
                        Editing: {page_slug} ({language.toUpperCase()})
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handlePreview}
                        disabled={!editor}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                        <Eye size={18} />
                        Preview
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !editor}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Editor Container */}
            {loading ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Loading editor...</p>
                    </div>
                </div>
            ) : (
                <div ref={editorRef} />
            )}
        </div>
    );
};

export default CMSEditor;
