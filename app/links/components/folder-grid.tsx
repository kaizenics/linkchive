"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LinkIcon, Heart, Archive, Folder, Pin } from "lucide-react";
import type { Link, Folder as FolderType, CurrentFolder } from "../utils/types";

interface FolderGridProps {
  isLoading: boolean;
  allLinks: Link[];
  folders: FolderType[];
  onFolderClick: (folder: CurrentFolder) => void;
}

export function FolderGrid({ isLoading, allLinks, folders, onFolderClick }: FolderGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 xl:grid-cols-8 gap-4 mt-5">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-3">
            <Skeleton className="w-24 h-24 rounded-lg" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 xl:grid-cols-8 gap-4 mt-5">
      {/* All Links Folder - Always visible */}
      <div
        className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
        onClick={() => onFolderClick('all')}
      >
        <div className="w-24 h-24 flex items-center justify-center bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <LinkIcon className="w-12 h-12 text-primary" />
        </div>
        <span className="text-sm font-medium text-center line-clamp-2">All Links</span>
        <span className="text-xs text-muted-foreground">{allLinks.length} items</span>
      </div>
      
      {/* Favorites Folder - Always first */}
      <div
        className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
        onClick={() => onFolderClick('favorites')}
      >
        <div className="w-24 h-24 flex items-center justify-center bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
          <Heart className="w-12 h-12 text-red-500 fill-red-500" />
        </div>
        <span className="text-sm font-medium text-center line-clamp-2">Favorites</span>
        <span className="text-xs text-muted-foreground">
          {allLinks.filter(link => link.isFavorite).length} items
        </span>
      </div>

      {/* Unfoldered Links Folder - Always visible */}
      <div
        className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
        onClick={() => onFolderClick(null)}
      >
        <div className="w-24 h-24 flex items-center justify-center bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
          <Archive className="w-12 h-12 text-orange-500" />
        </div>
        <span className="text-sm font-medium text-center line-clamp-2">Unfoldered</span>
        <span className="text-xs text-muted-foreground">
          {allLinks.filter(link => link.folderId === null).length} items
        </span>
      </div>

      {/* Regular Folders */}
      {folders
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return a.name.localeCompare(b.name);
        })
        .map((folder) => {
          const folderLinkCount = allLinks.filter(link => link.folderId === folder.id).length;
          return (
            <div
              key={folder.id}
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group"
              onClick={() => onFolderClick(folder.id)}
            >
              <div className="w-24 h-24 flex items-center justify-center bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors relative">
                {folder.isPinned && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Pin className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <Folder className="w-12 h-12 text-blue-500" />
              </div>
              <span className="text-sm font-medium text-center line-clamp-2">{folder.name}</span>
              <span className="text-xs text-muted-foreground">{folderLinkCount} items</span>
            </div>
          );
        })}
    </div>
  );
}
