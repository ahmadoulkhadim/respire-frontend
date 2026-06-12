import React from 'react';
import { Cpu } from 'lucide-react';

const IaDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="hero-banner">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center gap-4">
            <Cpu className="w-8 h-8 text-blue-200" />
            <div>
              <h1 className="text-white mb-2">Dashboard IA</h1>
              <p className="text-lg text-blue-200">
                Analyse prédictive • Machine Learning • Corrélations santé
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 -mt-6 relative z-10">
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex items-start gap-3">
              <Cpu className="w-5 h-5 text-respire-600 mt-0.5" />
              <div>
                <h2 className="text-lg font-bold font-display text-gray-900 mb-1">
                  Tableau de bord intelligent
                </h2>
                <p className="text-sm text-gray-500">
                  Module d'analyse IA développé avec Streamlit. Ce dashboard utilise des modèles de
                  Machine Learning (Random Forest, Gradient Boosting) pour analyser les corrélations
                  entre la qualité de l'air et les symptômes rapportés par les citoyens.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Iframe */}
        <div className="card overflow-hidden">
          <div className="relative w-full" style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}>
            <iframe
              src="http://localhost:8501"
              title="Dashboard IA"
              className="absolute inset-0 w-full h-full border-0"
              allow="clipboard-read; clipboard-write"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Le dashboard IA doit être lancé séparément avec{' '}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono text-respire-600">
            streamlit run app.py
          </code>{' '}
          depuis le dossier <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">ia_dashboard/</code>
        </p>
      </div>
    </div>
  );
};

export default IaDashboard;
