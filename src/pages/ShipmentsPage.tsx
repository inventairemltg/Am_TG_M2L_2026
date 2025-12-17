"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/components/SessionContextProvider";
import { MadeWithDyad } from "@/components/made-with-dyad";
import ShipmentForm from "@/components/ShipmentForm";
import ShipmentCard from "@/components/ShipmentCard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

const ShipmentsPage: React.FC = () => {
  const { user, loading } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [fetchingShipments, setFetchingShipments] = useState(true);

  const fetchShipments = useCallback(async () => {
    if (!user) return;
    setFetchingShipments(true);
    const { data, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shipments:", error);
      showError("Failed to load shipments.");
    } else if (data) {
      setShipments(data as Shipment[]);
    }
    setFetchingShipments(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user, fetchShipments]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-2xl font-bold">Loading user session...</h1>
        <MadeWithDyad />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg">Please log in to view your shipments.</p>
        <MadeWithDyad />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="w-full max-w-4xl space-y-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-4xl font-bold text-center flex-grow">Your Shipments</h1>
          <div className="w-[150px]"></div> {/* Spacer to balance the back button */}
        </div>

        <ShipmentForm onShipmentAdded={fetchShipments} />

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">All Shipments</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingShipments ? (
              <p className="text-center text-gray-600 dark:text-gray-400">Loading shipments...</p>
            ) : shipments.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">No shipments found. Add one above!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shipments.map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default ShipmentsPage;