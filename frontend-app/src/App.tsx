import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { ProtectedRoute, UserButton } from "@/components/auth";
import { TestApi } from "@/components/TestApi";
import { UserProfile } from "@/components/UserProfile";
import { SignIn } from "@clerk/clerk-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { useProfile } = useApi();
  const { data: profile, isLoading } = useProfile();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Welcome, {user?.firstName || "User"}!
            </h1>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-6">
              {isLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 mb-4">
                    Your protected content goes here
                  </p>
                  {profile && (
                    <div className="text-sm text-gray-600">
                      <p>
                        Backend Profile: {profile.firstName} {profile.lastName}
                      </p>
                      <p>Email: {profile.email}</p>
                      <p>Role: {profile.role}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <TestApi />

            <UserProfile />
          </div>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <SignIn />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

export default App;
