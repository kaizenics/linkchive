"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Heart, MoreVertical, ExternalLink, Copy, Folder, Trash2 } from "lucide-react";
import { useLinkMutations } from "../utils/hooks";
import type { Link, Folder as FolderType } from "../utils/types";

interface LinkCardProps {
  link: Link;
  folders: FolderType[];
  onMoveLink: (linkId: number) => void;
}

export function LinkCard({ link, folders, onMoveLink }: LinkCardProps) {
  const { deleteLinkMutation, toggleFavoriteMutation } = useLinkMutations();

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Failed to copy link');
    }
  };

  const handleToggleFavorite = async (id: number) => {
    toggleFavoriteMutation.mutate({ id });
  };

  const handleDeleteLink = async (id: number) => {
    deleteLinkMutation.mutate({ id });
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg border bg-background hover:bg-background/80 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 cursor-pointer" onClick={() => handleOpenLink(link.url)}>
          <h3 className="font-medium line-clamp-1 flex items-center gap-2">
            {link.title}
          </h3>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(link.id);
            }}
            title={link.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${link.isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
                title="More options"
              >
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleOpenLink(link.url)}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCopyLink(link.url)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMoveLink(link.id)}>
                <Folder className="w-4 h-4 mr-2" />
                Move to Folder
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteLink(link.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleOpenLink(link.url)}>
        <p className="text-sm text-muted-foreground line-clamp-1 flex-1">{link.url}</p>
        <Badge variant="secondary" className="shrink-0">{link.label}</Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Added {link.createdAt.toLocaleDateString()}</span>
        {link.folderId && (
          <Badge variant="outline" className="text-xs">
            <Folder className="w-3 h-3 mr-1" />
            {folders.find(f => f.id === link.folderId)?.name || 'Unknown'}
          </Badge>
        )}
      </div>
    </div>
  );
}
