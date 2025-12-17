"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/components/SessionContextProvider";
import ShipmentForm from "@/components/ShipmentForm";
import ShipmentCard from "@/components/ShipmentCard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton component

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

const ShipmentsPage: React.FC = () => {
  const { user } = useSession(); // `loading` and `!user` checks are now handled by Layout
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [fetchingShipments, setFetchingShipments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchShipments = useCallback(async () => {
    if (!user) return; // Should not happen if Layout is working
    setFetchingShipments(true);

    let query = supabase
      .from("shipments")
      .select("*")
      .eq("user_id", user.id);

    if (filterStatus !== "All") {
      query = query.eq("status", filterStatus);
    }

    if (searchTerm) {
      query = query.or(
        `origin.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%,tracking_number.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching shipments:", error);
      showError("Failed to load shipments.");
    } else if (data) {
      setShipments(data as Shipment[]);
    }
    setFetchingShipments(false);
  }, [user, filterStatus, searchTerm]);

  useEffect(() => {
    if (user) {
      fetchShipments();
    }
  }, [user, fetchShipments]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!user) {
      showError("You must be logged in to update shipment status.");
      return;
    }

    const { error } = await supabase
      .from("shipments")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating shipment status:", error);
      showError("Failed to update shipment status.");
    } else {
      showSuccess("Shipment status updated successfully!");
      fetchShipments();
    }
  };

  const handleDeleteShipment = async (id: string) => {
    if (!user) {
      showError("You must be logged in to delete a shipment.");
      return;
    }

    const { error } = await supabase
      .from("shipments")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting shipment:", error);
      showError("Failed to delete shipment.");
    } else {
      showSuccess("Shipment deleted successfully!");
      fetchShipments();
    }
  };

  const statusOptions = ["All", "Pending", "In Transit", "Delivered", "Cancelled"];

  return (
    <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-4xl font-bold text-center">Your Shipments</h1>
        </div>

        <ShipmentForm onShipmentAdded={fetchShipments} />

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">All Shipments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by origin, destination, or tracking number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {fetchingShipments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => ( // Show 4 skeleton cards
                  <Card key={i} className="w-full bg-white dark:bg-gray-800 shadow-md">
                    <CardHeader className="pb-2">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : shipments.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400">No shipments found. Add one above!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shipments.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    shipment={shipment}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteShipment={handleDeleteShipment}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShipmentsPage;