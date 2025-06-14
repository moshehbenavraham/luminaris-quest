import { AuthForm } from '@/components/auth/AuthForm';

export function Home() {
  return (
    <div>
      <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
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
