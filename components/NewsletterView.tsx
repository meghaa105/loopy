
import React, { useState } from 'react';
import { Loop, Member } from '../types';
import { generateNewsletterIntro, generateHeaderImage } from '../services/geminiService';

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
      const [intro, header] = await Promise.all([
        generateNewsletterIntro(loop.name, loop.responses, loop.members),
        generateHeaderImage(`Newsletter about ${loop.name} ${loop.description}`)
      ]);
      
      onUpdate({
        ...loop,
        introText: intro,
        headerImage: header,
        lastGeneratedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
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
    <div className="max-w-5xl mx-auto pb-20 relative">
      {showPublishSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-full shadow-2xl z-50 animate-bounce flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Delivered! Everyone has been notified via email.
        </div>
      )}

      {showCopySuccess && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-3">
          {showCopySuccess === 'read' ? 'Edition Link' : 'Response Link'} copied to clipboard!
        </div>
      )}

      {isPublishing && publishProgress && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl max-w-sm w-full text-center space-y-8">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-stone-100 rounded-full" />
              <div 
                className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin transition-all" 
                style={{ clipPath: `inset(0 0 0 ${100 - (publishProgress.current/publishProgress.total)*100}%)` }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-stone-900">
                {Math.round((publishProgress.current / publishProgress.total) * 100)}%
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-2">Sending Edition</h3>
              <p className="text-stone-500">Delivering to <span className="text-stone-900 font-bold">{publishProgress.memberName}</span>...</p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col">
          <button onClick={onBack} className="text-stone-400 hover:text-stone-800 flex items-center gap-2 text-sm font-bold mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex gap-4 items-center">
             <h1 className="text-3xl serif font-bold text-stone-900">{loop.name}</h1>
             <span className="text-[10px] uppercase tracking-widest font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
               {loop.frequency} Loop
             </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white shadow-sm border border-stone-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'preview' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
          >
            Digital Edition
          </button>
          <button 
            onClick={() => setViewMode('responses')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'responses' ? 'bg-stone-900 text-white shadow-lg' : 'text-stone-400 hover:text-stone-600'}`}
          >
            Responses ({loop.responses.length})
          </button>
        </div>
      </div>

      {viewMode === 'preview' ? (
        <div className="space-y-8">
          <div className="bg-white shadow-2xl rounded-[4rem] overflow-hidden border border-stone-100">
            <div className="relative h-[550px]">
              {loop.headerImage ? (
                <img src={loop.headerImage} className="w-full h-full object-cover" alt="Header" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center gap-4 group cursor-pointer" onClick={handleGenerate}>
                  <div className="p-8 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">Tap to Generate AI Artwork</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-16 left-16 right-16 text-white">
                <div className="flex items-center gap-4 mb-6">
                   <div className="h-0.5 w-16 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                   <span className="text-xs uppercase tracking-[0.5em] font-black opacity-90">Private Collective Edition</span>
                </div>
                <h1 className="text-7xl serif font-bold mb-8 leading-[1.1]">{loop.name}</h1>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <p className="text-white/70 font-medium tracking-wide">
                      {loop.lastGeneratedAt ? new Date(loop.lastGeneratedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'PENDING CURATION'}
                    </p>
                    <div className="flex -space-x-4">
                      {loop.members.slice(0, 5).map(m => (
                        <img key={m.id} src={m.avatar} className="w-10 h-10 rounded-full border-2 border-stone-900 shadow-xl" title={m.name} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-16 md:p-32">
              <div className="max-w-3xl mb-48 relative">
                <span className="text-amber-500/10 font-serif text-[20rem] absolute -top-40 -left-20 select-none">“</span>
                <p className="text-3xl text-stone-800 leading-[1.6] italic serif relative z-10 first-letter:text-7xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:text-amber-600">
                  {loop.introText || "Once you curate the edition, Gemini will weave everyone's replies into a cohesive introduction."}
                </p>
              </div>

              <div className="space-y-48">
                {groupedResponses.length === 0 ? (
                  <div className="text-center py-32 bg-stone-50/50 rounded-[3rem] border-2 border-dashed border-stone-100 flex flex-col items-center">
                    <p className="text-stone-400 italic text-xl max-w-sm font-serif">No responses collected yet.</p>
                    <button 
                      onClick={() => copyLink('respond')}
                      className="mt-8 text-amber-600 font-bold flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1" />
                      </svg>
                      Copy Response Link
                    </button>
                  </div>
                ) : (
                  groupedResponses.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="text-5xl serif font-bold text-stone-900 mb-20 leading-[1.2] max-w-3xl">
                        {item.q}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-24">
                        {item.r.map((resp, ridx) => (
                          <div key={ridx} className="space-y-8">
                            <div className="flex items-center gap-5">
                              <img src={resp.avatar} className="w-14 h-14 rounded-full ring-8 ring-stone-50" />
                              <span className="text-sm font-black text-stone-900 uppercase tracking-widest">{resp.name}</span>
                            </div>
                            <p className="text-2xl text-stone-600 leading-relaxed font-light serif">
                              {resp.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-60 pt-24 border-t border-stone-100 text-center">
                <div className="flex flex-col items-center gap-10">
                   {!loop.lastGeneratedAt ? (
                      <button 
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-stone-950 text-white px-16 py-6 rounded-full font-black text-xl hover:bg-stone-800 transition-all shadow-xl disabled:opacity-50 flex items-center gap-4"
                      >
                        {isGenerating ? 'AI Curating...' : 'Generate Collation'}
                      </button>
                   ) : (
                      <div className="flex flex-col items-center gap-6">
                        <div className="flex gap-4">
                          <button 
                            onClick={handlePublish}
                            disabled={isPublishing}
                            className="bg-amber-600 text-white px-16 py-5 rounded-full font-black text-xl hover:bg-amber-700 shadow-xl flex items-center gap-4"
                          >
                             {isPublishing ? 'Delivering...' : 'Send to Members'}
                          </button>
                        </div>
                        <div className="flex gap-6">
                          <button 
                            onClick={() => copyLink('read')}
                            className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold"
                          >
                            Copy Reader Link
                          </button>
                          <button 
                            onClick={() => copyLink('respond')}
                            className="flex items-center gap-2 text-stone-400 hover:text-stone-900 font-bold"
                          >
                            Copy Response Link
                          </button>
                        </div>
                      </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-stone-200 shadow-xl overflow-hidden">
          <div className="p-12 bg-stone-50/50 border-b border-stone-100 flex justify-between items-center">
             <h2 className="text-3xl font-bold text-stone-900">Submission Inbox</h2>
             <button onClick={() => copyLink('respond')} className="bg-amber-600 text-white px-6 py-2 rounded-full text-xs font-bold">Copy Link for Members</button>
          </div>
          <div className="p-12 space-y-8">
            {loop.responses.length === 0 ? (
               <div className="text-center py-20 flex flex-col items-center text-stone-300">
                 <p className="text-stone-400 font-serif text-xl">The inbox is currently empty.</p>
               </div>
            ) : (
              loop.responses.map(resp => {
                const member = loop.members.find(m => m.id === resp.memberId);
                const question = loop.questions.find(q => q.id === resp.questionId);
                return (
                  <div key={resp.id} className="p-8 bg-white rounded-3xl border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <img src={member?.avatar} className="w-12 h-12 rounded-full" />
                      <p className="font-bold text-stone-900 text-lg leading-none">{member?.name}</p>
                    </div>
                    <div className="space-y-4">
                       <p className="text-stone-900 font-bold text-xl leading-tight">{question?.text}</p>
                       <p className="text-stone-600 text-lg leading-relaxed bg-stone-50/50 p-6 rounded-2xl font-serif italic">
                         "{resp.answer}"
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
