"use client";

import { toast } from "sonner";
import { api } from "@/lib/trpc-client";

export function useLinksData() {
  const utils = api.useUtils();
  
  const { data: allLinks = [], isLoading: isLoadingLinks } = api.links.getAll.useQuery();
  const { data: folders = [], isLoading: isLoadingFolders } = api.folders.getAll.useQuery();
  
  return {
    allLinks,
    folders,
    isLoading: isLoadingLinks || isLoadingFolders,
    utils
  };
}

export function useLinkMutations() {
  const utils = api.useUtils();

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

  const fetchTitleMutation = api.utils.fetchTitle.useMutation();

  return {
    createLinkMutation,
    deleteLinkMutation,
    toggleFavoriteMutation,
    updateLinkMutation,
    fetchTitleMutation
  };
}

export function useFolderMutations() {
  const utils = api.useUtils();

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
      utils.links.getAll.invalidate();
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

  return {
    createFolderMutation,
    updateFolderMutation,
    deleteFolderMutation,
    toggleFolderPinMutation
  };
}
