"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, ArrowUpDown, Calendar, SortAsc, Heart, Check, MoreVertical, Pin, PinOff, Edit2, Trash2, LinkIcon, FolderPlus } from "lucide-react";
import { useFolderMutations } from "../utils/hooks";
import type { CurrentFolder, SortBy, Folder } from "../utils/types";

interface PageHeaderProps {
  currentFolder: CurrentFolder;
  folders: Folder[];
  sortBy: SortBy;
  onFolderChange: (folder: CurrentFolder) => void;
  onSortChange: (sort: SortBy) => void;
  onAddLink: () => void;
  onAddFolder: () => void;
  onRenameFolder: (folderId: number, folderName: string) => void;
}

export function PageHeader({
  currentFolder,
  folders,
  sortBy,
  onFolderChange,
  onSortChange,
  onAddLink,
  onAddFolder,
  onRenameFolder
}: PageHeaderProps) {
  const { toggleFolderPinMutation, deleteFolderMutation } = useFolderMutations();

  const handleToggleFolderPin = async (folderId: number) => {
    toggleFolderPinMutation.mutate({ id: folderId });
  };

  const handleDeleteFolder = async (folderId: number) => {
    deleteFolderMutation.mutate(
      { id: folderId },
      {
        onSuccess: () => {
          // If we're currently viewing the deleted folder, go back to all links
          if (currentFolder === folderId) {
            onFolderChange(undefined);
          }
        },
      }
    );
  };

  const getPageTitle = () => {
    if (currentFolder === undefined) return '';
    if (currentFolder === 'favorites') return 'Favorites';
    if (currentFolder === 'all') return 'All Links';
    if (currentFolder === null) return 'Unfoldered Links';
    return folders.find(f => f.id === currentFolder)?.name || 'Folder';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="font-sans text-2xl sm:text-3xl font-semibold">
            {getPageTitle()}
          </h1>
          {currentFolder !== undefined && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFolderChange(undefined)}
              className="text-muted-foreground"
            >
              ← Back to Folders
            </Button>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="flex-1 sm:flex-initial">
                <Plus className="w-5 h-5 mr-2" />
                Add New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onAddLink}>
                <LinkIcon className="w-4 h-4 mr-2" />
                Add Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddFolder}>
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg">
                <ArrowUpDown className="w-5 h-5 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSortChange('date')}>
                <Calendar className="w-4 h-4 mr-1" />
                Date Added
                {sortBy === 'date' && <Check className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('alphabetical')}>
                <SortAsc className="w-4 h-4 mr-1" />
                Alphabetical
                {sortBy === 'alphabetical' && <Check className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('favorites')}>
                <Heart className="w-4 h-4 mr-1" />
                Favorites First
                {sortBy === 'favorites' && <Check className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Folder Management Menu */}
          {currentFolder !== undefined && currentFolder !== null && currentFolder !== 'all' && currentFolder !== 'favorites' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleToggleFolderPin(currentFolder)}>
                  {folders.find(f => f.id === currentFolder)?.isPinned ? (
                    <>
                      <PinOff className="w-4 h-4 mr-2" />
                      Unpin Folder
                    </>
                  ) : (
                    <>
                      <Pin className="w-4 h-4 mr-2" />
                      Pin Folder
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const folder = folders.find(f => f.id === currentFolder);
                  if (folder) {
                    onRenameFolder(currentFolder, folder.name);
                  }
                }}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Rename Folder
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteFolder(currentFolder)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
