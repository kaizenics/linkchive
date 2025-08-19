"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Navbar } from "@/components/navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Link as LinkIcon, ExternalLink, Trash2, Tags, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface SavedLink {
  id: string;
  url: string;
  title: string;
  label: string;
  createdAt: Date;
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
  const [links, setLinks] = useState<SavedLink[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState({ url: "", title: "", label: "" });
  const [customLabel, setCustomLabel] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);



  const handleAddLink = () => {
    const label = customLabel || selectedLabel;
    if (newLink.url && newLink.title && label) {
      const fullUrl = newLink.url.startsWith('http://') || newLink.url.startsWith('https://') ? newLink.url : `https://${newLink.url}`;
      
      setLinks(prev => [{
        ...newLink,
        url: fullUrl,
        id: Math.random().toString(36).substr(2, 9),
        label,
        createdAt: new Date()
      }, ...prev]);
      setNewLink({ url: "", title: "", label: "" });
      setCustomLabel("");
      setSelectedLabel("");
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteLink = (id: string) => {
    setLinks(prev => prev.filter(link => link.id !== id));
  };

  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
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
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
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

  // Filter links based on search query
  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
  <>
      <Navbar />
      <Container variant={"fullMobileConstrainedPadded"} className="flex-1 py-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="font-sans text-2xl sm:text-3xl font-semibold">Your Links</h1>
            <Button size="lg" className="w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Add New Link
            </Button>

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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddLink}>Add Link</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search your links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Links Grid */}
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <LinkIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-lexend text-xl font-medium mb-2">No links yet</h3>
              <p className="text-muted-foreground max-w-md">
                Start adding your favorite links to keep them organized and secure.
              </p>
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-lexend text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your search query to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className="group flex flex-col gap-2 p-4 rounded-xl border bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                  onClick={() => handleOpenLink(link.url)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium line-clamp-1">{link.title}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLink(link.url);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLink(link.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground line-clamp-1 flex-1">{link.url}</p>
                    <Badge variant="secondary" className="shrink-0">{link.label}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Added {link.createdAt.toLocaleDateString()}
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
