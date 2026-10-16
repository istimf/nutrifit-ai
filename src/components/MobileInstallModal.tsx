import React, { useState } from 'react';
import {
  X,
  Smartphone,
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Github,
  CheckCircle2,
  Apple,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'phone' | 'github'>('phone');

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ais-pre-6rs2hkiql6dwollu7inl35-870587746814.europe-west2.run.app';

  // QR Code URL via reliable public API or SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=059669&data=${encodeURIComponent(
    appUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    await install();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold">
              {activeTab === 'phone' ? <Smartphone className="w-5 h-5" /> : <Github className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {activeTab === 'phone' ? 'Installer sur votre Téléphone' : 'Déployer sur votre GitHub'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'phone' ? 'Accédez à NutriFit AI partout en application mobile' : 'Code source complet & synchronisation git'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex gap-4 border-b border-slate-100 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'phone'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Sur mon Téléphone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'github'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Sur mon GitHub</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'phone' ? (
            <>
              {/* Native Install Button if browser supports it */}
              {isInstallable && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-900 block">
                      Navigateur compatible détecté !
                    </span>
                    <p className="text-[11px] text-emerald-700">
                      Installez l'application nativement sur votre écran d'accueil en 1 clic.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Installer l'app</span>
                  </button>
                </div>
              )}

              {isInstalled && (
                <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>NutriFit AI est déjà installée en mode autonome sur cet appareil !</span>
                </div>
              )}

              {/* QR Code and Direct Mobile Link */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="Scannez pour ouvrir sur téléphone"
                    className="w-36 h-36 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 text-center block mt-1.5 font-medium">
                    Scanner avec l'appareil photo
                  </span>
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Ouvrez l'application sur votre smartphone
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Scannez le QR Code ou copiez le lien ci-dessous pour ouvrir NutriFit AI dans le navigateur de votre smartphone (Chrome, Safari, etc.).
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={appUrl}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 font-mono w-full truncate focus:outline-none"
                    />
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1 active:scale-95 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions Android & iPhone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Android Chrome */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Sur Android (Chrome)</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside leading-relaxed pl-1">
                    <li>Ouvrez le lien dans <strong>Google Chrome</strong>.</li>
                    <li>Appuyez sur le menu (<strong>⋮</strong> en haut à droite).</li>
                    <li>Sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</li>
                  </ol>
                </div>

                {/* iPhone Safari */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                    <Apple className="w-4 h-4 text-slate-800" />
                    <span>Sur iPhone (Safari)</span>
                  </div>
                  <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside leading-relaxed pl-1">
                    <li>Ouvrez le lien dans <strong>Safari</strong>.</li>
                    <li>Touchez l'icône <strong>Partager 📤</strong> (en bas au centre).</li>
                    <li>Faites défiler et touchez <strong>« Sur l'écran d'accueil 📲 »</strong>.</li>
                  </ol>
                </div>
              </div>
            </>
          ) : (
            /* Tab: GitHub deployment */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2">
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Votre dépôt Git est initialisé</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  L'historique Git et les commits de l'application sont prêts. Pour lier ce projet à votre compte GitHub personnel :
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">
                    1. Créez un nouveau dépôt sur GitHub (vide, sans README)
                  </span>
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold underline"
                  >
                    <span>Ouvrir github.com/new</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-800 block">
                    2. Liez et envoyez le code avec ces deux commandes :
                  </span>
                  <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto">
                    <div>git remote add origin https://github.com/VOTRE_PSEUDO/VOTRE_DEPOT.git</div>
                    <div>git branch -M main</div>
                    <div>git push -u origin main</div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs">
                  <strong>💡 Conseil :</strong> Tout le code source (Reconnaissance repas Gemini, formules BMR Mifflin-St Jeor, intégration Google Fit OAuth, Service Worker PWA) est commité et prêt à être cloné ou déployé sur Vercel, Netlify ou Cloud Run.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            NutriFit AI PWA • Version 1.0.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
