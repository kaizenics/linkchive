"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { Container } from "@/components/ui/container";
import { Loader2 } from "lucide-react";
import {
  AddLinkDialog,
  AddFolderDialog,
  RenameFolderDialog,
  MoveLinkDialog,
  FolderGrid,
  LinksGrid,
  SearchBar,
  PageHeader,
  useLinksData,
  filterAndSortLinks,
  type CurrentFolder,
  type SortBy,
  type NewLink
} from "./utils";

export default function Links() {
  const { user, isLoaded } = useUser();
  const { allLinks, folders, isLoading } = useLinksData();
  
  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddFolderDialogOpen, setIsAddFolderDialogOpen] = useState(false);
  const [isRenameFolderDialogOpen, setIsRenameFolderDialogOpen] = useState(false);
  const [isMoveLinkDialogOpen, setIsMoveLinkDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState<NewLink>({ url: "", title: "", label: "", folderId: null });
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  const [selectedFolderToRename, setSelectedFolderToRename] = useState<number | null>(null);
  const [selectedLinkToMove, setSelectedLinkToMove] = useState<number | null>(null);
  const [customLabel, setCustomLabel] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [currentFolder, setCurrentFolder] = useState<CurrentFolder>(undefined);
  const [sortBy, setSortBy] = useState<SortBy>('date');

  // Filter and sort links based on current state
  const links = React.useMemo(() => {
    return filterAndSortLinks(allLinks, currentFolder, searchQuery, sortBy);
  }, [allLinks, currentFolder, searchQuery, sortBy]);

  // Event handlers
  const handleMoveLink = (linkId: number) => {
    setSelectedLinkToMove(linkId);
    setIsMoveLinkDialogOpen(true);
  };

  const handleRenameFolder = (folderId: number, folderName: string) => {
    setSelectedFolderToRename(folderId);
    setRenameFolderName(folderName);
    setIsRenameFolderDialogOpen(true);
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
          <PageHeader
            currentFolder={currentFolder}
            folders={folders}
            sortBy={sortBy}
            onFolderChange={setCurrentFolder}
            onSortChange={setSortBy}
            onAddLink={() => setIsAddDialogOpen(true)}
            onAddFolder={() => setIsAddFolderDialogOpen(true)}
            onRenameFolder={handleRenameFolder}
          />

          {/* File Manager Style Folders */}
          {currentFolder === undefined && (
            <FolderGrid
              isLoading={isLoading}
              allLinks={allLinks}
              folders={folders}
              onFolderClick={setCurrentFolder}
            />
          )}

          {/* Dialogs */}
          <AddLinkDialog
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            newLink={newLink}
            setNewLink={setNewLink}
            customLabel={customLabel}
            setCustomLabel={setCustomLabel}
            selectedLabel={selectedLabel}
            setSelectedLabel={setSelectedLabel}
            folders={folders}
          />

          <AddFolderDialog
            isOpen={isAddFolderDialogOpen}
            onOpenChange={setIsAddFolderDialogOpen}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
          />

          <RenameFolderDialog
            isOpen={isRenameFolderDialogOpen}
            onOpenChange={setIsRenameFolderDialogOpen}
            renameFolderName={renameFolderName}
            setRenameFolderName={setRenameFolderName}
            selectedFolderToRename={selectedFolderToRename}
            setSelectedFolderToRename={setSelectedFolderToRename}
          />

          <MoveLinkDialog
            isOpen={isMoveLinkDialogOpen}
            onOpenChange={setIsMoveLinkDialogOpen}
            selectedLinkToMove={selectedLinkToMove}
            setSelectedLinkToMove={setSelectedLinkToMove}
            folders={folders}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
          />

          {/* Search Bar - Only show when viewing links inside a folder */}
          {currentFolder !== undefined && (
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {/* Links Grid - Only show when viewing links inside a folder */}
          {currentFolder !== undefined && (
            <LinksGrid
              isLoading={isLoading}
              links={links}
              folders={folders}
              searchQuery={searchQuery}
              onMoveLink={handleMoveLink}
            />
          )}
        </div>
      </Container>
    </>
  );
}
