"use client";

import { Printer } from "lucide-react";
import { Button } from "@karasu/ui";

interface PrintButtonProps {
  className?: string;
}

export function PrintButton({ className }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      size="sm"
      className={className}
    >
      <Printer className="h-4 w-4 mr-2" />
      Yazdır
    </Button>
  );
}

