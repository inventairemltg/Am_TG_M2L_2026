import { MadeWithDyad } from "@/components/made-with-dyad";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { signOut } from "@/integrations/supabase/auth";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold">Loading user session...</h1>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Logistics App</h1>
        {user ? (
          <>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Hello, {user.email}! You are logged in.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/shipments">View Shipments</Link>
              </Button>
              <Button onClick={signOut} variant="outline">
                Sign Out
              </Button>
            </div>
          </>
        ) : (
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Please log in to continue.
          </p>
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Index;