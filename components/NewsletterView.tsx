
import React, { useState } from 'react';
import { Loop, Member, CollationMode, Edition } from '../types';
import { generateNewsletterIntro, generateHeaderImage, generateNarrativeCollation } from '../services/geminiService';
import { MemberAvatar } from './MemberAvatar';

interface NewsletterViewProps {
  loop: Loop;
  onUpdate: (loop: Loop) => void;
  onBack: () => void;
}

const NewsletterView: React.FC<NewsletterViewProps> = ({ loop, onUpdate, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState<{ current: number, total: number, memberName: string } | null>(null);
  const [viewMode, setViewMode] = useState<'preview' | 'responses' | 'share' | 'archives'>('preview');
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState<string | null>(null);
  const [selectedArchiveEdition, setSelectedArchiveEdition] = useState<Edition | null>(null);

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
        introText: intro || "Curate the zine to generate a beautiful AI-powered intro.",
        headerImage: header || 'https://via.placeholder.com/1200x400?text=Newsletter+Header',
        narrativeText: narrative || "No narrative generated. Add responses to the questions.",
        lastGeneratedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Generation failed:", e);
      alert("Failed to generate content. Please check your API key and try again.");
      // Still set a timestamp so user can proceed
      onUpdate({
        ...loop,
        introText: "Curate the zine to generate a beautiful AI-powered intro.",
        headerImage: 'https://via.placeholder.com/1200x400?text=Newsletter+Header',
        narrativeText: "Generation failed. Please ensure members have submitted responses.",
        lastGeneratedAt: new Date().toISOString()
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModeToggle = (mode: CollationMode) => {
    onUpdate({ ...loop, collationMode: mode });
  };

  const handlePublish = async () => {
    if (!loop.lastGeneratedAt) {
        alert("Curate your issue before publishing!");
        return;
    }

    setIsPublishing(true);
    const total = loop.members.length;
    
    for (let i = 0; i < total; i++) {
      setPublishProgress({ current: i + 1, total, memberName: loop.members[i].name });
      await new Promise(r => setTimeout(r, 600));
    }

    // Create Edition Snapshot
    const newEdition: Edition = {
        id: Math.random().toString(36).substring(2, 11),
        publishDate: new Date().toISOString(),
        headerImage: loop.headerImage,
        introText: loop.introText,
        narrativeText: loop.narrativeText,
        responses: [...loop.responses],
        collationMode: loop.collationMode,
        issueNumber: (loop.editions?.length || 0) + 1
    };
    
    const nextDate = new Date();
    if (loop.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else if (loop.frequency === 'biweekly') nextDate.setDate(nextDate.getDate() + 14);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    onUpdate({
      ...loop,
      editions: [newEdition, ...(loop.editions || [])],
      responses: [], // Clear responses for next cycle
      introText: undefined, // Reset draft
      headerImage: undefined,
      narrativeText: undefined,
      lastGeneratedAt: undefined,
      nextSendDate: nextDate.toISOString()
    });

    setIsPublishing(false);
    setPublishProgress(null);
    setShowPublishSuccess(true);
    setTimeout(() => setShowPublishSuccess(false), 5000);
    setViewMode('archives');
  };

  const copyLink = (mode: 'read' | 'respond') => {
    const url = `${window.location.origin}${window.location.pathname}#/loop/${loop.id}/${mode}`;
    navigator.clipboard.writeText(url);
    setShowCopySuccess(mode);
    setTimeout(() => setShowCopySuccess(null), 3000);
  };

  const openSample = (mode: 'read' | 'respond') => {
    window.location.hash = `#/loop/${loop.id}/${mode}`;
  };

  const getResponsesByQuestion = (responses: typeof loop.responses) => {
    const map: Record<string, { q: string, r: { member: Member, text: string }[] }> = {};
    loop.questions.forEach(q => {
      map[q.id] = { q: q.text, r: [] };
    });
    responses.forEach(r => {
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

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      {showPublishSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 neo-brutal z-[100] animate-bounce flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Issue Archived & Delivered!
        </div>
      )}

      {showCopySuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 neo-brutal z-50 flex items-center gap-3">
          {showCopySuccess === 'read' ? 'Reader Link' : 'Submit Link'} copied!
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
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white neo-brutal-static p-1 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${viewMode === 'preview' ? 'bg-black text-white' : 'text-stone-400 hover:text-black'}`}
          >
            Draft
          </button>
          <button 
            onClick={() => setViewMode('responses')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${viewMode === 'responses' ? 'bg-black text-white' : 'text-stone-400 hover:text-black'}`}
          >
            Submissions ({loop.responses.length})
          </button>
          <button 
            onClick={() => setViewMode('archives')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${viewMode === 'archives' ? 'bg-black text-white' : 'text-stone-400 hover:text-black'}`}
          >
            Archives ({loop.editions?.length || 0})
          </button>
          <button 
            onClick={() => setViewMode('share')}
            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${viewMode === 'share' ? 'bg-black text-white' : 'text-stone-400 hover:text-black'}`}
          >
            Invite
          </button>
        </div>
      </div>

      {viewMode === 'preview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
           {/* Current Draft UI (Existing code remains same) */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-2 neo-brutal-static flex gap-2 rotate-[-1deg]">
              <button 
                onClick={() => handleModeToggle('ai')}
                disabled={isGenerating}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-50 ${loop.collationMode === 'ai' ? 'bg-violet-400 text-black' : 'text-stone-400 hover:text-black'}`}
              >
                ✨ AI Story
              </button>
              <button 
                onClick={() => handleModeToggle('verbatim')}
                disabled={isGenerating}
                className={`px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 disabled:opacity-50 ${loop.collationMode === 'verbatim' ? 'bg-emerald-400 text-black' : 'text-stone-400 hover:text-black'}`}
              >
                📝 Verbatim
              </button>
            </div>
          </div>

          <div className="bg-white neo-brutal-static overflow-hidden">
            <div className="relative h-[550px] border-b-2 border-black">
              {loop.headerImage ? (
                <img src={loop.headerImage} className="w-full h-full object-cover grayscale" alt="Header" />
              ) : (
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full h-full bg-stone-100 hover:bg-stone-200 disabled:opacity-50 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer"
                >
                  <div className="text-7xl transition-transform">{isGenerating ? '⏳' : '🎨'}</div>
                  <p className="text-black font-black uppercase tracking-widest text-[10px]">{isGenerating ? 'Generating...' : 'Tap to Curate Next Issue'}</p>
                </button>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-16 left-12 right-12 text-white">
                <h1 className="text-7xl serif font-black mb-8 leading-[0.9] tracking-tighter break-words uppercase">{loop.name}</h1>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                   Issue Draft: {loop.lastGeneratedAt ? 'READY TO SEND' : 'PENDING CURATION'}
                </p>
              </div>
            </div>

            <div className="p-12 md:p-24">
              <div className="max-w-3xl mb-32 relative">
                <p className="text-3xl text-black leading-[1.3] italic serif first-letter:text-8xl first-letter:font-black first-letter:mr-4 first-letter:float-left first-letter:text-violet-600 first-letter:leading-none">
                  {loop.introText || "Curate the zine to generate a beautiful AI-powered intro."}
                </p>
              </div>

              {loop.collationMode === 'ai' ? (
                <div className="max-w-4xl mx-auto py-12">
                   {loop.narrativeText ? (
                     <div className="text-2xl text-stone-800 leading-relaxed font-serif space-y-12 whitespace-pre-wrap">
                       {loop.narrativeText}
                     </div>
                   ) : (
                     <div className="text-center py-32 border-4 border-dashed border-stone-200">
                       <button onClick={handleGenerate} className="bg-yellow-300 px-8 py-4 neo-brutal font-black uppercase text-xs">Summon AI Story &rarr;</button>
                     </div>
                   )}
                </div>
              ) : (
                <div className="space-y-48">
                    {getResponsesByQuestion(loop.responses).map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-4xl serif font-black text-black mb-12 uppercase">{item.q}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          {item.r.map((resp, ridx) => (
                            <div key={ridx} className="p-10 neo-brutal-static bg-white space-y-6">
                              <MemberAvatar member={resp.member} size="sm" />
                              <p className="text-xl text-stone-700 font-serif italic">"{resp.text}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="mt-60 pt-24 border-t-4 border-black text-center">
                 <button 
                    onClick={handlePublish}
                    disabled={isPublishing || !loop.lastGeneratedAt}
                    className="bg-emerald-400 text-black px-16 py-8 neo-brutal font-black text-2xl uppercase tracking-[0.2em] disabled:opacity-50"
                  >
                    {isPublishing ? 'SENDING...' : 'Send & Archive'}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'responses' && (
        <div className="bg-white neo-brutal-static animate-in slide-in-from-right-4 duration-300 p-12">
           <h2 className="text-4xl serif font-black mb-12">Submission Box</h2>
           <div className="space-y-8">
             {loop.responses.length === 0 ? (
               <p className="text-stone-400 font-black uppercase text-[10px] tracking-widest text-center py-20">No new submissions since last issue.</p>
             ) : (
               loop.responses.map(resp => (
                 <div key={resp.id} className="p-8 neo-brutal-static bg-stone-50">
                    <div className="flex items-center gap-4 mb-4">
                       <MemberAvatar member={loop.members.find(m => m.id === resp.memberId)!} size="xs" />
                       <span className="font-black text-[10px]">{loop.members.find(m => m.id === resp.memberId)?.name}</span>
                    </div>
                    <p className="text-stone-600 font-serif">"{resp.answer}"</p>
                 </div>
               ))
             )}
           </div>
        </div>
      )}

      {viewMode === 'archives' && (
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
           <h2 className="text-4xl serif font-black text-black mb-12">The Vault</h2>
           {!loop.editions || loop.editions.length === 0 ? (
             <div className="p-20 bg-white neo-brutal-static text-center">
               <p className="text-stone-400 font-black uppercase text-sm tracking-widest">Your library is empty. Publish your first issue!</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {loop.editions.map((edition) => (
                 <div key={edition.id} className="bg-white neo-brutal-static group hover:rotate-1 transition-transform">
                   <div className="h-40 border-b-2 border-black relative">
                     {edition.headerImage && <img src={edition.headerImage} className="w-full h-full object-cover grayscale" />}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <span className="text-white font-black text-4xl serif">#{edition.issueNumber}</span>
                     </div>
                   </div>
                   <div className="p-6">
                     <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">
                       {new Date(edition.publishDate).toLocaleDateString()}
                     </p>
                     <h4 className="text-xl serif font-black mb-6 line-clamp-1">{edition.introText?.slice(0, 50)}...</h4>
                     <button 
                        onClick={() => setSelectedArchiveEdition(edition)}
                        className="w-full py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest neo-brutal"
                     >
                       Read Edition
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}

           {selectedArchiveEdition && (
             <div className="fixed inset-0 z-[110] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-6 md:p-20 overflow-y-auto">
               <div className="bg-white max-w-4xl w-full neo-brutal-static animate-in zoom-in-95 duration-300">
                 <div className="p-8 border-b-2 border-black flex justify-between items-center bg-yellow-50">
                    <span className="font-black text-xl serif">Issue #{selectedArchiveEdition.issueNumber}</span>
                    <button onClick={() => setSelectedArchiveEdition(null)} className="text-4xl font-black">&times;</button>
                 </div>
                 <div className="p-12 max-h-[70vh] overflow-y-auto space-y-12 scrollbar-hide">
                    <img src={selectedArchiveEdition.headerImage} className="w-full h-64 object-cover neo-brutal" />
                    <p className="text-2xl font-serif italic leading-relaxed">{selectedArchiveEdition.introText}</p>
                    <div className="h-0.5 w-full bg-stone-100" />
                    {selectedArchiveEdition.collationMode === 'ai' ? (
                      <p className="text-lg font-serif whitespace-pre-wrap">{selectedArchiveEdition.narrativeText}</p>
                    ) : (
                      <div className="space-y-12">
                        {getResponsesByQuestion(selectedArchiveEdition.responses).map((item, i) => (
                          <div key={i}>
                            <h5 className="font-black uppercase text-xs mb-6 underline">{item.q}</h5>
                            <div className="space-y-4">
                              {item.r.map((r, ri) => (
                                <p key={ri} className="italic font-serif">"{r.text}" — {r.member.name}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
                 <div className="p-8 border-t-2 border-black bg-stone-50 flex justify-end">
                    <button onClick={() => setSelectedArchiveEdition(null)} className="px-8 py-3 bg-black text-white font-black uppercase text-[10px] neo-brutal">Close Archive</button>
                 </div>
               </div>
             </div>
           )}
        </div>
      )}

      {viewMode === 'share' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in zoom-in-95 duration-300">
          <div className="bg-white p-12 neo-brutal-static space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-3xl sticker">🎭</span>
              <h3 className="text-4xl serif font-black text-black leading-tight">Zine Reader</h3>
              <p className="text-stone-600 text-sm font-medium leading-relaxed">Share this after publishing. It always shows the latest issue.</p>
            </div>
            <div className="space-y-4 pt-8 border-t-2 border-stone-100">
              <button onClick={() => openSample('read')} className="w-full bg-violet-300 text-black py-4 neo-brutal font-black text-xs uppercase tracking-widest">View Live &rarr;</button>
              <button onClick={() => copyLink('read')} className="w-full bg-white text-black py-4 neo-brutal font-black text-xs uppercase tracking-widest">Copy Link</button>
            </div>
          </div>

          <div className="bg-white p-12 neo-brutal-static space-y-8 flex flex-col justify-between">
            <div className="space-y-6">
              <span className="text-3xl sticker">🎙️</span>
              <h3 className="text-4xl serif font-black text-black leading-tight">Entry Form</h3>
              <p className="text-stone-600 text-sm font-medium leading-relaxed">Send this to the circle to collect their responses.</p>
            </div>
            <div className="space-y-4 pt-8 border-t-2 border-stone-100">
              <button onClick={() => openSample('respond')} className="w-full bg-emerald-300 text-black py-4 neo-brutal font-black text-xs uppercase tracking-widest">Open Form &rarr;</button>
              <button onClick={() => copyLink('respond')} className="w-full bg-white text-black py-4 neo-brutal font-black text-xs uppercase tracking-widest">Copy Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterView;