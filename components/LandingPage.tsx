
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onExample: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onExample }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center px-6 pt-20 pb-32">
      {/* Background Shapes */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-300 rounded-full neo-brutal-static -rotate-12 hidden md:block" />
      <div className="absolute top-40 right-10 w-40 h-12 bg-violet-400 neo-brutal-static rotate-6 hidden md:block" />
      <div className="absolute bottom-40 left-20 w-24 h-24 bg-emerald-300 neo-brutal-static rotate-12 hidden md:block" />

      <div className="relative z-10 max-w-4xl w-full text-center">
        <div className="inline-block px-4 py-1 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] mb-8 rotate-1">
          The Anti-Social-Media
        </div>
        
        <h1 className="text-6xl md:text-[7rem] serif font-black leading-[0.9] tracking-tight mb-10">
          Capture the <br />
          <span className="italic text-violet-600">vibe</span> of <br />
          the group.
        </h1>
        
        <p className="text-xl md:text-2xl font-medium text-stone-800 mb-12 max-w-2xl mx-auto leading-relaxed">
          Scribe is a private digital zine for your circle. AI curates your random thoughts, late-night takes, and weekly peaks into a stunning shared memory.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-12 py-6 bg-yellow-300 text-black text-xl font-black neo-brutal uppercase tracking-wider"
          >
            Create My Loop
          </button>
          <button 
            onClick={onExample}
            className="w-full sm:w-auto px-12 py-6 bg-white text-black text-xl font-black neo-brutal uppercase tracking-wider"
          >
            Show me a Zine
          </button>
        </div>
      </div>

      <div className="mt-32 w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 neo-brutal-static rotate-[-1deg]">
          <div className="text-4xl mb-6 sticker">📸</div>
          <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Zero algorithm.</h3>
          <p className="font-medium text-stone-600 leading-snug">Just your people. No ads, no scrolling, no likes. Just real life delivered once a week.</p>
        </div>
        <div className="bg-emerald-100 p-10 neo-brutal-static rotate-[1deg]">
          <div className="text-4xl mb-6 sticker">✨</div>
          <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">AI Curator.</h3>
          <p className="font-medium text-stone-700 leading-snug">Gemini writes the intros, designs the covers, and collates the chaos into a masterpiece.</p>
        </div>
        <div className="bg-violet-100 p-10 neo-brutal-static rotate-[-1deg]">
          <div className="text-4xl mb-6 sticker">💌</div>
          <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Inbox Gold.</h3>
          <p className="font-medium text-stone-700 leading-snug">Stop texting in the void. Build a weekly habit that feels like getting a physical letter.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
