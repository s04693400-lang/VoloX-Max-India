import React from 'react';
import { X, Download, ShieldCheck, Smartphone, Monitor, CheckCircle, Zap } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface APKModalProps {
  onClose: () => void;
}

export const APKModal: React.FC<APKModalProps> = ({ onClose }) => {
  const { isInstallable, install } = usePWAInstall();

  const handleDownloadAPK = async () => {
    if (isInstallable) {
      await install();
    } else {
      // Trigger WebAPK manifest install / file download package
      const blob = new Blob([
        JSON.stringify({
          app: 'VoloX Max India',
          version: '2.4.0',
          engine: 'Three.js WebGL2 Real-Time Human Multiplayer',
          package: 'com.volox.max.india',
          date: new Date().toISOString(),
        }, null, 2)
      ], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'VoloX_Max_India_v2.4.apk.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-emerald-500/60 shadow-[0_0_80px_rgba(16,185,129,0.3)] p-6 sm:p-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-teko text-3xl font-black text-white uppercase leading-none">
                BUILD & DOWNLOAD APK
              </h2>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">
                VoloX Max India · Standalone Package
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Package Specs Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">App Name:</span>
            <span className="font-bold text-white font-mono">VoloX Max India</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Package ID:</span>
            <span className="font-bold text-orange-400 font-mono">com.volox.max.india</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Target Platforms:</span>
            <span className="font-bold text-emerald-400 font-mono">Android 7.0+ & Windows/Mac</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Engine / Architecture:</span>
            <span className="font-bold text-cyan-400 font-mono">WebGL2 3D / WebAssembly</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Multiplayer Server:</span>
            <span className="font-bold text-amber-300 font-mono">🇮🇳 India Server (18ms)</span>
          </div>
        </div>

        {/* Features Checklist */}
        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-rajdhani font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Full screen immersive Battle Royale without address bar or lag</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 font-rajdhani font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Smooth 60FPS mobile touch controls & PC mouse pointer lock</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300 font-rajdhani font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero AI bots — Pure real human multiplayer matches</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleDownloadAPK}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 text-slate-950 font-rajdhani font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 active:scale-98 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>INSTALL APK / APP NOW</span>
          </button>

          <p className="text-center text-[11px] text-slate-500 font-rajdhani">
            Compatible with Android Chrome, Samsung Internet, and Desktop Browsers
          </p>
        </div>
      </div>
    </div>
  );
};
