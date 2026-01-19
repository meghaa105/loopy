
import React from 'react';
import { Loop, Member } from '../types.ts';
import { MemberAvatar } from './MemberAvatar.tsx';

interface PublicReaderViewProps {
  loop: Loop;
  onBackToApp: () => void;
}

const PublicReaderView: React.FC<PublicReaderViewProps> = ({ loop, onBackToApp }) => {
  const getResponsesByQuestion = () => {
    const map: Record<string, { q: string, r: { member: Member, text: string }[] }> = {};
    loop.questions.forEach(q => {
      map[q.id] = { q: q.text, r: [] };
    });
    loop.responses.forEach(r => {
      if (map[r.questionId]) {
        const member = loop.members.find(m => m.id === r.memberId);
        if (member) {
          map[r.questionId].r.push({ member, text: r.answer });
        }
      }
    });
    return Object.values(map).filter(item => item.r.length > 0);
  };

  const groupedResponses = getResponsesByQuestion();

  return (
    <div className="min-h-screen pb-32">
      <nav className="max-w-6xl mx-auto px-6 py-12 flex justify-between items-center">
        <div className="text-4xl serif font-black tracking-tighter">Loopy<span className="text-violet-600">.</span></div>
        <button 
          onClick={onBackToApp} 
          className="bg-black text-white px-6 py-3 neo-brutal text-[10px] font-black uppercase tracking-[0.2em]"
        >
          &larr; Return to App
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white neo-brutal-static overflow-hidden">
          {/* Magazine Cover */}
          <div className="relative h-[750px] border-b-4 border-black">
            {loop.headerImage ? (
              <img src={loop.headerImage} className="w-full h-full object-cover grayscale" alt="Header" />
            ) : (
              <div className="w-full h-full bg-stone-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            <div className="absolute top-12 left-12 right-12 flex justify-between items-start">
               <div className="bg-yellow-300 text-black px-4 py-2 neo-brutal rotate-[-2deg] font-black text-xs uppercase tracking-[0.3em]">Issue #001</div>
               <div className="bg-white text-black px-4 py-2 neo-brutal rotate-[2deg] font-black text-[10px] uppercase tracking-widest">{loop.category}</div>
            </div>

            <div className="absolute bottom-16 left-12 right-12 text-white">
              <h1 className="text-[12vw] md:text-[8rem] serif font-black leading-[0.7] tracking-tighter mb-12 break-words uppercase">
                {loop.name}
              </h1>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
                <div className="space-y-4">
                  <p className="text-2xl italic serif opacity-90 max-w-sm leading-tight">
                    {loop.lastGeneratedAt ? new Date(loop.lastGeneratedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Vol 01'}
                  </p>
                  <div className="h-1 w-24 bg-white" />
                </div>
                <div className="flex -space-x-5">
                  {loop.members.map(m => (
                    <MemberAvatar key={m.id} member={m} size="md" className="ring-4 ring-black" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 md:p-32 space-y-64">
            {/* Intro Editor Note */}
            <div className="max-w-3xl relative">
              <div className="mb-12 inline-block">
                <span className="text-7xl absolute -top-12 -left-12 opacity-20">✍️</span>
                <span className="bg-black text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.5em] neo-brutal rotate-1">Editor's Letter</span>
              </div>
              <p className="text-4xl md:text-5xl text-black leading-[1.2] italic serif font-medium first-letter:text-9xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:leading-none first-letter:text-violet-600">
                {loop.introText || "Life moves fast. This is our pause button."}
              </p>
            </div>

            {loop.collationMode === 'ai' && loop.narrativeText ? (
              <div className="max-w-4xl mx-auto">
                 <div className="px-6 py-2 bg-emerald-100 border-2 border-black text-black text-[10px] font-black uppercase tracking-[0.5em] mb-16 inline-block rotate-[-1deg]">
                    The Collective Story
                 </div>
                 <div className="text-3xl md:text-4xl text-stone-900 leading-[1.5] font-serif whitespace-pre-wrap space-y-12">
                   {loop.narrativeText}
                 </div>
              </div>
            ) : (
              /* Questions/Responses Grid (Verbatim) */
              <div className="space-y-64">
                {groupedResponses.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex flex-col md:flex-row md:items-end gap-6 mb-24 border-b-4 border-black pb-8">
                      <span className="text-[10px] font-black text-stone-300 tracking-[1em] uppercase pb-2">PROMPT_{String(idx+1).padStart(2, '0')}</span>
                      <h3 className="text-5xl md:text-7xl serif font-black text-black leading-[0.9] tracking-tighter uppercase italic">
                        {item.q}
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                      {item.r.map((resp, ridx) => (
                        <div key={ridx} className={`p-12 neo-brutal-static bg-white space-y-8 relative ${ridx % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.5deg] md:translate-y-12'}`}>
                          <div className="flex items-center gap-4">
                            <MemberAvatar member={resp.member} size="sm" />
                            <span className="text-[10px] font-black text-black uppercase tracking-widest">{resp.member.name}</span>
                          </div>
                          <p className="text-2xl md:text-3xl text-stone-900 leading-[1.4] font-medium italic serif tracking-tight">
                            "{resp.text}"
                          </p>
                          <div className="absolute top-4 right-4 text-stone-100 text-5xl font-black select-none pointer-events-none">
                            {ridx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center pt-32 border-t-4 border-black">
               <div className="text-7xl mb-12 sticker animate-spin-slow">🌀</div>
               <p className="text-black font-black uppercase tracking-[1em] text-[10px] mb-8">FIN // VOLUME 01</p>
               <div className="flex justify-center gap-4">
                 {[...Array(5)].map((_, i) => (
                   <div key={i} className="w-3 h-3 bg-black neo-brutal rounded-full" />
                 ))}
               </div>
               <div className="mt-24 text-[8px] font-black uppercase text-stone-400 tracking-[0.5em]">
                 Created with Loopy // AI Curation Engine
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default PublicReaderView;
