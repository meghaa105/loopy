
import React, { useState, useEffect } from 'react';
import { Loop, ViewState, Member, Response } from './types';
import Dashboard from './components/Dashboard';
import LoopEditor from './components/LoopEditor';
import NewsletterView from './components/NewsletterView';
import LandingPage from './components/LandingPage';
import PublicReaderView from './components/PublicReaderView';
import PublicRespondView from './components/PublicRespondView';

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Alex Rivera', email: 'alex@example.com', avatar: 'https://i.pravatar.cc/150?u=alex' },
  { id: '2', name: 'Jordan Smith', email: 'jordan@example.com', avatar: 'https://i.pravatar.cc/150?u=jordan' },
  { id: '3', name: 'Sam Taylor', email: 'sam@example.com', avatar: 'https://i.pravatar.cc/150?u=sam' },
];

const INITIAL_LOOPS: Loop[] = [
  {
    id: 'l1',
    name: 'The Sunday Social',
    description: 'Weekly catchup for our inner circle of friends.',
    category: 'friends',
    frequency: 'weekly',
    members: INITIAL_MEMBERS,
    questions: [
      { id: 'q1', text: 'What was the highlight of your week?' },
      { id: 'q2', text: 'What are you currently reading or watching?' }
    ],
    responses: [
      { id: 'r1', memberId: '1', questionId: 'q1', answer: 'I finally finished that 10k run!' },
      { id: 'r2', memberId: '2', questionId: 'q1', answer: 'Found a hidden gem of a coffee shop in downtown.' },
      { id: 'r3', memberId: '3', questionId: 'q2', answer: 'Started watching "The Bear". It is intense but great.' }
    ],
    collationMode: 'verbatim',
    lastGeneratedAt: new Date().toISOString(),
    headerImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200',
    introText: "Welcome to our very first edition of The Sunday Social. It's been a week of small victories and new discoveries. From finishing long-distance runs to finding the perfect shot of espresso, we're celebrating the little things that make life grand. Grab a coffee and settle in—here is what our circle has been up to.",
    nextSendDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [loops, setLoops] = useState<Loop[]>(() => {
    const saved = localStorage.getItem('loopy_loops');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure collationMode exists for migration
        return parsed.map((l: Loop) => ({ ...l, collationMode: l.collationMode || 'verbatim' }));
      } catch (e) {
        return INITIAL_LOOPS;
      }
    }
    return INITIAL_LOOPS;
  });
  const [activeLoopId, setActiveLoopId] = useState<string | null>(null);

  // Handle Hash Routing
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash;
      if (!hash) {
        return;
      }

      const parts = hash.split('/');
      if (parts[1] === 'loop' && parts[2]) {
        const loopId = parts[2];
        const mode = parts[3];
        setActiveLoopId(loopId);
        if (mode === 'read') setView('public-read');
        else if (mode === 'respond') setView('public-respond');
      }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); 
    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);

  useEffect(() => {
    localStorage.setItem('loopy_loops', JSON.stringify(loops));
  }, [loops]);

  const activeLoop = loops.find(l => l.id === activeLoopId);

  const handleSaveLoop = (loop: Loop) => {
    setLoops(prev => {
      const exists = prev.some(l => l.id === loop.id);
      if (exists) {
        return prev.map(l => l.id === loop.id ? loop : l);
      }
      return [...prev, { ...loop, collationMode: loop.collationMode || 'verbatim' }];
    });
    setActiveLoopId(loop.id);
  };

  const handleAddResponse = (loopId: string, response: Response) => {
    setLoops(prev => prev.map(l => {
      if (l.id === loopId) {
        return { ...l, responses: [...l.responses, response] };
      }
      return l;
    }));
  };

  const handleDeleteLoop = (id: string) => {
    setLoops(prev => prev.filter(l => l.id !== id));
    setActiveLoopId(null);
    setView('dashboard');
  };

  const isPublicView = view === 'public-read' || view === 'public-respond';

  return (
    <div className="min-h-screen">
      {view === 'landing' && (
        <LandingPage 
          onStart={() => { setView('dashboard'); window.location.hash = ''; }} 
          onExample={() => {
            const demoLoop = loops.find(l => l.id === 'l1') || INITIAL_LOOPS[0];
            if (!loops.find(l => l.id === 'l1')) {
              setLoops(prev => [...prev, INITIAL_LOOPS[0]]);
            }
            setActiveLoopId('l1');
            window.location.hash = '#/loop/l1/read';
          }}
        />
      )}
      
      {!isPublicView && view !== 'landing' && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <nav className="flex items-center justify-between mb-12">
            <button 
              onClick={() => { setView('landing'); window.location.hash = ''; }}
              className="text-3xl serif font-bold text-stone-800 tracking-tight hover:opacity-80 transition-opacity"
            >
              Loopy<span className="text-amber-600">.</span>
            </button>
            <div className="flex gap-4">
              <button 
                onClick={() => { setView('dashboard'); window.location.hash = ''; }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
              >
                Dashboard
              </button>
            </div>
          </nav>

          <main>
            {view === 'dashboard' && (
              <Dashboard 
                loops={loops} 
                onSelect={(id) => { setActiveLoopId(id); setView('newsletter'); }}
                onEdit={(id) => { setActiveLoopId(id); setView('editor'); }}
                onCreate={() => { setActiveLoopId(null); setView('editor'); }}
              />
            )}
            
            {view === 'editor' && (
              <LoopEditor 
                loop={activeLoop} 
                onSave={(loop) => {
                  handleSaveLoop(loop);
                  setView('dashboard');
                }}
                onCancel={() => setView('dashboard')}
                onDelete={handleDeleteLoop}
              />
            )}

            {view === 'newsletter' && activeLoop && (
              <NewsletterView 
                loop={activeLoop}
                onUpdate={handleSaveLoop}
                onBack={() => setView('dashboard')}
              />
            )}
          </main>
        </div>
      )}

      {view === 'public-read' && activeLoop && (
        <PublicReaderView loop={activeLoop} onBackToApp={() => { setView('landing'); window.location.hash = ''; }} />
      )}

      {view === 'public-respond' && activeLoop && (
        <PublicRespondView 
          loop={activeLoop} 
          onSubmit={(resp) => handleAddResponse(activeLoop.id, resp)}
          onBackToApp={() => { setView('landing'); window.location.hash = ''; }} 
        />
      )}
    </div>
  );
};

export default App;
