
import React, { useState } from 'react';
import { Loop, Question, Member, Frequency } from '../types';
import { suggestQuestions } from '../services/geminiService';

interface LoopEditorProps {
  loop?: Loop;
  onSave: (loop: Loop) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES = [
  { id: 'family', label: 'Family', icon: '🏠', color: 'amber' },
  { id: 'friends', label: 'Friends', icon: '🥂', color: 'indigo' },
  { id: 'work', label: 'Work', icon: '💼', color: 'emerald' },
  { id: 'other', label: 'Other', icon: '✨', color: 'stone' },
] as const;

const LoopEditor: React.FC<LoopEditorProps> = ({ loop, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState(loop?.name || '');
  const [description, setDescription] = useState(loop?.description || '');
  const [category, setCategory] = useState<Loop['category']>(loop?.category || 'family');
  const [frequency, setFrequency] = useState<Frequency>(loop?.frequency || 'monthly');
  const [questions, setQuestions] = useState<Question[]>(loop?.questions || []);
  const [members, setMembers] = useState<Member[]>(loop?.members || []);
  
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions([...questions, { id: Date.now().toString(), text: newQuestionText }]);
    setNewQuestionText('');
  };

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;
    const newMember: Member = {
      id: Date.now().toString(),
      name: newMemberName,
      email: newMemberEmail,
      avatar: `https://i.pravatar.cc/150?u=${newMemberEmail}`
    };
    setMembers([...members, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleAISuggest = async () => {
    setIsSuggesting(true);
    try {
      const suggestions = await suggestQuestions(category, description, questions.map(q => q.text));
      const newQuestions = suggestions.map(s => ({ id: Math.random().toString(36), text: s }));
      setQuestions([...questions, ...newQuestions]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result: Loop = {
      id: loop?.id || Date.now().toString(),
      name,
      description,
      category,
      frequency,
      questions,
      members,
      responses: loop?.responses || [],
      lastGeneratedAt: loop?.lastGeneratedAt,
      headerImage: loop?.headerImage,
      introText: loop?.introText,
      nextSendDate: loop?.nextSendDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    onSave(result);
  };

  return (
    <div className="max-w-5xl mx-auto mb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <button 
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-800 flex items-center gap-2 text-sm font-bold mb-3 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancel and Return
          </button>
          <h2 className="text-4xl md:text-5xl serif font-bold text-stone-900">{loop ? 'Refine your Loop' : 'Start a New Loop'}</h2>
        </div>
        {loop && onDelete && (
          <button 
            onClick={() => { if(confirm('Are you sure? This will delete all history for this loop.')) onDelete(loop.id) }}
            className="text-red-400 text-xs font-black uppercase tracking-widest hover:text-red-600 transition-colors border-b border-transparent hover:border-red-600 pb-0.5"
          >
            Delete Forever
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Configuration */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Section: Identity */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
            <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-stone-300">Identity & Purpose</h3>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-stone-800 uppercase tracking-widest px-1">Loop Name</label>
                <input 
                  required
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full text-3xl md:text-4xl serif bg-white border-2 border-stone-100 rounded-3xl px-8 py-5 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all placeholder:text-stone-200 text-stone-900 shadow-sm"
                  placeholder="e.g., The Midnight Society"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-stone-800 uppercase tracking-widest px-1">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all ${
                        category === cat.id 
                        ? 'bg-stone-900 border-stone-900 text-white shadow-xl scale-105' 
                        : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-3xl">{cat.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-stone-800 uppercase tracking-widest px-1">Group Description</label>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full text-lg serif bg-white p-8 rounded-[2rem] border-2 border-stone-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all min-h-[140px] text-stone-900 shadow-sm placeholder:text-stone-300"
                    placeholder="Tell Scribe what brings this group together. It helps the AI write better introductions."
                />
              </div>
            </div>
          </div>

          {/* Section: Delivery */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
            <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-stone-300">Rhythm & Timing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-5">
                 <label className="text-xs font-black text-stone-800 uppercase tracking-widest px-1">Delivery Frequency</label>
                 <div className="space-y-3">
                   {(['weekly', 'biweekly', 'monthly'] as Frequency[]).map(freq => (
                     <button
                       key={freq}
                       type="button"
                       onClick={() => setFrequency(freq)}
                       className={`w-full p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between ${
                         frequency === freq 
                         ? 'border-amber-500 bg-amber-50/30 text-amber-900 font-bold shadow-sm' 
                         : 'border-stone-100 bg-white text-stone-500 hover:border-stone-200'
                       }`}
                     >
                       <span className="capitalize text-sm tracking-wide">{freq}</span>
                       {frequency === freq && <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="p-10 bg-stone-50/50 rounded-[2.5rem] flex flex-col items-center justify-center text-center border border-stone-100">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-stone-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-2">Next Scheduled Delivery</p>
                  <p className="text-stone-900 font-bold serif text-2xl tracking-tight">Next Monday</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Members & Questions */}
        <div className="lg:col-span-5 space-y-12">
          
          {/* Section: People */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-stone-300">The Circle ({members.length})</h3>
            </div>

            <div className="space-y-6">
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                {members.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-stone-300 font-bold uppercase tracking-widest italic">No members added yet</p>
                  </div>
                ) : (
                  members.map(member => (
                    <div key={member.id} className="flex items-center gap-4 p-4 bg-stone-50/80 rounded-[1.5rem] group transition-all hover:bg-stone-100/80 border border-stone-100">
                      <img src={member.avatar} className="w-11 h-11 rounded-full grayscale group-hover:grayscale-0 transition-all border-2 border-white shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-900 truncate tracking-tight">{member.name}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-wider truncate">{member.email}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-stone-300 hover:text-red-500 transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-8 border-t border-stone-100 space-y-4">
                <div className="space-y-3">
                  <input 
                    type="text" 
                    value={newMemberName}
                    onChange={e => setNewMemberName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-stone-100 focus:border-stone-900 focus:ring-0 outline-none text-sm font-medium text-stone-900 shadow-sm placeholder:text-stone-300"
                    placeholder="New Member Name"
                  />
                  <div className="flex gap-3">
                    <input 
                      type="email" 
                      value={newMemberEmail}
                      onChange={e => setNewMemberEmail(e.target.value)}
                      className="flex-1 px-6 py-4 rounded-2xl bg-white border-2 border-stone-100 focus:border-stone-900 focus:ring-0 outline-none text-sm font-medium text-stone-900 shadow-sm placeholder:text-stone-300"
                      placeholder="Email Address"
                    />
                    <button 
                      type="button"
                      onClick={handleAddMember}
                      className="bg-stone-900 text-white px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Discussion */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-100 space-y-10">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-stone-300">Newsletter Prompts</h3>
              <button 
                type="button"
                onClick={handleAISuggest}
                disabled={isSuggesting}
                className="text-amber-600 text-[9px] font-black uppercase tracking-widest hover:text-amber-700 disabled:opacity-50 flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full transition-all border border-amber-100/50 hover:shadow-sm"
              >
                {isSuggesting ? 'Thinking...' : '✨ AI Suggest'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                {questions.length === 0 ? (
                  <div className="text-center py-10 bg-stone-50/50 rounded-[2rem] border border-dashed border-stone-200">
                    <p className="text-stone-400 font-serif italic text-sm">Add some questions to spark conversation.</p>
                  </div>
                ) : (
                  questions.map((q, idx) => (
                    <div key={q.id} className="group relative flex gap-5 bg-white p-6 rounded-[1.75rem] border-2 border-stone-50 hover:border-amber-100 hover:shadow-md transition-all">
                      <span className="text-[10px] font-black text-amber-500 pt-1 opacity-40">{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-stone-800 font-medium leading-relaxed flex-1">{q.text}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="text-stone-200 hover:text-red-500 transition-all pt-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="relative pt-6 border-t border-stone-100">
                <input 
                  type="text" 
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  className="w-full pl-8 pr-20 py-5 rounded-[2rem] bg-white border-2 border-stone-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all text-sm font-medium text-stone-900 shadow-sm placeholder:text-stone-300"
                  placeholder="Ask something meaningful..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                />
                <button 
                  type="button"
                  onClick={handleAddQuestion}
                  className="absolute right-4 top-[calc(1.5rem+6px)] text-amber-500 hover:text-amber-600 font-black p-2 transition-transform hover:scale-110 active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button - Floating */}
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6">
          <button 
            type="submit"
            className="w-full bg-stone-900 text-white py-6 rounded-full font-black text-xl hover:bg-stone-800 transition-all shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            Save Loop Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoopEditor;
