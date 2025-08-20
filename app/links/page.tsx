"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Link as LinkIcon, ExternalLink, Trash2, Tags, RefreshCw, Heart, Folder, FolderPlus, ArrowUpDown, Calendar, SortAsc, Edit2, MoreVertical, FolderOpen, Pin, PinOff, ChevronDown, ChevronUp, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface SavedLink {
  id: number;
  url: string;
  title: string;
  label: string;
  userId: string;
  folderId: number | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Folder {
  id: number;
  name: string;
  userId: string;
  isPinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
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
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Fetch folders from API
  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders');
      
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }
      
      const data = await response.json();
      setFolders(data.folders.map((folder: Folder) => ({
        ...folder,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt)
      })));
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
    }
  };

  // Fetch links from API
  const fetchLinks = useCallback(async (query?: string) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      // Only filter by folder if currentFolder is explicitly set (not undefined)
      if (currentFolder !== undefined) {
        params.append('folderId', currentFolder === null ? 'null' : currentFolder.toString());
      }
      params.append('sortBy', sortBy);
      
      const url = `/api/links?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch links');
      }
      
      const data = await response.json();
      setLinks(data.links.map((link: SavedLink) => ({
        ...link,
        createdAt: new Date(link.createdAt),
        updatedAt: new Date(link.updatedAt)
      })));
    } catch (error) {
      console.error('Error fetching links:', error);
      toast.error('Failed to load links');
    } finally {
      setIsLoading(false);
    }
  }, [currentFolder, sortBy]);

  // Create new folder
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          isPinned: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const data = await response.json();
      const createdFolder = {
        ...data.folder,
        createdAt: new Date(data.folder.createdAt),
        updatedAt: new Date(data.folder.updatedAt)
      };

      setFolders(prev => [...prev, createdFolder]);
      setNewFolderName("");
      setIsAddFolderDialogOpen(false);
      toast.success('Folder created successfully!');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create new link
  const handleAddLink = async () => {
    const label = customLabel || selectedLabel;
    if (!newLink.url || !newLink.title || !label) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: newLink.url,
          title: newLink.title,
        label,
          folderId: newLink.folderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create link');
      }

      const data = await response.json();
      const createdLink = {
        ...data.link,
        createdAt: new Date(data.link.createdAt),
        updatedAt: new Date(data.link.updatedAt)
      };

      setLinks(prev => [createdLink, ...prev]);
      setNewLink({ url: "", title: "", label: "", folderId: null });
      setCustomLabel("");
      setSelectedLabel("");
      setIsAddDialogOpen(false);
      toast.success('Link added successfully!');
    } catch (error) {
      console.error('Error creating link:', error);
      toast.error('Failed to add link');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete link
  const handleDeleteLink = async (id: number) => {
    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete link');
      }

      setLinks(prev => prev.filter(link => link.id !== id));
      toast.success('Link deleted successfully!');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link');
    }
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Toggle favorite status
  const handleToggleFavorite = async (id: number) => {
    try {
      const response = await fetch(`/api/links/${id}/favorite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      
      setLinks(prev => prev.map(link => 
        link.id === id 
          ? { ...link, isFavorite: data.isFavorite } 
          : link
      ));

      toast.success(data.isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite status');
    }
  };

  // Move link to folder
  const handleMoveToFolder = async (linkId: number, folderId: number | null) => {
    try {
      const response = await fetch(`/api/links/${linkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          folderId: folderId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to move link');
      }

      const data = await response.json();
      
      setLinks(prev => prev.map(link => 
        link.id === linkId 
          ? { ...link, folderId: data.link.folderId } 
          : link
      ));

      const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'No Folder';
      toast.success(`Link moved to ${folderName}!`);
      setIsMoveLinkDialogOpen(false);
      setSelectedLinkToMove(null);
    } catch (error) {
      console.error('Error moving link:', error);
      toast.error('Failed to move link');
    }
  };

  // Rename folder
  const handleRenameFolder = async () => {
    if (!renameFolderName.trim() || !selectedFolderToRename) {
      toast.error('Please enter a folder name');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/folders/${selectedFolderToRename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: renameFolderName.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename folder');
      }

      const data = await response.json();
      const updatedFolder = {
        ...data.folder,
        createdAt: new Date(data.folder.createdAt),
        updatedAt: new Date(data.folder.updatedAt)
      };

      setFolders(prev => prev.map(folder => 
        folder.id === selectedFolderToRename ? updatedFolder : folder
      ));
      
      setRenameFolderName("");
      setSelectedFolderToRename(null);
      setIsRenameFolderDialogOpen(false);
      toast.success('Folder renamed successfully!');
    } catch (error) {
      console.error('Error renaming folder:', error);
      toast.error('Failed to rename folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete folder
  const handleDeleteFolder = async (folderId: number) => {
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete folder');
      }

      setFolders(prev => prev.filter(folder => folder.id !== folderId));
      
      // Refresh links to show updated folder assignments
      fetchLinks(searchQuery || undefined);
      
      // If we're currently viewing the deleted folder, go back to all links
      if (currentFolder === folderId) {
        setCurrentFolder(undefined);
      }
      
      toast.success('Folder deleted successfully!');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  // Toggle folder pin status
  const handleToggleFolderPin = async (folderId: number) => {
    try {
      const response = await fetch(`/api/folders/${folderId}/pin`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle folder pin');
      }

      const data = await response.json();
      
      setFolders(prev => prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, isPinned: data.isPinned } 
          : folder
      ));

      toast.success(data.isPinned ? 'Folder pinned!' : 'Folder unpinned!');
    } catch (error) {
      console.error('Error toggling folder pin:', error);
      toast.error('Failed to update folder pin status');
    }
  };

  const fetchTitleFromUrl = async (url: string) => {
    try {
      setIsFetchingTitle(true);
      
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        throw new Error('Invalid URL format');
      }

      const response = await fetch('/api/fetch-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch title');
      }

      if (data.success && data.title) {
        setNewLink(prev => ({ ...prev, title: data.title }));
      } else {
        throw new Error('No title found');
      }
    } catch (error) {
      console.error('Error fetching title:', error);
      
      try {
        const urlObj = new URL(url);
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
    } finally {
      setIsFetchingTitle(false);
    }
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

  // Handle search with debounce
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    
    // Debounce search API calls
    setTimeout(() => {
      if (searchQuery === query) {
        fetchLinks(query || undefined);
      }
    }, 300);
  };

  // Load data on component mount
  useEffect(() => {
    if (isLoaded && user) {
      fetchFolders();
      fetchLinks();
    }
  }, [isLoaded, user, fetchLinks]);

  // Refetch links when folder or sort changes
  useEffect(() => {
    if (isLoaded && user) {
      fetchLinks(searchQuery || undefined);
    }
  }, [currentFolder, sortBy, isLoaded, user, searchQuery, fetchLinks]);

  // Don't render until user is loaded
  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <Container variant={"fullMobileConstrainedPadded"} className="flex-1 py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
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
                      {newLink.url && !isFetchingTitle && (
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
                      {isFetchingTitle && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                          Fetching title...
                        </div>
                      )}
                    </label>
                    <Input
                      type="text"
                      placeholder={isFetchingTitle ? "Fetching title..." : "Link Title"}
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      disabled={isFetchingTitle}
                    />
                    {newLink.url && !isFetchingTitle && (
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
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddLink} disabled={isSubmitting || isFetchingTitle}>
                    {isSubmitting ? (
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
                <Button variant="outline" onClick={() => setIsAddFolderDialogOpen(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleAddFolder} disabled={isSubmitting || !newFolderName.trim()}>
                  {isSubmitting ? (
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
                }} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleRenameFolder} disabled={isSubmitting || !renameFolderName.trim()}>
                  {isSubmitting ? (
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
                      onClick={async () => {
                        if (!newFolderName.trim()) {
                          toast.error('Please enter a folder name');
                          return;
                        }
                        try {
                          setIsSubmitting(true);
                          const response = await fetch('/api/folders', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              name: newFolderName.trim(),
                              isPinned: false,
                            }),
                          });

                          if (!response.ok) {
                            throw new Error('Failed to create folder');
                          }

                          const data = await response.json();
                          const createdFolder = {
                            ...data.folder,
                            createdAt: new Date(data.folder.createdAt),
                            updatedAt: new Date(data.folder.updatedAt)
                          };

                          setFolders(prev => [...prev, createdFolder]);
                          handleMoveToFolder(selectedLinkToMove!, createdFolder.id);
                          setNewFolderName("");
                        } catch (error) {
                          console.error('Error creating folder:', error);
                          toast.error('Failed to create folder');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting || !newFolderName.trim()}
                    >
                      Create & Move
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
