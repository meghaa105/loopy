
import React, { useState } from 'react';
import { Loop, Member, Response } from '../types';

interface PublicRespondViewProps {
  loop: Loop;
  onSubmit: (response: Response) => void;
  onBackToApp: () => void;
}

const PublicRespondView: React.FC<PublicRespondViewProps> = ({ loop, onSubmit, onBackToApp }) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerChange = (qId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleFinalSubmit = () => {
    if (!selectedMemberId) return;

    Object.entries(answers).forEach(([qId, text]) => {
      const answerText = text as string;
      if (answerText.trim()) {
        onSubmit({
          id: Math.random().toString(36),
          memberId: selectedMemberId,
          questionId: qId,
          answer: answerText
        });
      }
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-violet-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-16 neo-brutal-static text-center rotate-1">
          <div className="text-7xl mb-10 sticker">✨</div>
          <h2 className="text-4xl serif font-black text-black mb-4">You're in the Zine!</h2>
          <p className="text-stone-600 font-bold mb-10 leading-relaxed uppercase tracking-tighter text-sm">Your vibes have been added to {loop.name}. Check your inbox soon.</p>
          <button 
            onClick={onBackToApp} 
            className="w-full bg-black text-white py-5 neo-brutal font-black uppercase tracking-widest text-xs"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-20 text-center">
          <div className="text-5xl serif font-black text-black mb-4 tracking-tighter uppercase italic">Scribe Submission</div>
          <div className="h-1 w-32 bg-black mx-auto" />
        </div>

        <div className="bg-white neo-brutal-static p-10 md:p-20">
          <h1 className="text-5xl serif font-black text-black mb-6 leading-[0.9]">What's the <br /><span className="text-violet-600 italic">frequency</span>?</h1>
          <p className="text-stone-500 font-bold mb-16 uppercase tracking-widest text-[10px]">Collective: {loop.name}</p>

          <div className="space-y-16">
            <section className="space-y-4">
              <label className="text-xs font-black uppercase tracking-[0.3em] text-black">Member ID</label>
              <select 
                value={selectedMemberId}
                onChange={e => setSelectedMemberId(e.target.value)}
                className="w-full p-6 text-xl font-black neo-brutal bg-white outline-none cursor-pointer hover:bg-stone-50 transition-colors"
              >
                <option value="">WHO ARE YOU?</option>
                {loop.members.map(m => (
                  <option key={m.id} value={m.id}>{m.name.toUpperCase()}</option>
                ))}
              </select>
            </section>

            {loop.questions.map((q, idx) => (
              <section key={q.id} className="space-y-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-start gap-4">
                  <span className="text-xs font-black text-violet-400 pt-1">/{idx+1}</span>
                  <label className="text-3xl serif font-black text-black leading-tight">{q.text}</label>
                </div>
                <textarea 
                  value={answers[q.id] || ''}
                  onChange={e => handleAnswerChange(q.id, e.target.value)}
                  className="w-full p-8 neo-brutal bg-stone-50 outline-none min-h-[180px] text-2xl serif italic placeholder:text-stone-300 focus:bg-white transition-all"
                  placeholder="Type your response here..."
                />
              </section>
            ))}

            <button 
              onClick={handleFinalSubmit}
              disabled={!selectedMemberId || Object.values(answers).every(a => !(a as string).trim())}
              className="w-full bg-violet-400 text-black py-8 neo-brutal font-black text-2xl uppercase tracking-widest disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group"
            >
              <span className="group-hover:tracking-[0.2em] transition-all">Publish Response &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRespondView;
