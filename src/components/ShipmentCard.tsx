"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, MapPin, Truck, Hash, MoreHorizontal, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ShipmentCardProps {
  shipment: {
    id: string;
    origin: string;
    destination: string;
    status: string;
    tracking_number?: string | null;
    created_at: string;
  };
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDeleteShipment: (id: string) => void;
}

const ShipmentCard: React.FC<ShipmentCardProps> = ({ shipment, onUpdateStatus, onDeleteShipment }) => {
  const handleStatusChange = (newStatus: string) => {
    onUpdateStatus(shipment.id, newStatus);
  };

  const handleDelete = () => {
    onDeleteShipment(shipment.id);
  };

  const statusOptions = ["Pending", "In Transit", "Delivered", "Cancelled"];

  return (
    <Card className="w-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center text-xl font-bold text-gray-900 dark:text-gray-100">
            <Package className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            Shipment ID: {shipment.id.substring(0, 8)}...
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
            Created: {new Date(shipment.created_at).toLocaleDateString()}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your shipment
                    and remove its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Truck className="mr-2 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <strong>Status:</strong>
          </div>
          <Select onValueChange={handleStatusChange} value={shipment.status}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Status" />
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