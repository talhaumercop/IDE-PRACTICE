"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TotalSales() {
  const [totalSales, setTotalSales] = useState<number | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await fetch("/api/dashboard/total-sales");
        const data = await res.json();
        if (res.ok) setTotalSales(data.totalSales);
      } catch (err) {
        console.error("Failed to fetch sales:", err);
      }
    };
    fetchSales();
  }, []);

  return (
    <div className="p-6 grid gap-6 ">
      <Card className="shadow-md border">
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {totalSales === null ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <p className="text-2xl font-bold text-green-600">
              ${totalSales.toLocaleString()}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
