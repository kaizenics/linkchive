"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Tags, Folder } from "lucide-react";
import { predefinedLabels } from "../utils/constants";
import { useLinkMutations } from "../utils/hooks";
import type { NewLink, Folder as FolderType } from "../utils/types";

interface AddLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newLink: NewLink;
  setNewLink: React.Dispatch<React.SetStateAction<NewLink>>;
  customLabel: string;
  setCustomLabel: React.Dispatch<React.SetStateAction<string>>;
  selectedLabel: string;
  setSelectedLabel: React.Dispatch<React.SetStateAction<string>>;
  folders: FolderType[];
}

export function AddLinkDialog({
  isOpen,
  onOpenChange,
  newLink,
  setNewLink,
  customLabel,
  setCustomLabel,
  selectedLabel,
  setSelectedLabel,
  folders
}: AddLinkDialogProps) {
  const { createLinkMutation, fetchTitleMutation } = useLinkMutations();

  const handleAddLink = async () => {
    const label = customLabel || selectedLabel;
    if (!newLink.url || !newLink.title || !label) {
      toast.error('Please fill in all fields');
      return;
    }

    // Ensure URL has protocol
    const fullUrl = newLink.url.startsWith('http://') || newLink.url.startsWith('https://') 
      ? newLink.url 
      : `https://${newLink.url}`;

    createLinkMutation.mutate(
      {
        url: fullUrl,
        title: newLink.title,
        label,
        folderId: newLink.folderId || undefined,
      },
      {
        onSuccess: () => {
          setNewLink({ url: "", title: "", label: "", folderId: null });
          setCustomLabel("");
          setSelectedLabel("");
          onOpenChange(false);
        },
      }
    );
  };

  const fetchTitleFromUrl = async (url: string) => {
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      toast.error('Invalid URL format');
      return;
    }

    fetchTitleMutation.mutate({ url }, {
      onSuccess: (data) => {
        if (data.success && data.title) {
          setNewLink(prev => ({ ...prev, title: data.title }));
        }
      },
      onError: (error) => {
        console.error('Error fetching title:', error);

        try {
          const urlObj = new URL(newLink.url.startsWith('http') ? newLink.url : `https://${newLink.url}`);
          let fallbackTitle = urlObj.hostname.replace('www.', '');

          if (urlObj.pathname !== '/' && urlObj.pathname.length > 1) {
            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
              fallbackTitle += ' - ' + pathParts.slice(0, 2).join(' ');
            }
          }

          setNewLink(prev => ({ ...prev, title: fallbackTitle }));

          toast.warning("Couldn't fetch page title", {
            description: `Using "${fallbackTitle}" as fallback. You can edit it if needed.`,
          });
        } catch {
          setNewLink(prev => ({ ...prev, title: 'Untitled Link' }));
        }
      },
    });
  };

  const handleUrlChange = async (url: string) => {
    let cleanUrl = url;
    if (url.startsWith('https://')) {
      cleanUrl = url.replace('https://', '');
    } else if (url.startsWith('http://')) {
      cleanUrl = url.replace('http://', '');
    }

    setNewLink(prev => ({ ...prev, url: cleanUrl }));

    const fullUrl = cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://') ? cleanUrl : `https://${cleanUrl}`;

    const urlPattern = /^https?:\/\/[^\s/$.?#].[^\s]*$/;
    if (urlPattern.test(fullUrl) && (!newLink.title || newLink.title === 'Untitled Link' || newLink.title.includes(' - '))) {
      setTimeout(() => {
        if (newLink.url === cleanUrl) {
          fetchTitleFromUrl(fullUrl);
        }
      }, 1000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Link</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                  https://
                </span>
                <Input
                  type="text"
                  placeholder="example.com"
                  value={newLink.url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="pl-[70px] bg-background/50"
                />
              </div>
              {newLink.url && !fetchTitleMutation.isPending && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const fullUrl = newLink.url.startsWith('http://') || newLink.url.startsWith('https://') ? newLink.url : `https://${newLink.url}`;
                    fetchTitleFromUrl(fullUrl);
                  }}
                  className="shrink-0"
                  title="Fetch title from URL"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-2">
              Title
              {fetchTitleMutation.isPending && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                  Fetching title...
                </div>
              )}
            </label>
            <Input
              type="text"
              placeholder={fetchTitleMutation.isPending ? "Fetching title..." : "Link Title"}
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              disabled={fetchTitleMutation.isPending}
            />
            {newLink.url && !fetchTitleMutation.isPending && (
              <p className="text-xs text-muted-foreground">
                💡 Title was automatically fetched from the URL. You can edit it if needed.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Tags className="w-4 h-4" /> Label
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedLabels.map((label) => (
                <Badge
                  key={label}
                  variant={selectedLabel === label ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedLabel(label);
                    setCustomLabel("");
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                type="text"
                placeholder="Custom Label"
                value={customLabel}
                onChange={(e) => {
                  setCustomLabel(e.target.value);
                  setSelectedLabel("");
                }}
                className="flex-1"
              />
            </div>
          </div>

          {/* Folder Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Folder className="w-4 h-4" /> Folder (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={newLink.folderId === null ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setNewLink(prev => ({ ...prev, folderId: null }))}
              >
                No Folder
              </Badge>
              {folders.map((folder) => (
                <Badge
                  key={folder.id}
                  variant={newLink.folderId === folder.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setNewLink(prev => ({ ...prev, folderId: folder.id }))}
                >
                  <Folder className="w-3 h-3 mr-1" />
                  {folder.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createLinkMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleAddLink} disabled={createLinkMutation.isPending || fetchTitleMutation.isPending}>
            {createLinkMutation.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Adding...
              </>
            ) : (
              'Add Link'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
