"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

const Pagination = () => {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const router = useRouter();

  const handlePrevPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (currentPage - 1).toString());
    // window.history.replaceState({}, "", `/?${params.toString()}`);
    router.replace(`/?${params.toString()}`);
  };

  const handleNextPage = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (currentPage + 1).toString());
    // window.history.replaceState({}, "", `/?${params.toString()}`);
    router.replace(`/?${params.toString()}`);
  };

  return (
    <div className="flex justify-center items-center gap-4 my-6">
      <button
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className="px-3 py-1 text-gray-600 border border-gray-700 hover:border-gray-400 disabled:border-gray-800 disabled:text-gray-800 disabled:cursor-not-allowed rounded transition-colors"
      >
        Prev
      </button>
      <span className="text-gray-600">Page {currentPage}</span>
      <button
        onClick={handleNextPage}
        className="px-3 py-1 text-gray-600 border border-gray-700 hover:border-gray-400 disabled:border-gray-800 disabled:text-gray-800 disabled:cursor-not-allowed rounded transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
