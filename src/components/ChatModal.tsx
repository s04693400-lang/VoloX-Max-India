import React, { useState } from 'react';
import { X, Send, Radio, MessageSquare, Shield, Crosshair, Plus, Flame } from 'lucide-react';
import { ChatMessage } from '../game/types';

interface ChatModalProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, isTactical?: boolean) => void;
  onClose: () => void;
  playerName: string;
}

const TACTICAL_CALLOUTS = [
  { text: '🎯 Enemy Spotted! Watch out!', isTactical: true },
  { text: '🛡️ Deploy Gloo Wall / Need Cover!', isTactical: true },
  { text: '💊 Need Medkits / Bandages!', isTactical: true },
  { text: '⚡ Rush & Push the Enemy Squad!', isTactical: true },
  { text: '🏃 Storm is shrinking! Fall back to Safe Zone!', isTactical: true },
  { text: '🏆 Let\'s get this BOOYAH India!', isTactical: true },
];

export const ChatModal: React.FC<ChatModalProps> = ({
  messages,
  onSendMessage,
  onClose,
  playerName,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleTacticalClick = (text: string) => {
    onSendMessage(text, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl h-[80vh] flex flex-col rounded-3xl bg-slate-950 border-2 border-orange-500/60 shadow-[0_0_80px_rgba(249,115,22,0.3)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-teko text-3xl font-black text-white uppercase leading-none tracking-wide">
                  LIVE BATTLEGROUND CHAT
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono font-bold">
                  🇮🇳 ALL INDIA LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-rajdhani">
                Real-time communications with all human survivors in the match
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tactical Quick Radio Callouts Bar */}
        <div className="p-3 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono font-black text-orange-400 uppercase tracking-wider whitespace-nowrap pl-2">
            TACTICAL CALLOUTS:
          </span>
          {TACTICAL_CALLOUTS.map((callout, idx) => (
            <button
              key={idx}
              onClick={() => handleTacticalClick(callout.text)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-orange-600/30 border border-slate-700 hover:border-orange-500 text-xs font-rajdhani font-bold text-slate-200 hover:text-white whitespace-nowrap transition-all active:scale-95 cursor-pointer"
            >
              {callout.text}
            </button>
          ))}
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-2.5">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm font-rajdhani">
              <Radio className="w-8 h-8 mb-2 opacity-40 text-orange-400" />
              <span>No messages yet. Send a tactical callout to your fellow survivors!</span>
            </div>
          ) : (
            messages.map((msg) => {
              const isSelf = msg.senderName === playerName;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 shadow-md ${
                    msg.isTactical
                      ? 'self-center w-full max-w-full bg-gradient-to-r from-orange-950/70 via-slate-900 to-orange-950/70 border border-orange-500/50 text-orange-200 text-center'
                      : isSelf
                      ? 'self-end bg-gradient-to-r from-orange-600 to-amber-600 text-slate-950 border border-amber-300/40'
                      : 'self-start bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] font-mono font-bold opacity-80 mb-0.5">
                    <span className={isSelf ? 'text-slate-950 font-black' : 'text-orange-400'}>
                      {isSelf ? 'You' : msg.senderName}
                    </span>
                    <span className="text-[9px] opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`font-rajdhani text-sm font-bold tracking-wide ${isSelf ? 'text-slate-950 font-black' : 'text-white'}`}>
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            maxLength={100}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message to survivors..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-orange-500 text-white font-rajdhani font-semibold text-sm outline-none transition-all"
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-rajdhani font-black text-sm uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg shadow-orange-500/30"
          >
            <span>SEND</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
