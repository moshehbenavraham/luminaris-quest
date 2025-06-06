import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/lib/providers/query-provider';
import { SupabaseProvider } from '@/lib/providers/supabase-provider';
import { Layout } from '@/components/layout/Layout';
import { AuthForm } from '@/components/auth/AuthForm';
import { ChoiceList } from '@/components/ChoiceList';
import { GuardianText } from '@/components/GuardianText';
import { useState } from 'react';

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
  const [guardianTrust, setGuardianTrust] = useState(50);
  const [guardianMessage, setGuardianMessage] = useState(
    "I am your guardian spirit, here to guide and support you on this journey. Your choices shape our bond and your path forward."
  );

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
          />
        </div>
        <div>
          <GuardianText 
            trust={guardianTrust}
            message={guardianMessage}
          />
        </div>
      </div>
    </div>
  );
}

function Progress() {
  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Progress
      </h1>
      <p className="text-xl text-muted-foreground">
        Track your journey and achievements.
      </p>
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

function Legal() {
  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Legal
      </h1>
      <p className="text-xl text-muted-foreground">
        Terms of service and privacy policy.
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
              <Route path="/adventure" element={<Adventure />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/profile" element={<Profile />} />
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