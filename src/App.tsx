import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from '@/lib/providers/query-provider';
import { SupabaseProvider } from '@/lib/providers/supabase-provider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

function Home() {
  return (
    <div className="container py-8">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Welcome to Luminari's Quest
      </h1>
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
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/adventure" element={<div className="container py-8">Adventure</div>} />
                <Route path="/progress" element={<div className="container py-8">Progress</div>} />
                <Route path="/profile" element={<div className="container py-8">Profile</div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </SupabaseProvider>
    </QueryProvider>
  );
}

export default App;