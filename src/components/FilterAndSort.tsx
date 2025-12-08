"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface SortOption {
  value: string;
  label: string;
}

interface FilterAndSortProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filterLabel?: string;
  filterValue?: string;
  filterOptions?: FilterOption[];
  onFilterChange?: (value: string) => void;
  sortLabel?: string;
  sortValue?: string;
  sortOptions?: SortOption[];
  onSortChange?: (value: string) => void;
  sortOrder?: "asc" | "desc";
  onSortOrderChange?: (order: "asc" | "desc") => void;
  showSearch?: boolean;
  showFilter?: boolean;
  showSort?: boolean;
}

export function FilterAndSort({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  filterLabel = "Filter",
  filterValue,
  filterOptions = [],
  onFilterChange,
  sortLabel = "Sort by",
  sortValue,
  sortOptions = [],
  onSortChange,
  sortOrder = "desc",
  onSortOrderChange,
  showSearch = true,
  showFilter = false,
  showSort = false,
}: FilterAndSortProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {showSearch && (
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchValue && (
              <button
                onClick={() => onSearchChange?.("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {showFilter && filterOptions.length > 0 && (
          <div className="sm:w-48">
            <Label className="sr-only">{filterLabel}</Label>
            <Select 
              value={filterValue && filterValue !== "" ? filterValue : "all"} 
              onValueChange={(value) => {
                if (value === "all") {
                  onFilterChange?.("");
                } else {
                  onFilterChange?.(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={filterLabel} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showSort && sortOptions.length > 0 && (
          <>
            <div className="sm:w-48">
              <Label className="sr-only">{sortLabel}</Label>
              <Select value={sortValue || ""} onValueChange={onSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder={sortLabel} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {onSortOrderChange && (
              <div className="sm:w-32">
                <Label className="sr-only">Order</Label>
                <Select value={sortOrder} onValueChange={(value) => onSortOrderChange(value as "asc" | "desc")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

