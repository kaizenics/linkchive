"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Folder, FolderOpen } from "lucide-react";
import { useLinkMutations, useFolderMutations } from "../utils/hooks";
import type { Folder as FolderType } from "../utils/types";

interface MoveLinkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLinkToMove: number | null;
  setSelectedLinkToMove: React.Dispatch<React.SetStateAction<number | null>>;
  folders: FolderType[];
  newFolderName: string;
  setNewFolderName: React.Dispatch<React.SetStateAction<string>>;
}

export function MoveLinkDialog({
  isOpen,
  onOpenChange,
  selectedLinkToMove,
  setSelectedLinkToMove,
  folders,
  newFolderName,
  setNewFolderName
}: MoveLinkDialogProps) {
  const { updateLinkMutation } = useLinkMutations();
  const { createFolderMutation } = useFolderMutations();

  const handleMoveToFolder = async (linkId: number, folderId: number | null) => {
    updateLinkMutation.mutate(
      { id: linkId, folderId: folderId || undefined },
      {
        onSuccess: () => {
          const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'No Folder';
          toast.success(`Link moved to ${folderName}!`);
          onOpenChange(false);
          setSelectedLinkToMove(null);
        },
      }
    );
  };

  const handleCreateAndMove = () => {
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
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedLinkToMove(null);
    setNewFolderName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                onClick={handleCreateAndMove}
                disabled={createFolderMutation.isPending || !newFolderName.trim()}
              >
                {createFolderMutation.isPending ? 'Creating...' : 'Create & Move'}
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
