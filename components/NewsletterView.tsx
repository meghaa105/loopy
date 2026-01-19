
import React, { useState } from 'react';
import { Loop, Member, CollationMode } from '../types.ts';
import { generateNewsletterIntro, generateHeaderImage, generateNarrativeCollation } from '../services/geminiService.ts';
import { MemberAvatar } from './MemberAvatar.tsx';

interface NewsletterViewProps {
  loop: Loop;
  onUpdate: (loop: Loop) => void;
  onBack: () => void;
}

const NewsletterView: React.FC<NewsletterViewProps> = ({ loop, onUpdate, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<{ current: number, total: number, memberName: string } | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'responses'>('preview');
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const [intro, header, narrative] = await Promise.all([
        generateNewsletterIntro(loop.name, loop.responses, loop.members),
        generateHeaderImage(`Newsletter about ${loop.name} ${loop.description}`),
        generateNarrativeCollation(loop.name, loop.questions, loop.responses, loop.members)
      ]);
      
      onUpdate({
        ...loop,
        introText: intro,
        headerImage: header,
        narrativeText: narrative,
        lastGeneratedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModeToggle = (mode: CollationMode) => {
    onUpdate({ ...loop, collationMode: mode });
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const total = loop.members.length;
    
    for (let i = 0; i < total; i++) {
      setPublishProgress({ current: i + 1, total, memberName: loop.members[i].name });
      await new Promise(r => setTimeout(r, 600));
    }
    
    const nextDate = new Date();
    if (loop.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (loop.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    onUpdate({
      ...loop,
      nextSendDate: nextDate.toISOString()
    });

    setIsPublishing(false);
    setPublishProgress(null);
    setShowPublishSuccess(true);
    setTimeout(() => setShowPublishSuccess(false), 5000);
  };

  const copyLink = (mode: 'read' | 'respond') => {
    const url = `${window.location.origin}${window.location.pathname}#/loop/${loop.id}/${mode}`;
    navigator.clipboard.writeText(url);
    setShowCopySuccess(mode);
    setTimeout(() => setShowCopySuccess(null), 3000);
  };

  const getResponsesByQuestion = () => {
    const map: Record<string, { q: string, r: { member: Member, text: string }[] }> = {};
    loop.questions.forEach(q => {
      map[q.id] = { q: q.text, r: [] };
    });
    loop.responses.forEach(r => {
      if (map[r.questionId]) {
        const member = loop.members.find(m => m.id === r.memberId);
        if (member) {
          map[r.questionId].r.push({ 
            member,
            text: r.answer 
          });
        }
      }
    });
    return Object.values(map).filter(item => item.r.length > 0);
  };

  const groupedResponses = getResponsesByQuestion();

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      {showPublishSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 neo-brutal z-50 animate-bounce flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Delivered! Everyone has been notified.
        </div>
      )}

      {showCopySuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 neo-brutal z-50 flex items-center gap-3">
          {showCopySuccess === 'read' ? 'Edition Link' : 'Response Link'} copied!
        </div>
      )}

      {isPublishing && publishProgress && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 neo-brutal-static max-w-sm w-full text-center space-y-8">
            <div className="text-5xl animate-bounce">💌</div>
            <div>
              <h3 className="text-2xl font-black text-black mb-2 uppercase tracking-tight">Mailing out...</h3>
              <p className="text-stone-500 font-bold uppercase text-[10px] tracking-widest">To: {publishProgress.memberName}</p>
            </div>
            <div className="w-full h-4 bg-stone-100 border-2 border-black">
              <div className="h-full bg-yellow-300 transition-all duration-300 border-r-2 border-black" style={{ width: `${(publishProgress.current/publishProgress.total)*100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col">
          <button onClick={onBack} className="text-black hover:underline flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-4 transition-all">
            &larr; Exit to Dashboard
          </button>
          <div className="flex gap-4 items-center">
             <h1 className="text-4xl serif font-black text-black">{loop.name}</h1>
             <span className="text-[10px] uppercase tracking-widest font-black text-white bg-black px-3 py-1">
               {loop.frequency}
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white neo-brutal-static p-1">
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'preview' ? 'bg-black text-white' : 'text-stone-400'}`}
          >
            Digital Edition
          </button>
          <button 
            onClick={() => setViewMode('responses')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'responses' ? 'bg-black text-white' : 'text-stone-400'}`}
          >
            Submissions ({loop.responses.length})
          </button>
        </div>
      </div>

      {viewMode === 'preview' ? (
        <div className="space-y-8">
          <div className="flex justify-center mb-8">
            <div className="bg-white p-2 neo-brutal-static flex gap-2 rotate-[-1deg]">
              <button 
                onClick={() => handleModeToggle('ai')}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${loop.collationMode === 'ai' ? 'bg-violet-400 text-black' : 'text-stone-400'}`}
              >
                ✨ AI Story
              </button>
              <button 
                onClick={() => handleModeToggle('verbatim')}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${loop.collationMode === 'verbatim' ? 'bg-emerald-400 text-black' : 'text-stone-400'}`}
              >
                📝 Verbatim
              </button>
            </div>
          </div>

          <div className="bg-white neo-brutal-static overflow-hidden">
            <div className="relative h-[550px] border-b-2 border-black">
              {loop.headerImage ? (
                <img src={loop.headerImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Header" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center gap-4 group cursor-pointer" onClick={handleGenerate}>
                  <div className="text-7xl group-hover:scale-110 transition-transform sticker">🎨</div>
                  <p className="text-black font-black uppercase tracking-widest text-[10px]">Tap to Curate Issue 01</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-16 left-12 right-12 text-white">
                <div className="flex items-center gap-4 mb-6">
                   <div className="h-0.5 w-16 bg-yellow-300" />
                   <span className="text-[10px] uppercase tracking-[0.4em] font-black">Private Collective // {loop.category}</span>
                </div>
                <h1 className="text-7xl serif font-black mb-8 leading-[0.9] tracking-tighter break-words uppercase">{loop.name}</h1>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                      {loop.lastGeneratedAt ? new Date(loop.lastGeneratedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'PENDING'}
                    </p>
                    <div className="flex -space-x-3">
                      {loop.members.slice(0, 5).map(m => (
                        <MemberAvatar key={m.id} member={m} size="sm" className="ring-2 ring-black" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-12 md:p-24">
              {/* Common Intro Section */}
              <div className="max-w-3xl mb-32 relative">
                <div className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 bg-black text-white px-4 py-1 inline-block rotate-[-1deg]">The Editor's Take</div>
                <p className="text-3xl text-black leading-[1.3] italic serif first-letter:text-8xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-violet-600 first-letter:leading-none">
                  {loop.introText || "Curate the zine to generate a beautiful AI-powered intro."}
                </p>
              </div>

              {loop.collationMode === 'ai' ? (
                <div className="max-w-4xl mx-auto py-12">
                   {loop.narrativeText ? (
                     <div className="text-2xl text-stone-800 leading-relaxed font-serif space-y-12 whitespace-pre-wrap first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-4">
                       {loop.narrativeText}
                     </div>
                   ) : (
                     <div className="text-center py-32 border-4 border-dashed border-stone-200">
                       <p className="text-stone-400 italic font-bold uppercase text-[10px] tracking-widest">Story pending generation...</p>
                       <button onClick={handleGenerate} className="mt-8 bg-yellow-300 px-8 py-4 neo-brutal font-black uppercase text-xs">Summon AI Story &rarr;</button>
                     </div>
                   )}
                </div>
              ) : (
                <div className="space-y-48">
                  {groupedResponses.length === 0 ? (
                    <div className="text-center py-32 bg-stone-50 neo-brutal-static flex flex-col items-center">
                      <div className="text-5xl mb-6 sticker">🌵</div>
                      <p className="text-black font-black uppercase tracking-widest text-xs">No responses found in this loop.</p>
                      <button onClick={() => copyLink('respond')} className="mt-8 bg-emerald-300 px-8 py-4 neo-brutal font-black uppercase text-xs">Request Vibes &rarr;</button>
                    </div>
                  ) : (
                    groupedResponses.map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex items-center gap-6 mb-16 border-b-4 border-black pb-4">
                          <span className="text-[10px] font-black text-stone-300">#{idx+1}</span>
                          <h3 className="text-4xl md:text-5xl serif font-black text-black leading-tight tracking-tighter uppercase">
                            {item.q}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          {item.r.map((resp, ridx) => (
                            <div key={ridx} className={`p-10 neo-brutal-static bg-white space-y-6 ${ridx % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.5deg]'}`}>
                              <div className="flex items-center gap-4">
                                <MemberAvatar member={resp.member} size="sm" />
                                <span className="text-[10px] font-black text-black uppercase tracking-widest">{resp.member.name}</span>
                              </div>
                              <p className="text-xl text-stone-700 leading-relaxed font-serif italic">
                                "{resp.text}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              <div className="mt-60 pt-24 border-t-4 border-black text-center">
                <div className="flex flex-col items-center gap-10">
                   {!loop.lastGeneratedAt ? (
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-black text-white px-16 py-8 neo-brutal font-black text-2xl uppercase tracking-[0.2em] disabled:opacity-50"
                      >
                        {isGenerating ? 'AI BRAINSTORMING...' : 'PUBLISH ZINE &rarr;'}
                      </button>
                   ) : (
                      <div className="flex flex-col items-center gap-8">
                        <div className="flex flex-wrap justify-center gap-6">
                          <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="bg-white text-black px-12 py-5 neo-brutal font-black text-xs uppercase tracking-widest disabled:opacity-50"
                          >
                             {isGenerating ? 'Refreshing...' : '✨ Re-Curate AI'}
                          </button>
                          <button 
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="bg-emerald-400 text-black px-12 py-5 neo-brutal font-black text-xs uppercase tracking-widest"
                          >
                             {isPublishing ? 'Delivering...' : '📤 Send Issue 01'}
                          </button>
                        </div>
                        <div className="flex gap-8">
                          <button onClick={() => copyLink('read')} className="text-[10px] font-black uppercase tracking-widest hover:underline">📋 Reader Link</button>
                          <button onClick={() => copyLink('respond')} className="text-[10px] font-black uppercase tracking-widest hover:underline">📋 Submit Link</button>
                        </div>
                      </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white neo-brutal-static overflow-hidden">
          <div className="p-12 bg-yellow-50 border-b-2 border-black flex justify-between items-center">
             <h2 className="text-3xl serif font-black text-black">Submissions Inbox</h2>
             <button onClick={() => copyLink('respond')} className="bg-black text-white px-6 py-2 neo-brutal text-[10px] font-black uppercase tracking-widest">Share Invite</button>
          </div>
          <div className="p-12 space-y-12">
            {loop.responses.length === 0 ? (
               <div className="text-center py-20 border-2 border-dashed border-stone-200">
                 <p className="text-stone-400 font-black uppercase text-[10px] tracking-widest">Awaiting first submission...</p>
               </div>
            ) : (
              loop.responses.map(resp => {
                const member = loop.members.find(m => m.id === resp.memberId);
                const question = loop.questions.find(q => q.id === resp.questionId);
                return (
                  <div key={resp.id} className="p-10 neo-brutal-static bg-white group hover:translate-x-1 transition-all">
                    <div className="flex items-center gap-4 mb-8">
                      {member && <MemberAvatar member={member} size="sm" />}
                      <p className="font-black text-black uppercase tracking-widest text-[10px]">{member?.name}</p>
                    </div>
                    <div className="space-y-4">
                       <p className="text-black font-black text-xl leading-tight italic">"{question?.text}"</p>
                       <div className="h-0.5 w-12 bg-black/10" />
                       <p className="text-stone-600 text-lg leading-relaxed font-serif">
                         {resp.answer}
                       </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterView;
