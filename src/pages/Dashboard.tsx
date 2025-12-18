"use client";

import React from "react";
import { useSession } from "@/components/SessionContextProvider";
import ProfileForm from "@/components/ProfileForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ShipmentStatistics from "@/components/ShipmentStatistics"; // Import ShipmentStatistics

const Dashboard: React.FC = () => {
  const { user } = useSession(); // `loading` check is now handled by Layout

  // No need for !user check here, as Layout handles redirection for unauthenticated users.
  // If we reach here, user is guaranteed to be logged in.

  return (
    <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Welcome to Your Dashboard, {user?.email}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Manage your profile information or view your shipments.
              </p>
            </div>
            <ProfileForm />
          </CardContent>
        </Card>

        {/* Add ShipmentStatistics component */}
        <ShipmentStatistics />
      </div>
    </div>
  );
};

export default Dashboard;