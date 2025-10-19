"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkIcon } from "lucide-react";
import { LinkCard } from "./link-card";
import type { Link, Folder } from "../utils/types";

interface LinksGridProps {
  isLoading: boolean;
  links: Link[];
  folders: Folder[];
  searchQuery: string;
  onMoveLink: (linkId: number) => void;
}

export function LinksGrid({ isLoading, links, folders, searchQuery, onMoveLink }: LinksGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3 p-4 rounded-lg border bg-background">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <LinkIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-medium mb-2">
          {searchQuery ? 'No results found' : 'No links yet'}
        </h3>
        <p className="text-muted-foreground max-w-md">
          {searchQuery
            ? 'Try adjusting your search query to find what you\'re looking for.'
            : 'Start adding your favorite links to keep them organized and secure.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          folders={folders}
          onMoveLink={onMoveLink}
        />
      ))}
    </div>
  );
}
