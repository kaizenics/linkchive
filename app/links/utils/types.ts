export interface Link {
  id: number;
  url: string;
  title: string;
  label: string;
  folderId: number | null;
  isFavorite: boolean;
  createdAt: Date;
}

export interface Folder {
  id: number;
  name: string;
  isPinned: boolean;
  createdAt: Date;
}

export interface NewLink {
  url: string;
  title: string;
  label: string;
  folderId: number | null;
}

export type CurrentFolder = number | null | undefined | 'all' | 'favorites';
export type SortBy = 'date' | 'alphabetical' | 'favorites';

export interface LinksPageState {
  searchQuery: string;
  currentFolder: CurrentFolder;
  sortBy: SortBy;
  isAddDialogOpen: boolean;
  isAddFolderDialogOpen: boolean;
  isRenameFolderDialogOpen: boolean;
  isMoveLinkDialogOpen: boolean;
  newLink: NewLink;
  newFolderName: string;
  renameFolderName: string;
  selectedFolderToRename: number | null;
  selectedLinkToMove: number | null;
  customLabel: string;
  selectedLabel: string;
}
