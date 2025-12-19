"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Hourglass, Truck, CheckCircle, XCircle } from "lucide-react";

interface ShipmentSummary {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

const ShipmentSummaryCards: React.FC = () => {
  const { user } = useSession();
  const [summary, setSummary] = useState<ShipmentSummary>({
    total: 0,
    pending: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipmentSummary = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data: shipments, error } = await supabase
          .from("shipments")
          .select("status")
          .eq("user_id", user.id);

        if (error) {
          throw error;
        }

        if (shipments) {
          const counts = {
            total: shipments.length,
            pending: 0,
            inTransit: 0,
            delivered: 0,
            cancelled: 0,
          };

          shipments.forEach((shipment) => {
            switch (shipment.status) {
              case "Pending":
                counts.pending++;
                break;
              case "In Transit":
                counts.inTransit++;
                break;
              case "Delivered":
                counts.delivered++;
                break;
              case "Cancelled":
                counts.cancelled++;
                break;
              default:
                break;
            }
          });
          setSummary(counts);
        }
      } catch (error: any) {
        console.error("Error fetching shipment summary:", error.message);
        showError("Failed to load shipment summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchShipmentSummary();
  }, [user]);

  const summaryItems = [
    { title: "Total Shipments", value: summary.total, icon: Package, color: "text-blue-600 dark:text-blue-400" },
    { title: "Pending", value: summary.pending, icon: Hourglass, color: "text-yellow-600 dark:text-yellow-400" },
    { title: "In Transit", value: summary.inTransit, icon: Truck, color: "text-indigo-600 dark:text-indigo-400" },
    { title: "Delivered", value: summary.delivered, icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
    { title: "Cancelled", value: summary.cancelled, icon: XCircle, color: "text-red-600 dark:text-red-400" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {summaryItems.map((item, index) => (
        <Card key={index} className="bg-white dark:bg-gray-800 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-1/2" />
            ) : (
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {item.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ShipmentSummaryCards;