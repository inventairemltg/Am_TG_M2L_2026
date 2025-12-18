"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

const RecentShipments: React.FC = () => {
  const { user } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentShipments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5); // Fetch up to 5 recent shipments

      if (error) {
        console.error("Error fetching recent shipments:", error);
        showError("Failed to load recent shipments.");
      } else if (data) {
        setShipments(data as Shipment[]);
      }
      setLoading(false);
    };

    fetchRecentShipments();
  }, [user]);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Recent Shipments
        </CardTitle>
        <Button variant="ghost" asChild>
          <Link to="/shipments" className="flex items-center text-sm text-blue-600 dark:text-blue-400">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : shipments.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 py-4">No recent shipments found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tracking #</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell className="font-medium">{shipment.origin}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>{shipment.status}</TableCell>
                  <TableCell>{shipment.tracking_number || "N/A"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentShipments;