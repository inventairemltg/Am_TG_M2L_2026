"use client";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Skeleton } from "@/components/ui/skeleton";

const shipmentSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  tracking_number: z.string().optional().nullable(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  tracking_number: string | null;
  created_at: string;
  user_id: string;
}

const ShipmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      origin: "",
      destination: "",
      tracking_number: "",
    },
  });

  useEffect(() => {
    const fetchShipment = async () => {
      if (!user || !id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching shipment:", error);
        showError("Failed to load shipment details.");
        navigate("/shipments"); // Redirect if shipment not found or access denied
      } else if (data) {
        setShipment(data as Shipment);
        form.reset({
          origin: data.origin,
          destination: data.destination,
          tracking_number: data.tracking_number || "",
        });
      }
      setLoading(false);
    };

    fetchShipment();
  }, [id, user, navigate, form]);

  const onSubmit = async (values: ShipmentFormValues) => {
    if (!user || !id) {
      showError("You must be logged in to update a shipment.");
      return;
    }

    const { error } = await supabase
      .from("shipments")
      .update({
        origin: values.origin,
        destination: values.destination,
        tracking_number: values.tracking_number || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating shipment:", error);
      showError("Failed to update shipment.");
    } else {
      showSuccess("Shipment updated successfully!");
      setShipment((prev) => prev ? { ...prev, ...values } : null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="text-center text-gray-600 dark:text-gray-400">
        Shipment not found or you do not have permission to view it.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-2xl space-y-6">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Shipment Details (ID: {shipment.id.substring(0, 8)}...)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
              <div>
                <strong>Status:</strong> <span className="font-medium">{shipment.status}</span>
              </div>
              <div>
                <strong>Created At:</strong> {new Date(shipment.created_at).toLocaleDateString()}
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="origin">Origin</Label>
                <Input
                  id="origin"
                  {...form.register("origin")}
                  className="mt-1"
                />
                {form.formState.errors.origin && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.origin.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  {...form.register("destination")}
                  className="mt-1"
                />
                {form.formState.errors.destination && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.destination.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="tracking_number">Tracking Number (Optional)</Label>
                <Input
                  id="tracking_number"
                  {...form.register("tracking_number")}
                  className="mt-1"
                />
                {form.formState.errors.tracking_number && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.tracking_number.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving..." : "Update Shipment"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShipmentDetailsPage;