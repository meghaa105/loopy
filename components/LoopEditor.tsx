
import React, { useState, useRef } from 'react';
import { Loop, Question, Member, Frequency, CollationMode } from '../types';
import { suggestQuestions } from '../services/geminiService';
import { MemberAvatar } from './MemberAvatar.tsx';

interface LoopEditorProps {
  loop?: Loop;
  onSave: (loop: Loop) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

const CATEGORIES = [
  { id: 'family', label: 'Family', icon: '🏠' },
  { id: 'friends', label: 'Friends', icon: '🥂' },
  { id: 'work', label: 'Work', icon: '💼' },
  { id: 'other', label: 'Other', icon: '✨' },
] as const;

const LoopEditor: React.FC<LoopEditorProps> = ({ loop, onSave, onCancel, onDelete }) => {
  const [name, setName] = useState(loop?.name || '');
  const [description, setDescription] = useState(loop?.description || '');
  const [category, setCategory] = useState<Loop['category']>(loop?.category || 'family');
  const [frequency, setFrequency] = useState<Frequency>(loop?.frequency || 'monthly');
  const [questions, setQuestions] = useState<Question[]>(loop?.questions || []);
  const [members, setMembers] = useState<Member[]>(loop?.members || []);
  const [collationMode] = useState<CollationMode>(loop?.collationMode || 'verbatim');
  
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const memberListRef = useRef<HTMLDivElement>(null);

  // Core logic to add a member from the current input state
  const tryAddMember = () => {
    const trimmedName = newMemberName.trim();
    const trimmedEmail = newMemberEmail.trim();

    if (!trimmedName || !trimmedEmail) return false;
    
    // Check for potential duplicate emails
    if (members.some(m => m.email.toLowerCase() === trimmedEmail.toLowerCase())) {
        alert("This person is already in your circle!");
        return false;
    }

    const newMember: Member = {
      id: Math.random().toString(36).substring(2, 11),
      name: trimmedName,
      email: trimmedEmail,
      avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(trimmedEmail)}`
    };
    
    setMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberEmail('');
    
    // Smooth scroll to the new member
    setTimeout(() => {
      if (memberListRef.current) {
        memberListRef.current.scrollTop = memberListRef.current.scrollHeight;
      }
    }, 100);

    return true;
  };

  const handleMemberKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      tryAddMember();
    }
  };

  const handleAddMemberClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    tryAddMember();
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions([...questions, { id: Math.random().toString(36).substring(2, 11), text: newQuestionText.trim() }]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleAISuggest = async () => {
    setIsSuggesting(true);
    try {
      const suggestions = await suggestQuestions(category, description, questions.map(q => q.text));
      const newQuestions = suggestions.map(s => ({ id: Math.random().toString(36).substring(2, 11), text: s }));
      setQuestions([...questions, ...newQuestions]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // UX Enhancement: If there's pending text in the member fields, add it automatically
    let currentMembers = [...members];
    const trimmedName = newMemberName.trim();
    const trimmedEmail = newMemberEmail.trim();
    
    if (trimmedName && trimmedEmail) {
      if (!members.some(m => m.email.toLowerCase() === trimmedEmail.toLowerCase())) {
        const autoMember: Member = {
          id: Math.random().toString(36).substring(2, 11),
          name: trimmedName,
          email: trimmedEmail,
          avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(trimmedEmail)}`
        };
        currentMembers.push(autoMember);
      }
    }

    if (currentMembers.length === 0) {
        alert("You need at least one person in your circle!");
        return;
    }

    // Fixed: Added missing 'editions' property to satisfy the Loop interface requirement.
    const result: Loop = {
      id: loop?.id || Math.random().toString(36).substring(2, 11),
      name,
      description,
      category,
      frequency,
      questions,
      members: currentMembers,
      responses: loop?.responses || [],
      editions: loop?.editions || [],
      collationMode,
      lastGeneratedAt: loop?.lastGeneratedAt,
      headerImage: loop?.headerImage,
      introText: loop?.introText,
      narrativeText: loop?.narrativeText,
      nextSendDate: loop?.nextSendDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    onSave(result);
  };

  return (
    <div className="max-w-6xl mx-auto mb-32 px-4 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <button 
            type="button"
            onClick={onCancel}
            className="bg-black text-white px-5 py-2 neo-brutal text-[10px] font-black uppercase tracking-widest mb-6"
          >
            &larr; Abort
          </button>
          <h2 className="text-6xl serif font-black text-black leading-none">{loop ? 'Edit Zine' : 'Start Zine'}</h2>
        </div>
        <div className="flex items-center gap-4">
          {loop && onDelete && (
            <button 
              type="button"
              onClick={() => { if(confirm('Nuke everything?')) onDelete(loop.id) }}
              className="text-red-600 text-xs font-black uppercase tracking-[0.3em] hover:bg-red-50 px-4 py-2 border-2 border-black transition-all"
            >
              Nuke Loop
            </button>
          )}
          <div className="bg-white px-4 py-2 neo-brutal rotate-3 flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-black">Coded by</span>
            <span className="text-xs font-black text-violet-600 serif italic">Megha</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-12">
          
          <div className="bg-white p-12 neo-brutal-static space-y-10">
            <h3 className="text-xs uppercase tracking-[0.4em] font-black text-stone-300">Identity</h3>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">Name your Loop</label>
                <input 
                  required
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full text-4xl serif font-black bg-yellow-50 px-6 py-5 neo-brutal outline-none placeholder:text-stone-300 text-black focus:bg-yellow-100 transition-colors"
                  placeholder="The Group Chat"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">Vibe check</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`flex flex-col items-center gap-3 p-6 neo-brutal transition-all ${
                        category === cat.id 
                        ? 'bg-black text-white scale-105' 
                        : 'bg-white text-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-3xl sticker">{cat.icon}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-black uppercase tracking-widest">Manifesto</label>
                <textarea 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full text-lg serif italic font-medium bg-emerald-50/50 p-8 neo-brutal outline-none min-h-[160px] text-black shadow-none placeholder:text-stone-300 focus:bg-emerald-50 transition-colors"
                    placeholder="Describe the energy of this group..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-12 neo-brutal-static space-y-10">
            <h3 className="text-xs uppercase tracking-[0.4em] font-black text-stone-300">Delivery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-black uppercase tracking-widest">Beat</label>
                 <div className="space-y-3">
                   {(['weekly', 'biweekly', 'monthly'] as Frequency[]).map(freq => (
                     <button
                       key={freq}
                       type="button"
                       onClick={() => setFrequency(freq)}
                       className={`w-full p-5 text-left neo-brutal font-black uppercase tracking-widest text-xs transition-all ${
                         frequency === freq 
                         ? 'bg-violet-300 text-black' 
                         : 'bg-white text-stone-400'
                       }`}
                     >
                       {freq}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="p-10 bg-black text-white neo-brutal-static flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4 sticker">⏳</div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Next Drop</p>
                  <p className="text-yellow-300 font-black serif text-2xl uppercase tracking-tighter">Mon, Morning</p>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-12">
          
          <div className="bg-white p-12 neo-brutal-static space-y-10">
            <h3 className="text-xs uppercase tracking-[0.4em] font-black text-stone-300">The Circle ({members.length})</h3>
            <div className="space-y-6">
              <div 
                ref={memberListRef}
                className="max-h-[350px] overflow-y-auto pr-2 space-y-4 scrollbar-hide smooth-scroll"
              >
                {members.length === 0 ? (
                  <div className="p-10 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">No members yet. Add the squad below.</p>
                  </div>
                ) : (
                  members.map(member => (
                    <div 
                      key={member.id} 
                      className="flex items-center gap-4 p-4 neo-brutal bg-violet-50 group hover:bg-white transition-all animate-in zoom-in-95 duration-200"
                    >
                      <MemberAvatar member={member} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-black uppercase tracking-tighter truncate">{member.name}</p>
                        <p className="text-[9px] text-stone-400 font-bold lowercase truncate">{member.email}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-red-500 hover:scale-125 transition-all text-xl font-black"
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-8 border-t-2 border-black space-y-4">
                <input 
                  type="text" 
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  onKeyDown={handleMemberKeyPress}
                  className="w-full px-6 py-4 neo-brutal text-sm font-black uppercase tracking-widest outline-none placeholder:text-stone-300 focus:bg-stone-50"
                  placeholder="MEMBER NAME"
                />
                <div className="flex gap-4">
                  <input 
                    type="email" 
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    onKeyDown={handleMemberKeyPress}
                    className="flex-1 px-6 py-4 neo-brutal text-sm font-black outline-none placeholder:text-stone-300 focus:bg-stone-50"
                    placeholder="EMAIL ADDRESS"
                  />
                  <button 
                    type="button"
                    onClick={handleAddMemberClick}
                    className="bg-black text-white px-8 neo-brutal text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-colors"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-12 neo-brutal-static space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase tracking-[0.4em] font-black text-stone-300">Prompts</h3>
              <button 
                type="button"
                onClick={handleAISuggest}
                disabled={isSuggesting}
                className="bg-yellow-300 text-black px-4 py-2 neo-brutal text-[8px] font-black uppercase tracking-widest disabled:opacity-50"
              >
                {isSuggesting ? 'Brainstorming...' : '✨ Gemini'}
              </button>
            </div>

            <div className="space-y-6">
              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                {questions.map((q, idx) => (
                  <div key={q.id} className="group flex gap-5 bg-stone-50 p-6 neo-brutal-static border-2 border-black hover:bg-white transition-colors">
                    <span className="text-[10px] font-black text-violet-400">/{idx+1}</span>
                    <span className="text-sm text-black font-bold italic leading-snug flex-1">{q.text}</span>
                    <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="text-red-500 font-black text-xl hover:scale-125 transition-transform">&times;</button>
                  </div>
                ))}
              </div>

              <div className="relative pt-8 border-t-2 border-black">
                <input 
                  type="text" 
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  className="w-full pl-8 pr-16 py-5 neo-brutal text-sm font-bold italic bg-yellow-50 outline-none focus:bg-yellow-100"
                  placeholder="ASK THE ROOM..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddQuestion())}
                />
                <button 
                  type="button"
                  onClick={handleAddQuestion}
                  className="absolute right-4 top-[calc(2rem+10px)] text-black font-black p-2 hover:scale-125 transition-transform"
                >
                  &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-6">
          <button 
            type="submit"
            className="w-full bg-black text-white py-8 neo-brutal font-black text-2xl uppercase tracking-[0.2em] group shadow-2xl hover:bg-stone-900 transition-colors"
          >
            <span className="group-hover:tracking-[0.4em] transition-all">Save Zine &rarr;</span>
          </button>
        </div>
      </form>

      <style>{`
        .smooth-scroll {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default LoopEditor;