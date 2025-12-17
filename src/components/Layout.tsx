"use client";

import React from "react";
import { Link, Outlet } from "react-router-dom"; // Import Outlet
import { Button } from "@/components/ui/button";
import { signOut } from "@/integrations/supabase/auth";
import { useSession } from "./SessionContextProvider";
import { Package2, LogOut, LayoutDashboard, Truck } from "lucide-react";
import { MadeWithDyad } from "./made-with-dyad";

// Removed LayoutProps interface as Outlet handles content

const Layout: React.FC = () => { // Removed LayoutProps from here
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold">Loading application...</h1>
        <MadeWithDyad />
      </div>
    );
  }

  if (!user) {
    // If not logged in, render Outlet directly (e.g., Login page)
    // SessionContextProvider will handle redirection to /login
    return <Outlet />; // Render Outlet here for unauthenticated routes if needed, though SessionContextProvider redirects
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="sticky top-0 z-40 w-full border-b bg-white dark:bg-gray-800 shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-lg font-bold text-gray-900 dark:text-gray-100">
              <Package2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span>Logistics App</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link to="/dashboard" className="flex items-center">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/shipments" className="flex items-center">
                  <Truck className="mr-2 h-4 w-4" /> Shipments
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              {user.email}
            </span>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8 px-4">
        <Outlet /> {/* Render Outlet here to display nested routes */}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;