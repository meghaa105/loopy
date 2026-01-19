
import React, { useState } from 'react';
import { Loop, Member } from '../types.ts';

interface DashboardProps {
  loops: Loop[];
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onCreate: () => void;
}

const FALLBACK_COLORS = [
  'bg-amber-200 text-amber-900',
  'bg-violet-200 text-violet-900',
  'bg-emerald-200 text-emerald-900',
  'bg-rose-200 text-rose-900',
  'bg-sky-200 text-sky-900',
  'bg-orange-200 text-orange-900',
];

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorClass = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
};

const MemberAvatar: React.FC<{ member: Member }> = ({ member }) => {
  const [imgError, setImgError] = useState(false);

  if (!member.avatar || imgError) {
    return (
      <div 
        className={`w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-xs font-black transition-all shadow-[2px_2px_0px_0px_#000] group-hover:shadow-[4px_4px_0px_0px_#000] ${getColorClass(member.name)}`}
        title={member.name}
      >
        {getInitials(member.name)}
      </div>
    );
  }

  return (
    <img 
      src={member.avatar} 
      onError={() => setImgError(true)}
      className="w-12 h-12 rounded-full border-2 border-black grayscale group-hover:grayscale-0 transition-all shadow-[2px_2px_0px_0px_#000] group-hover:shadow-[4px_4px_0px_0px_#000] object-cover bg-white" 
      title={member.name}
      alt={member.name}
    />
  );
};

const Dashboard: React.FC<DashboardProps> = ({ loops, onSelect, onEdit, onCreate }) => {
  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div>
          <h2 className="text-6xl serif font-black text-black leading-tight">Your<br />Collectives</h2>
          <div className="h-1 w-20 bg-black mt-4" />
        </div>
        <button 
          onClick={onCreate}
          className="bg-emerald-400 text-black px-10 py-5 neo-brutal font-black text-lg uppercase flex items-center gap-3"
        >
          New Loop +
        </button>
      </div>

      {loops.length === 0 ? (
        <div className="bg-white border-4 border-black p-20 text-center neo-brutal-static">
          <p className="text-2xl font-black mb-8 italic">Your world is quiet right now...</p>
          <button 
            onClick={onCreate}
            className="bg-yellow-300 text-black px-8 py-4 neo-brutal font-black uppercase"
          >
            Summon the Squad &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loops.map((loop, idx) => (
            <div 
              key={loop.id}
              className={`bg-white neo-brutal-static group transition-transform ${idx % 2 === 0 ? 'rotate-[-1deg]' : 'rotate-[1deg]'}`}
            >
              <div className="h-48 border-b-2 border-black relative overflow-hidden">
                {loop.headerImage ? (
                  <img src={loop.headerImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt={loop.name} />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(loop.category)}`} />
                )}
                
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                   <span className="bg-white border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
                    {loop.category}
                  </span>
                   <span className="bg-yellow-300 border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
                    {loop.frequency}
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h3 className="text-3xl serif font-black text-black mb-4 leading-none">{loop.name}</h3>
                <p className="text-stone-600 font-medium text-sm mb-8 line-clamp-2 leading-relaxed">{loop.description}</p>
                
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center -space-x-4">
                    {loop.members.slice(0, 4).map(member => (
                      <MemberAvatar key={member.id} member={member} />
                    ))}
                    {loop.members.length > 4 && (
                      <div className="w-12 h-12 rounded-full bg-white border-2 border-black flex items-center justify-center text-[10px] font-black shadow-[2px_2px_0px_0px_#000] z-10">
                        +{loop.members.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">Next Drop</p>
                    <p className="text-sm font-bold text-black">
                      {loop.nextSendDate ? new Date(loop.nextSendDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'ASAP'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => onSelect(loop.id)}
                    className="flex-1 bg-black text-white py-4 neo-brutal font-black text-xs uppercase tracking-widest"
                  >
                    Open Zine
                  </button>
                  <button 
                    onClick={() => onEdit(loop.id)}
                    className="aspect-square bg-violet-300 p-4 neo-brutal flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function getCategoryColor(category: string) {
  switch (category) {
    case 'family': return 'from-orange-200 to-yellow-100';
    case 'friends': return 'from-violet-200 to-indigo-100';
    case 'work': return 'from-emerald-200 to-teal-100';
    default: return 'from-stone-300 to-stone-100';
  }
}

export default Dashboard;
