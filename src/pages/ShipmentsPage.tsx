"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession } from "@/components/SessionContextProvider";
import ShipmentForm from "@/components/ShipmentForm";
import ShipmentCard from "@/components/ShipmentCard";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { Search, Download } from "lucide-react"; // Import Download icon
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button"; // Import Button
import { exportToCsv } from "@/utils/csvExport"; // Import exportToCsv

interface Shipment {
  id: string;
  origin: string;
  destination: string;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

const ITEMS_PER_PAGE = 6; // Number of shipments to display per page

const ShipmentsPage: React.FC = () => {
  const { user } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [fetchingShipments, setFetchingShipments] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalShipmentCount, setTotalShipmentCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  const fetchShipments = useCallback(async () => {
    if (!user) return;
    setFetchingShipments(true);

    let query = supabase
      .from("shipments")
      .select("*", { count: "exact" }) // Request exact count
      .eq("user_id", user.id);

    if (filterStatus !== "All") {
      query = query.eq("status", filterStatus);
    }

    if (searchTerm) {
      query = query.or(
        `origin.ilike.%${searchTerm}%,destination.ilike.%${searchTerm}%,tracking_number.ilike.%${searchTerm}%`
      );
    }

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching shipments:", error);
      showError("Failed to load shipments.");
    } else if (data) {
      setShipments(data as Shipment[]);
      setTotalShipmentCount(count || 0);
    }
    setFetchingShipments(false);
  }, [user, filterStatus, searchTerm, currentPage]);

  useEffect(() => {
    if (user) {
      // Reset to first page when filters or search term change
      setCurrentPage(1);
      fetchShipments();
    }
  }, [user, filterStatus, searchTerm, fetchShipments]); // fetchShipments is now stable due to useCallback

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
      fetchShipments(); // Re-fetch to update the list
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
      fetchShipments(); // Re-fetch to update the list
    }
  };

  const handleExportCsv = async () => {
    if (!user) {
      showError("You must be logged in to export shipments.");
      return;
    }
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        exportToCsv("shipments.csv", data);
        showSuccess("Shipments exported successfully!");
      } else {
        showError("No shipments found to export.");
      }
    } catch (error: any) {
      console.error("Error exporting shipments:", error.message);
      showError("Failed to export shipments: " + error.message);
    } finally {
      setExporting(false);
    }
  };

  const statusOptions = ["All", "Pending", "In Transit", "Delivered", "Cancelled"];
  const totalPages = Math.ceil(totalShipmentCount / ITEMS_PER_PAGE);

  const renderPaginationItems = () => {
    const items = [];
    const maxPageButtons = 5; // Max number of page buttons to show

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            isActive={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if current page is far from the start
      if (currentPage > 2 && currentPage > Math.floor(maxPageButtons / 2) + 1) {
        items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
      }

      // Show pages around the current page
      const startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2) + 1);
      const endPage = Math.min(totalPages - 1, currentPage + Math.floor(maxPageButtons / 2) - 1);

      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              isActive={currentPage === i}
              onClick={() => setCurrentPage(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if current page is far from the end
      if (currentPage < totalPages - 1 && currentPage < totalPages - Math.floor(maxPageButtons / 2)) {
        items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              isActive={currentPage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    return items;
  };


  return (
    <div className="flex flex-col items-center text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-4xl font-bold text-center">Your Shipments</h1>
        </div>

        <ShipmentForm onShipmentAdded={() => {
          setCurrentPage(1); // Go to first page after adding a new shipment
          fetchShipments();
        }} />

        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <CardTitle className="text-2xl font-bold mb-2 sm:mb-0">All Shipments</CardTitle>
              <Button onClick={handleExportCsv} disabled={exporting} className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                {exporting ? "Exporting..." : "Export to CSV"}
              </Button>
            </div>
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
                {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
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
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      isActive={currentPage > 1}
                    />
                  </PaginationItem>
                  {renderPaginationItems()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      isActive={currentPage < totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShipmentsPage;