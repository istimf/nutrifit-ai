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
  UploadCloud,
  FileArchive,
  AlertCircle,
  KeyRound,
  Terminal,
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
  const [activeTab, setActiveTab] = useState<'phone' | 'github'>('github');

  // GitHub deploy state
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);

  const appUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ais-pre-6rs2hkiql6dwollu7inl35-870587746814.europe-west2.run.app';

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

  const handlePushToGithub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepoUrl) {
      setPushError("Veuillez renseigner l'URL de votre dépôt GitHub (ex: https://github.com/votre_pseudo/nutrifit).");
      return;
    }

    setIsPushing(true);
    setPushError(null);
    setPushSuccess(null);

    try {
      const response = await fetch('/api/git-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoUrl: githubRepoUrl,
          personalAccessToken: githubToken,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du git push');
      }

      setPushSuccess(data.message || 'Projet envoyé avec succès sur votre GitHub !');
    } catch (err: any) {
      console.error(err);
      setPushError(err.message || 'Impossible de pousser vers GitHub. Vérifiez votre URL et votre token d\'accès.');
    } finally {
      setIsPushing(false);
    }
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
                {activeTab === 'phone' ? 'Accédez à NutriFit AI partout en application mobile' : 'Envoyez le code sur votre compte personnel en 1 clic'}
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
            onClick={() => setActiveTab('github')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'github'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>Sur mon GitHub</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'phone'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Sur mon Téléphone</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'github' ? (
            /* Tab: GitHub deployment */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 text-white space-y-1.5">
                <div className="flex items-center gap-2">
                  <Github className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Pourquoi rien n'apparaît encore sur votre GitHub ?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tout le code est déjà initialisé et commité localement. Pour que GitHub accepte le code sur <strong>votre compte personnel</strong>, vous devez indiquer l'adresse de votre dépôt et autoriser l'envoi ci-dessous.
                </p>
              </div>

              {/* Formulaire d'envoi 1-clic vers GitHub */}
              <form onSubmit={handlePushToGithub} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4 text-emerald-600" />
                  Option A : Envoi automatique direct
                </span>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1. URL de votre dépôt GitHub
                  </label>
                  <input
                    type="url"
                    required
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/votre_pseudo/nom-du-depot"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-900"
                  />
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span>Pas encore de dépôt ?</span>
                    <a
                      href="https://github.com/new"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline font-semibold flex items-center gap-0.5"
                    >
                      Créez-en un ici sur github.com/new
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      <span>2. GitHub Personal Access Token (PAT)</span>
                    </label>
                    <a
                      href="https://github.com/settings/tokens/new?scopes=repo"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-emerald-700 hover:underline font-medium flex items-center gap-1"
                    >
                      Générer un token (scope repo)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono text-slate-900"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Requis par GitHub pour sécuriser l'écriture sur votre compte. Non stocké.
                  </span>
                </div>

                {pushSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{pushSuccess}</span>
                  </div>
                )}

                {pushError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{pushError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPushing}
                  className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <UploadCloud className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
                  <span>{isPushing ? 'Envoi vers GitHub en cours...' : 'Pousser le code sur mon GitHub'}</span>
                </button>
              </form>

              {/* Option B : Téléchargement ZIP ou Push en ligne de commande */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <a
                  href="/api/download-archive"
                  download="nutrifit-ai.tar.gz"
                  className="p-3.5 bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 rounded-2xl transition flex items-center gap-3 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <FileArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Télécharger l'archive</span>
                    <span className="text-[11px] text-slate-500">Code complet prêt à glisser sur GitHub</span>
                  </div>
                </a>

                <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
                      <Terminal className="w-4 h-4 text-slate-600" />
                      <span>En ligne de commande</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Depuis votre terminal avec <code>git push</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            NutriFit AI • Prêt pour GitHub et Mobile
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
