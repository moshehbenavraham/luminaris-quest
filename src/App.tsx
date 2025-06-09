import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/lib/providers/query-provider';
import { SupabaseProvider } from '@/lib/providers/supabase-provider';
import { Layout } from '@/components/layout/Layout';
import { AuthForm } from '@/components/auth/AuthForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ChoiceList } from '@/components/ChoiceList';
import { GuardianText } from '@/components/GuardianText';
import { JournalModal, type JournalEntry } from '@/components/JournalModal';
import { useGameStore } from '@/store/game-store';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, BookOpen, Calendar, Award } from 'lucide-react';
import { Legal } from '@/pages/Legal';

// Page components
function Home() {
  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Welcome to Luminari's Quest
      </h1>
      <p className="text-xl text-muted-foreground">
        Your journey to healing and growth begins here.
      </p>
      <div className="mt-8">
        <AuthForm />
      </div>
    </div>
  );
}

function Adventure() {
  const { 
    guardianTrust, 
    setGuardianTrust, 
    addJournalEntry,
    milestones,
    _hasHydrated
  } = useGameStore();
  
  const [isClient, setIsClient] = useState(false);
  const [guardianMessage, setGuardianMessage] = useState(
    "I am your guardian spirit, here to guide and support you on this journey. Your choices shape our bond and your path forward."
  );
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [journalTrigger, setJournalTrigger] = useState<'milestone' | 'learning'>('milestone');
  const shownMilestonesRef = useRef<Set<number>>(new Set());

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for trust milestones
  useEffect(() => {
    if (!_hasHydrated || !milestones.length) return; // Wait for hydration and milestones to load
    
    try {
      // Find milestones that are achieved but not yet shown
      const newlyAchievedMilestones = milestones.filter(m => 
        m && m.achieved && !shownMilestonesRef.current.has(m.level)
      );
      
      if (newlyAchievedMilestones.length > 0) {
        // Show the first newly achieved milestone
        const milestoneToShow = newlyAchievedMilestones[0];
        if (milestoneToShow && typeof milestoneToShow.level === 'number') {
          shownMilestonesRef.current.add(milestoneToShow.level);
          setJournalTrigger('milestone');
          setShowJournalModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  }, [milestones, _hasHydrated]);

  const handleSaveJournalEntry = useCallback((entry: JournalEntry) => {
    try {
      if (entry && entry.id && entry.content) {
        addJournalEntry(entry);
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  }, [addJournalEntry]);

  const handleSceneComplete = useCallback(() => {
    // This will be called when a scene completes, potentially triggering learning journal
  }, []);

  const handleLearningMoment = useCallback(() => {
    setJournalTrigger('learning');
    setShowJournalModal(true);
  }, []);

  // Don't render anything until hydration is complete
  if (!isClient || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Adventure
        </h1>
        <p className="text-xl text-muted-foreground">
          Embark on your therapeutic quest.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChoiceList 
            guardianTrust={guardianTrust}
            setGuardianTrust={setGuardianTrust}
            setGuardianMessage={setGuardianMessage}
            onSceneComplete={handleSceneComplete}
            onLearningMoment={handleLearningMoment}
          />
        </div>
        <div>
          <GuardianText 
            trust={guardianTrust}
            message={guardianMessage}
          />
        </div>
      </div>

      <JournalModal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        trustLevel={guardianTrust}
        triggerType={journalTrigger}
        onSaveEntry={handleSaveJournalEntry}
      />
    </div>
  );
}

function Progress() {
  const { 
    guardianTrust, 
    journalEntries, 
    milestones, 
    _hasHydrated 
  } = useGameStore();
  
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't render anything until hydration is complete
  if (!isClient || !_hasHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const getTrustColor = (trustLevel: number) => {
    if (trustLevel >= 80) return 'bg-green-500';
    if (trustLevel >= 60) return 'bg-blue-500';
    if (trustLevel >= 40) return 'bg-yellow-500';
    if (trustLevel >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getTrustLabel = (trustLevel: number) => {
    if (trustLevel >= 80) return 'Deep Bond';
    if (trustLevel >= 60) return 'Strong Trust';
    if (trustLevel >= 40) return 'Growing Bond';
    if (trustLevel >= 20) return 'Cautious Trust';
    return 'Fragile Bond';
  };

  const getEntryIcon = (type: 'milestone' | 'learning') => {
    return type === 'milestone' ? (
      <Award className="h-4 w-4 text-yellow-500" />
    ) : (
      <BookOpen className="h-4 w-4 text-blue-500" />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Progress
        </h1>
        <p className="text-xl text-muted-foreground">
          Track your journey and achievements.
        </p>
      </div>

      {/* Trust Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Guardian Trust Bond
          </CardTitle>
          <CardDescription>
            Your connection with your guardian spirit grows stronger through each choice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Level</span>
            <span className="text-lg font-bold">{getTrustLabel(guardianTrust)}</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-700 ease-out ${getTrustColor(guardianTrust)} shadow-sm`}
              style={{ width: `${guardianTrust}%` }}
            />
          </div>
          
          <div className="text-center">
            <span className="text-2xl font-bold">{guardianTrust}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Milestones Achieved
          </CardTitle>
          <CardDescription>
            Celebrate your growth and healing journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {milestones
              .filter((milestone, index, arr) => 
                // Remove duplicates by level
                arr.findIndex(m => m.level === milestone.level) === index
              )
              .slice(0, 6) // Limit to max 6 milestones
              .map((milestone) => (
              <div
                key={milestone.id}
                className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                  milestone.achieved
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20'
                    : 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
                }`}
              >
                <div className="text-center space-y-2">
                  <div className={`text-2xl ${milestone.achieved ? 'text-yellow-500' : 'text-gray-400'}`}>
                    {milestone.achieved ? '🏆' : '🔒'}
                  </div>
                  <div className="font-semibold">{milestone.label}</div>
                  <Badge variant={milestone.achieved ? 'default' : 'secondary'}>
                    Trust {milestone.level}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Journal Entries
          </CardTitle>
          <CardDescription>
            Reflections from your healing journey (showing most recent 12 entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {journalEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your journal entries will appear here as you progress through your adventure.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {journalEntries
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 12) // Ensure we never show more than 12 entries
                .map((entry, index) => {
                  // Add error boundary for individual entries
                  try {
                    return (
                      <Card 
                        key={entry.id}
                        className={`transition-all duration-500 ease-in-out transform ${
                          index === 0 ? 'animate-in fade-in slide-in-from-top-2' : ''
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              {getEntryIcon(entry.type)}
                              {entry.title}
                            </CardTitle>
                            <Badge variant={entry.type === 'milestone' ? 'default' : 'secondary'}>
                              {entry.type === 'milestone' ? 'Milestone' : 'Learning'}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                            • Trust Level: {entry.trustLevel}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <blockquote className="border-l-4 border-purple-400 pl-4 italic text-foreground">
                            "{entry.content}"
                          </blockquote>
                        </CardContent>
                      </Card>
                    );
                  } catch (error) {
                    console.error('Error rendering journal entry:', error, entry);
                    return (
                      <Card key={entry.id || `error-${index}`} className="border-red-200">
                        <CardContent className="p-4">
                          <p className="text-red-600 text-sm">Error displaying journal entry</p>
                        </CardContent>
                      </Card>
                    );
                  }
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Profile() {
  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Profile
      </h1>
      <p className="text-xl text-muted-foreground">
        Manage your account and preferences.
      </p>
    </div>
  );
}



function App() {
  return (
    <QueryProvider>
      <SupabaseProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/adventure" element={
                <ProtectedRoute>
                  <Adventure />
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/legal" element={<Legal />} />
              <Route path="/auth/callback" element={<Home />} />
            </Route>
          </Routes>
        </Router>
      </SupabaseProvider>
    </QueryProvider>
  );
}

export default App;