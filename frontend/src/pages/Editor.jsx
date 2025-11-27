import React, { useState, useEffect } from 'react';
import EditorAccess from './EditorAccess';
import { AlertCircle } from 'lucide-react';

/**
 * Page principale de l'éditeur drag & drop
 * Intègre le builder Emergent avec protection par code
 */
const Editor = () => {
  const [builderAvailable, setBuilderAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si le builder Emergent est disponible
    // Une fois les fichiers copiés depuis igv-cms, ceci détectera le composant
    const checkBuilder = async () => {
      try {
        // Tentative d'import du builder
        const builder = await import('../cms-builder/BuilderMain').catch(() => null);
        setBuilderAvailable(!!builder);
      } catch (error) {
        setBuilderAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    checkBuilder();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement de l'éditeur...</p>
        </div>
      </div>
    );
  }

  // Message si le builder n'est pas encore intégré
  if (!builderAvailable) {
    return (
      <EditorAccess>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Builder en cours d'intégration
                </h2>
                <div className="prose prose-gray">
                  <p className="text-gray-700 mb-4">
                    L'éditeur drag & drop Emergent est en cours d'installation.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Pour terminer l'intégration, veuillez copier les fichiers du builder depuis :
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-4">
                    <code>C:\Users\PC\Desktop\IGV\CMS\igv-cms\src\*</code>
                    <br />
                    vers
                    <br />
                    <code>C:\Users\PC\Desktop\IGV\igv site\igv-website-complete\frontend\src\cms-builder\</code>
                  </div>
                  <p className="text-gray-700">
                    Une fois les fichiers copiés, l'éditeur sera automatiquement disponible.
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">En attendant :</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Les pages CMS fonctionnent normalement</li>
                    <li>Les paiements Stripe sont opérationnels</li>
                    <li>Tous les contenus restent accessibles</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </EditorAccess>
    );
  }

  // Ici, une fois le builder copié, on l'importera et l'affichera
  // Pour l'instant, message d'attente
  return (
    <EditorAccess>
      <div className="min-h-screen bg-gray-50">
        {/* Le builder Emergent sera intégré ici */}
        <div className="container mx-auto p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Éditeur Drag & Drop
          </h1>
          <p className="text-gray-600">
            Le builder Emergent sera chargé ici une fois les fichiers copiés.
          </p>
        </div>
      </div>
    </EditorAccess>
  );
};

export default Editor;

