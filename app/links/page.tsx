"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Plus, Search, Link as LinkIcon, ExternalLink, Trash2, Tags } from "lucide-react";
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

  const handleAddLink = () => {
    const label = customLabel || selectedLabel;
    if (newLink.url && newLink.title && label) {
      setLinks(prev => [{
        ...newLink,
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Container variant={"fullMobileBreakpointPadded"} className="flex-1 py-8">
        <div className="flex flex-col gap-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="font-lexend text-2xl sm:text-3xl font-semibold">Your Links</h1>
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
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      placeholder="Link Title"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
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
                      <input
                        type="text"
                        placeholder="Custom Label"
                        value={customLabel}
                        onChange={(e) => {
                          setCustomLabel(e.target.value);
                          setSelectedLabel("");
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            <input
              type="text"
              placeholder="Search your links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="group flex flex-col gap-2 p-4 rounded-xl border bg-background/50 hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium line-clamp-1">{link.title}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground line-clamp-1">{link.url}</p>
                    <Badge variant="secondary" className="shrink-0">{link.label}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
