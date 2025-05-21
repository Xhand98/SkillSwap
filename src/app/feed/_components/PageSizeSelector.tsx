"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronDown
} from "lucide-react";
import { useState } from "react";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [5, 10, 25, 50],
  className = ""
}: PageSizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Mostrar {pageSize} por página</span>
        <ChevronDown className="h-4 w-4" />
      </div>

      {isOpen && (
        <div className="absolute mt-2 py-2 w-36 bg-gray-900 rounded-xl shadow-lg border border-gray-800 z-20">
          <div className="flex flex-col">
            {options.map((option) => (
              <button
                key={option}
                className={`px-4 py-2 text-left hover:bg-gray-800 text-sm ${
                  option === pageSize ? "text-primary" : "text-gray-300"
                }`}
                onClick={() => {
                  onPageSizeChange(option);
                  setIsOpen(false);
                }}
              >
                {option} publicaciones
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
