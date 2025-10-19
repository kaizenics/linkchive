"use client";

import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useFolderMutations } from "../utils/hooks";

interface RenameFolderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  renameFolderName: string;
  setRenameFolderName: React.Dispatch<React.SetStateAction<string>>;
  selectedFolderToRename: number | null;
  setSelectedFolderToRename: React.Dispatch<React.SetStateAction<number | null>>;
}

export function RenameFolderDialog({
  isOpen,
  onOpenChange,
  renameFolderName,
  setRenameFolderName,
  selectedFolderToRename,
  setSelectedFolderToRename
}: RenameFolderDialogProps) {
  const { updateFolderMutation } = useFolderMutations();

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
          onOpenChange(false);
        },
      }
    );
  };

  const handleClose = () => {
    onOpenChange(false);
    setRenameFolderName("");
    setSelectedFolderToRename(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={handleClose} disabled={updateFolderMutation.isPending}>
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
  );
}
