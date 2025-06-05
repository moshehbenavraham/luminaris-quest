import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/lib/providers/query-provider';
import { SupabaseProvider } from '@/lib/providers/supabase-provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AuthForm } from '@/components/auth/AuthForm';

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
  return (
    <div>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Adventure
      </h1>
      <p className="text-xl text-muted-foreground">
        Embark on your therapeutic quest.
      </p>
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
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <div className="container py-6">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/adventure" element={<Adventure />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/legal" element={<Legal />} />
                </Routes>
              </div>
            </main>
            <Footer />
          </div>
        </Router>
      </SupabaseProvider>
    </QueryProvider>
  );
}

export default App;