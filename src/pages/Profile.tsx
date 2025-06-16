import { HealthStatus } from '@/components/HealthStatus';

export function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Profile
        </h1>
        <p className="text-xl text-muted-foreground">Manage your account and preferences.</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-2xl font-bold">System Status</h2>
          <HealthStatus showDetails className="max-w-md" />
        </div>
        
        <div>
          <h2 className="mb-3 text-2xl font-bold">Account Settings</h2>
          <p className="text-muted-foreground">
            Account management features will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
