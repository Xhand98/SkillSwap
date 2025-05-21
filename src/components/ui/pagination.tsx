import React from "react";
import { Button } from "./button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Determinar qué páginas mostrar (muestra 5 páginas como máximo)
  const renderPageButtons = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // Ajustar si estamos cerca del final
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          variant={currentPage === i ? "default" : "outline"}
          className="w-10 h-10 p-0 rounded-full"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-2 my-6 ${className}`}>
      <Button
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        variant="outline"
        className="w-10 h-10 p-0 rounded-full"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        className="w-10 h-10 p-0 rounded-full"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {renderPageButtons()}

      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        className="w-10 h-10 p-0 rounded-full"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        variant="outline"
        className="w-10 h-10 p-0 rounded-full"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
