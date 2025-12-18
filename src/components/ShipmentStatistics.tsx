"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContextProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ShipmentStatusData {
  name: string;
  count: number;
}

const ShipmentStatistics: React.FC = () => {
  const { user } = useSession();
  const [data, setData] = useState<ShipmentStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipmentStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: shipments, error } = await supabase
        .from("shipments")
        .select("status")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching shipment statistics:", error);
        showError("Failed to load shipment statistics.");
        setLoading(false);
        return;
      }

      if (shipments) {
        const statusCounts: { [key: string]: number } = {};
        shipments.forEach((shipment) => {
          statusCounts[shipment.status] = (statusCounts[shipment.status] || 0) + 1;
        });

        const chartData: ShipmentStatusData[] = Object.keys(statusCounts).map((status) => ({
          name: status,
          count: statusCounts[status],
        }));
        setData(chartData);
      }
      setLoading(false);
    };

    fetchShipmentStats();
  }, [user]);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
          Shipment Status Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Skeleton className="h-full w-full" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400">No shipment data available to display statistics.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="name" className="text-sm text-gray-700 dark:text-gray-300" />
              <YAxis allowDecimals={false} className="text-sm text-gray-700 dark:text-gray-300" />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentStatistics;