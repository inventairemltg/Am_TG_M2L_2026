import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { user, profile } = useSession(); // Get profile from session context

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.email; // Use optional chaining for user.email

  return (
    <div className="flex flex-col items-center justify-center text-gray-900 dark:text-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Logistics App</h1>
        {user ? (
          <>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Hello, {displayName}! You are logged in.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/shipments">View Shipments</Link>
              </Button>
            </div>
          </>
        ) : (
          // This block should ideally not be reached if Layout is working correctly
          // as unauthenticated users are redirected to /login.
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">
            Please log in to continue.
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;