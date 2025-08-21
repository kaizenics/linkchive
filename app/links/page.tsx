"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { api } from "@/lib/trpc-client";
import { Navbar } from "@/components/navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Link as LinkIcon, ExternalLink, Trash2, Tags, RefreshCw, Heart, Folder, FolderPlus, ArrowUpDown, Calendar, SortAsc, Edit2, MoreVertical, FolderOpen, Pin, PinOff, ChevronDown, ChevronUp, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const predefinedLabels = [
  "Work",
  "Personal",
  "Reading",
  "Shopping",
  "Social",
  "Education",
  "Entertainment"
];

export default function Links() {
  const { user, isLoaded } = useUser();
  const utils = api.useUtils();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [isMoveLinkDialogOpen, setIsMoveLinkDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ url: "", title: "", label: "", folderId: null as number | null });
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  const [selectedFolderToRename, setSelectedFolderToRename] = useState<number | null>(null);
  const [selectedLinkToMove, setSelectedLinkToMove] = useState<number | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [currentFolder, setCurrentFolder] = useState<number | null | undefined>(undefined);
  const [sortBy, setSortBy] = useState<'date' | 'alphabetical' | 'favorites'>('date');
  const [showAllFolders, setShowAllFolders] = useState(false);


  // tRPC Queries
  const { data: allLinks = [], isLoading: isLoadingLinks } = api.links.getAll.useQuery(undefined, {
    enabled: isLoaded && !!user,
  });
  
  const { data: folders = [], isLoading: isLoadingFolders } = api.folders.getAll.useQuery(undefined, {
    enabled: isLoaded && !!user,
  });

  // Filter and sort links based on current state
  const links = React.useMemo(() => {
    let filteredLinks = allLinks;

    // Filter by folder
    if (currentFolder !== undefined) {
      filteredLinks = allLinks.filter(link => 
        currentFolder === null ? link.folderId === null : link.folderId === currentFolder
      );
    }

    // Filter by search query
    if (searchQuery) {
      filteredLinks = filteredLinks.filter(link =>
        link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort links
    const sortedLinks = [...filteredLinks].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'favorites':
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return sortedLinks;
  }, [allLinks, currentFolder, searchQuery, sortBy]);

  const isLoading = isLoadingLinks || isLoadingFolders;

  // tRPC Mutations
  const createFolderMutation = api.folders.create.useMutation({
    onSuccess: () => {
      utils.folders.getAll.invalidate();
      toast.success('Folder created successfully!');
    },
    onError: (error) => {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    },
  });

  const createLinkMutation = api.links.create.useMutation({
    onSuccess: () => {
      utils.links.getAll.invalidate();
      toast.success('Link added successfully!');
    },
    onError: (error) => {
      console.error('Error creating link:', error);
      toast.error('Failed to add link');
    },
  });

  const deleteLinkMutation = api.links.delete.useMutation({
    onSuccess: () => {
      utils.links.getAll.invalidate();
      toast.success('Link deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    },
  });

  const toggleFavoriteMutation = api.links.toggleFavorite.useMutation({
    onSuccess: (updatedLink) => {
      utils.links.getAll.invalidate();
      toast.success(updatedLink.isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    },
  });

  const updateLinkMutation = api.links.update.useMutation({
    onSuccess: () => {
      utils.links.getAll.invalidate();
    },
    onError: (error) => {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
    },
  });

  const updateFolderMutation = api.folders.update.useMutation({
    onSuccess: () => {
      utils.folders.getAll.invalidate();
      toast.success('Folder updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating folder:', error);
      toast.error('Failed to update folder');
    },
  });

  const deleteFolderMutation = api.folders.delete.useMutation({
    onSuccess: () => {
      utils.folders.getAll.invalidate();
      utils.links.getAll.invalidate(); // Refresh links to show updated folder assignments
      toast.success('Folder deleted successfully!');
    },
    onError: (error) => {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    },
  });

  const toggleFolderPinMutation = api.folders.togglePin.useMutation({
    onSuccess: (updatedFolder) => {
      utils.folders.getAll.invalidate();
      toast.success(updatedFolder.isPinned ? 'Folder pinned!' : 'Folder unpinned!');
    },
    onError: (error) => {
      console.error('Error toggling folder pin:', error);
      toast.error('Failed to update folder pin status');
    },
  });

  // Create new folder
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    createFolderMutation.mutate(
      { name: newFolderName.trim() },
      {
        onSuccess: () => {
      setNewFolderName("");
      setIsAddFolderDialogOpen(false);
        },
      }
    );
  };

  // Create new link
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
      setIsAddDialogOpen(false);
        },
      }
    );
  };

  // Delete link
  const handleDeleteLink = async (id: number) => {
    deleteLinkMutation.mutate({ id });
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Toggle favorite status
  const handleToggleFavorite = async (id: number) => {
    toggleFavoriteMutation.mutate({ id });
  };

  // Move link to folder
  const handleMoveToFolder = async (linkId: number, folderId: number | null) => {
    updateLinkMutation.mutate(
      { id: linkId, folderId: folderId || undefined },
      {
        onSuccess: () => {
      const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'No Folder';
      toast.success(`Link moved to ${folderName}!`);
      setIsMoveLinkDialogOpen(false);
      setSelectedLinkToMove(null);
        },
    }
    );
  };

  // Rename folder
  const handleRenameFolder = async () => {
    if (!renameFolderName.trim() || !selectedFolderToRename) {
      toast.error('Please enter a folder name');
      return;
    }

    updateFolderMutation.mutate(
      { id: selectedFolderToRename, name: renameFolderName.trim() },
      {
        onSuccess: () => {
      setRenameFolderName("");
      setSelectedFolderToRename(null);
      setIsRenameFolderDialogOpen(false);
        },
      }
    );
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: number) => {
    deleteFolderMutation.mutate(
      { id: folderId },
      {
        onSuccess: () => {
      // If we're currently viewing the deleted folder, go back to all links
      if (currentFolder === folderId) {
        setCurrentFolder(undefined);
      }
        },
      }
    );
  };

  // Toggle folder pin status
  const handleToggleFolderPin = async (folderId: number) => {
    toggleFolderPinMutation.mutate({ id: folderId });
  };

  // tRPC mutation for fetching title
  const fetchTitleMutation = api.utils.fetchTitle.useMutation({
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

  const fetchTitleFromUrl = async (url: string) => {
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(url)) {
      toast.error('Invalid URL format');
      return;
    }

    fetchTitleMutation.mutate({ url });
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

  // Handle search change (no debounce needed since we filter client-side)
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  // Don't render until user is loaded
  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <Container variant={"fullMobileConstrainedPadded"} className="flex-1 py-8">
          <div className="flex items-center justify-center min-h-[70vh]">
            <Loader2 className="w-14 h-14 animate-spin" />
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container variant={"fullMobileConstrainedPadded"} className="flex-1 py-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <h1 className="font-sans text-2xl sm:text-3xl font-semibold">
                  {currentFolder === undefined ? 'All Links' :
                    currentFolder === null ? 'Unfoldered Links' :
                      folders.find(f => f.id === currentFolder)?.name || 'Folder'}
                </h1>
                {currentFolder !== undefined && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentFolder(undefined)}
                    className="text-muted-foreground"
                  >
                    ← Back to All Links
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
                    <DropdownMenuItem onClick={() => setIsAddDialogOpen(true)}>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Add Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAddFolderDialogOpen(true)}>
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
                    <DropdownMenuItem onClick={() => setSortBy('date')}>
                      <Calendar className="w-4 h-4 mr-1" />
                      Date Added
                      {sortBy === 'date' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                      <SortAsc className="w-4 h-4 mr-1" />
                      Alphabetical
                      {sortBy === 'alphabetical' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('favorites')}>
                      <Heart className="w-4 h-4 mr-1" />
                      Favorites First
                      {sortBy === 'favorites' && <Check className="w-4 h-4 ml-auto" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Folder Management Menu - Only show when viewing a specific folder */}
                {currentFolder !== undefined && currentFolder !== null && (
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
                        setSelectedFolderToRename(currentFolder);
                        setRenameFolderName(folders.find(f => f.id === currentFolder)?.name || '');
                        setIsRenameFolderDialogOpen(true);
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

            {/* Folders Navigation */}
            {isLoading ? (
              <div className="flex gap-2 flex-wrap items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-18" />
              </div>
            ) : folders.length > 0 ? (
              <div className="flex gap-2 flex-wrap items-center">
                <Badge
                  variant={currentFolder === undefined ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCurrentFolder(undefined)}
                >
                  <LinkIcon className="w-3 h-3 mr-1" />
                  All Links
                </Badge>
                <Badge
                  variant={currentFolder === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setCurrentFolder(null)}
                >
                  <FolderOpen className="w-3 h-3 mr-1" />
                  Unfoldered
                </Badge>

                {/* Display folders with limit */}
                {(() => {
                  const FOLDER_DISPLAY_LIMIT = 5;
                  const foldersToShow = showAllFolders ? folders : folders.slice(0, FOLDER_DISPLAY_LIMIT);

                  return (
                    <>
                      {foldersToShow.map((folder) => (
                        <Badge
                          key={folder.id}
                          variant={currentFolder === folder.id ? "default" : "outline"}
                          className="cursor-pointer flex items-center gap-1"
                          onClick={() => setCurrentFolder(folder.id)}
                        >
                          {folder.isPinned && <Pin className="w-3 h-3" />}
                          <Folder className="w-3 h-3" />
                          {folder.name}
                        </Badge>
                      ))}

                      {/* Show All / Show Less button */}
                      {folders.length > FOLDER_DISPLAY_LIMIT && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAllFolders(!showAllFolders)}
                          className="h-6 px-2 text-xs"
                        >
                          {showAllFolders ? (
                            <>
                              <ChevronUp className="w-3 h-3 mr-1" />
                              Show Less
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3 mr-1" />
                              Show All ({folders.length - FOLDER_DISPLAY_LIMIT} more)
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : null}
          </div>

          {/* Add Link Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={createLinkMutation.isPending}>
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

          {/* Add Folder Dialog */}
          <Dialog open={isAddFolderDialogOpen} onOpenChange={setIsAddFolderDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Folder Name</label>
                  <Input
                    type="text"
                    placeholder="Enter folder name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddFolderDialogOpen(false)} disabled={createFolderMutation.isPending}>
                  Cancel
                </Button>
                <Button onClick={handleAddFolder} disabled={createFolderMutation.isPending || !newFolderName.trim()}>
                  {createFolderMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Folder'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Rename Folder Dialog */}
          <Dialog open={isRenameFolderDialogOpen} onOpenChange={setIsRenameFolderDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Folder</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Folder Name</label>
                  <Input
                    type="text"
                    placeholder="Enter new folder name"
                    value={renameFolderName}
                    onChange={(e) => setRenameFolderName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsRenameFolderDialogOpen(false);
                  setRenameFolderName("");
                  setSelectedFolderToRename(null);
                }} disabled={updateFolderMutation.isPending}>
                  Cancel
                </Button>
                <Button onClick={handleRenameFolder} disabled={updateFolderMutation.isPending || !renameFolderName.trim()}>
                  {updateFolderMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      Renaming...
                    </>
                  ) : (
                    'Rename Folder'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Move Link to Folder Dialog */}
          <Dialog open={isMoveLinkDialogOpen} onOpenChange={setIsMoveLinkDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Move Link to Folder</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Choose a folder to move this link to, or create a new folder.
                </p>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Select Folder</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => handleMoveToFolder(selectedLinkToMove!, null)}
                    >
                      <FolderOpen className="w-3 h-3 mr-1" />
                      No Folder
                    </Badge>
                    {folders.map((folder) => (
                      <Badge
                        key={folder.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => handleMoveToFolder(selectedLinkToMove!, folder.id)}
                      >
                        <Folder className="w-3 h-3 mr-1" />
                        {folder.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-border"></div>
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Create New Folder</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="New folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        if (!newFolderName.trim()) {
                          toast.error('Please enter a folder name');
                          return;
                        }
                        
                        createFolderMutation.mutate(
                          { name: newFolderName.trim() },
                          {
                            onSuccess: (createdFolder) => {
                          handleMoveToFolder(selectedLinkToMove!, createdFolder.id);
                          setNewFolderName("");
                            },
                          }
                        );
                      }}
                      disabled={createFolderMutation.isPending || !newFolderName.trim()}
                    >
                      {createFolderMutation.isPending ? 'Creating...' : 'Create & Move'}
                    </Button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsMoveLinkDialogOpen(false);
                  setSelectedLinkToMove(null);
                  setNewFolderName("");
                }}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your links..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Links Grid */}
          {isLoading ? (
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
          ) : links.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col gap-3 p-4 rounded-lg border bg-background hover:bg-background/80 transition-colors"
                >
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
                          <DropdownMenuItem onClick={() => {
                            setSelectedLinkToMove(link.id);
                            setIsMoveLinkDialogOpen(true);
                          }}>
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
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
