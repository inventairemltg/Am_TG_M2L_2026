"use client";

import React from "react";
import { useSession } from "@/components/SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ShipmentStatistics from "@/components/ShipmentStatistics";
import RecentShipments from "@/components/RecentShipments";
import ShipmentSummaryCards from "@/components/ShipmentSummaryCards"; // Import ShipmentSummaryCards

const Dashboard: React.FC = () => {
  const { user } = useSession();

  return (
    <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-4xl space-y-6"> {/* Increased max-w to accommodate more cards */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Welcome to Your Dashboard, {user?.email}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                View your shipment statistics or manage your profile.
              </p>
              <Button asChild>
                <Link to="/profile">Manage Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <ShipmentSummaryCards /> {/* Add ShipmentSummaryCards component here */}
        <ShipmentStatistics />
        <RecentShipments />
      </div>
    </div>
  );
};

export default Dashboard;