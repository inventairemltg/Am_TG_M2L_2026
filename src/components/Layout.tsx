"use client";

import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signOut } from "@/integrations/supabase/auth";
import { useSession } from "./SessionContextProvider";
import { Package2, LogOut, LayoutDashboard, Truck, User as UserIcon } from "lucide-react";
import { MadeWithDyad } from "./made-with-dyad";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client"; // Keep for potential future direct supabase interactions if needed, but not for avatar here.

const Layout: React.FC = () => {
  const { user, profile, loading } = useSession(); // Get profile from session context

  // The avatarUrl state and useEffect are no longer needed here as profile.avatar_url is directly available
  // and managed by SessionContextProvider.

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold">Loading application...</h1>
        <MadeWithDyad />
      </div>
    );
  }

  if (!user) {
    return <Outlet />;
  }

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user.email;

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
              <Button variant="ghost" asChild>
                <Link to="/profile" className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </Link>
              </Button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {displayName && (
              <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                {displayName}
              </span>
            )}
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} alt="User Avatar" />
              <AvatarFallback>
                <UserIcon className="h-5 w-5 text-gray-500" />
              </AvatarFallback>
            </Avatar>
            <Button onClick={signOut} variant="outline" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8 px-4">
        <Outlet />
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;