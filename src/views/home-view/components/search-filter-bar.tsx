"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { FaSearch } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DropdownMenuProps {
  options: { key: string; label: string }[];
  defaultOption: string;
  onOptionSelected: (option: string) => void;
}

const CustomDropdownMenu: React.FC<DropdownMenuProps> = ({
  options,
  defaultOption,
  onOptionSelected,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-[#1d1d22] hover:bg-[#28282d] rounded-lg border-0 outline-0 focus:border-primary transition duration-200 py-2.5 px-5 w-full lg:w-40 text-gray-500">
        {defaultOption}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#1d1d22] mt-1 rounded-lg shadow-lg">
        {options.map(({ key, label }) => (
          <DropdownMenuItem
            key={key}
            className="px-5 py-2.5 hover:bg-[#28282d] text-sm text-white cursor-pointer"
            onSelect={() => onOptionSelected(key)}
          >
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const orderOptions = [
  { key: "bump_order", label: "Bump Order" },
  { key: "creation_date", label: "Creation Date" },
  { key: "market_cap", label: "Market Cap" },
];
const directionOptions: { key: "asc" | "desc"; label: string }[] = [
  { key: "asc", label: "Ascending" },
  { key: "desc", label: "Descending" },
];

interface SearchFilterBarProps {
  search: string;
  onSearchChange: (searchQuery: string) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  search,
  onSearchChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // const initialSearch = searchParams.get("search") || "";
  // const [searchQuery, setSearchQuery] = useState(initialSearch);
  // const [debouncedSearchQuery] = useDebounce(searchQuery, 200);

  // useEffect(() => {
  //   if (debouncedSearchQuery === "") {
  //     // Remove search param if it's empty
  //     const params = new URLSearchParams(searchParams.toString());
  //     params.delete("search");
  //     router.replace(`${pathname}?${params.toString()}`);
  //   } else if (debouncedSearchQuery) {
  //     // Only set the search param if it's not empty
  //     const params = new URLSearchParams(searchParams.toString());
  //     params.set("search", debouncedSearchQuery);
  //     if (params.get("page") && params.get("page") !== "1")
  //       params.set("page", "1"); // Reset to page 1 on new search
  //     router.replace(`${pathname}?${params.toString()}`);
  //   }
  //   onSearchChange(debouncedSearchQuery);
  // }, [debouncedSearchQuery, pathname, router, searchParams, onSearchChange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  // const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter" && searchQuery) {
  //     const params = new URLSearchParams(searchParams.toString());
  //     params.set("search", searchQuery);
  //     params.set("page", "1");
  //     router.replace(`${pathname}?${params.toString()}`);
  //   }
  // };

  const handleSortOptionChange = (
    field: string,
    direction?: "asc" | "desc"
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", field);
    if (direction) params.set("order", direction);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const getSortLabel = (key: string) => {
    const option = orderOptions.find((option) => option.key === key);
    return option ? option.label : "";
  };

  const getDirectionLabel = (key: string) => {
    const option = directionOptions.find((option) => option.key === key);
    return option ? option.label : "";
  };

  return (
    <div className="flex lg:flex-row flex-col justify-center gap-6 pb-10 pt-12">
      <div className="flex items-center bg-[#28282d] hover:bg-[#343439] text-[#c9c9ce] rounded-lg w-full lg:w-80">
        <FaSearch className="ml-4 text-lg text-[#c9c9ce]" />
        <input
          type="text"
          placeholder="Search token"
          value={search}
          onChange={handleSearchChange}
          className="flex-1 bg-transparent border-0 outline-none placeholder:text-[#c9c9ce] text-[#c9c9ce] py-2.5 px-5"
        />
      </div>
      <div className="flex flex-row gap-6">
        <CustomDropdownMenu
          options={orderOptions}
          defaultOption={
            getSortLabel(searchParams.get("sort") || "") ||
            orderOptions[0].label
          }
          onOptionSelected={(option) => handleSortOptionChange(option)}
        />
        <CustomDropdownMenu
          options={directionOptions}
          defaultOption={
            getDirectionLabel(searchParams.get("order") || "") || "Descending"
          }
          onOptionSelected={(direction) =>
            handleSortOptionChange(
              searchParams.get("sort") || orderOptions[0].key,
              direction as "asc" | "desc"
            )
          }
        />
      </div>
    </div>
  );
};

export default SearchFilterBar;
