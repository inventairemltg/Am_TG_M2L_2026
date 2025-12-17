"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "./SessionContextProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccess, showError } from "@/utils/toast";

const shipmentFormSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  tracking_number: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentFormSchema>;

interface ShipmentFormProps {
  onShipmentAdded: () => void;
}

const ShipmentForm: React.FC<ShipmentFormProps> = ({ onShipmentAdded }) => {
  const { user } = useSession();
  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentFormSchema),
    defaultValues: {
      origin: "",
      destination: "",
      tracking_number: "",
    },
  });

  const onSubmit = async (values: ShipmentFormValues) => {
    if (!user) {
      showError("You must be logged in to add a shipment.");
      return;
    }

    const { error } = await supabase.from("shipments").insert({
      user_id: user.id,
      origin: values.origin,
      destination: values.destination,
      tracking_number: values.tracking_number || null,
      status: "Pending", // Default status
    });

    if (error) {
      console.error("Error adding shipment:", error);
      showError("Failed to add shipment.");
    } else {
      showSuccess("Shipment added successfully!");
      form.reset();
      onShipmentAdded();
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-800">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Add New Shipment</h3>
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
        {form.formState.isSubmitting ? "Adding..." : "Add Shipment"}
      </Button>
    </form>
  );
};

export default ShipmentForm;