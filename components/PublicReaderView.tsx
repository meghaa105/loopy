
import React from 'react';
import { Loop } from '../types';

interface PublicReaderViewProps {
  loop: Loop;
  onBackToApp: () => void;
}

const PublicReaderView: React.FC<PublicReaderViewProps> = ({ loop, onBackToApp }) => {
  const getResponsesByQuestion = () => {
    const map: Record<string, { q: string, r: { name: string, avatar: string, text: string }[] }> = {};
    loop.questions.forEach(q => {
      map[q.id] = { q: q.text, r: [] };
    });
    loop.responses.forEach(r => {
      if (map[r.questionId]) {
        const member = loop.members.find(m => m.id === r.memberId);
        if (member) {
          map[r.questionId].r.push({ name: member.name, avatar: member.avatar, text: r.answer });
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
          &larr; Return to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-white neo-brutal-static overflow-hidden">
          {/* Magazine Cover */}
          <div className="relative h-[650px] border-b-2 border-black">
            {loop.headerImage ? (
              <img src={loop.headerImage} className="w-full h-full object-cover" alt="Header" />
            ) : (
              <div className="w-full h-full bg-violet-100" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-16 left-12 right-12 text-white">
              <div className="flex items-center gap-4 mb-8">
                 <div className="px-3 py-1 bg-yellow-300 text-black font-black text-[10px] uppercase tracking-widest border-2 border-black">
                    Issue 01 // Collective Memory
                 </div>
              </div>
              <h1 className="text-7xl md:text-[9rem] serif font-black leading-[0.8] tracking-tighter mb-8 break-words uppercase">
                {loop.name}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <p className="text-2xl italic serif opacity-90 max-w-sm leading-tight">
                  {loop.lastGeneratedAt ? new Date(loop.lastGeneratedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Curated Just Now'}
                </p>
                <div className="flex -space-x-4 border-2 border-white rounded-full p-1 bg-white/10 backdrop-blur-sm">
                  {loop.members.map(m => (
                    <img key={m.id} src={m.avatar} className="w-12 h-12 rounded-full border-2 border-black bg-stone-100" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-12 md:p-32 space-y-48">
            {/* Intro Editor Note */}
            <div className="max-w-3xl relative">
              <div className="mb-8 px-4 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest inline-block">
                Editor's Letter
              </div>
              <p className="text-4xl md:text-5xl text-stone-900 leading-[1.2] italic serif font-medium first-letter:text-8xl first-letter:font-black first-letter:float-left first-letter:mr-4 first-letter:leading-[0.8] first-letter:text-violet-600">
                {loop.introText || "Every circle has its own gravity. Here's a look at what pulled us together this week."}
              </p>
              <div className="mt-12 w-24 h-1 bg-violet-600" />
            </div>

            {/* Questions/Responses Grid */}
            <div className="space-y-48">
              {groupedResponses.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-start gap-8 mb-20 border-b-2 border-black pb-8">
                    <span className="text-[10px] font-black text-stone-300 pt-4 tracking-[0.5em] uppercase">Q_{String(idx+1).padStart(2, '0')}</span>
                    <h3 className="text-4xl md:text-6xl serif font-black text-black leading-tight max-w-3xl">
                      {item.q}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-32">
                    {item.r.map((resp, ridx) => (
                      <div key={ridx} className={`space-y-8 relative ${ridx % 2 === 0 ? 'md:translate-y-12' : ''}`}>
                        <div className="flex items-center gap-5">
                          <img src={resp.avatar} className="w-16 h-16 rounded-full border-2 border-black neo-brutal-static" />
                          <div>
                            <span className="text-[10px] font-black text-black uppercase tracking-[0.2em]">{resp.name}</span>
                            <div className="h-0.5 w-12 bg-black/20" />
                          </div>
                        </div>
                        <p className="text-2xl md:text-3xl text-stone-800 leading-[1.4] font-medium italic serif tracking-tight">
                          "{resp.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-24 border-t-2 border-black">
               <p className="text-black font-black uppercase tracking-[0.5em] text-xs">Stay Curious. End of Issue.</p>
               <div className="mt-12 flex justify-center gap-2">
                 {[...Array(3)].map((_, i) => (
                   <div key={i} className="w-2 h-2 bg-violet-600 rounded-full" />
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicReaderView;
