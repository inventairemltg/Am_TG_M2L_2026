"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, MapPin, Truck, Hash } from "lucide-react";

interface ShipmentCardProps {
  shipment: {
    id: string;
    origin: string;
    destination: string;
    status: string;
    tracking_number?: string | null;
    created_at: string;
  };
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment }) => {
  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
          <Package className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
          Shipment ID: {shipment.id.substring(0, 8)}...
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
          Created: {new Date(shipment.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-gray-700 dark:text-gray-300">
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
          <strong>Origin:</strong> {shipment.origin}
        </div>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
          <strong>Destination:</strong> {shipment.destination}
        </div>
        <div className="flex items-center">
          <Truck className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <strong>Status:</strong> <span className="font-medium">{shipment.status}</span>
        </div>
        {shipment.tracking_number && (
          <div className="flex items-center">
            <Hash className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
            <strong>Tracking:</strong> {shipment.tracking_number}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentCard;