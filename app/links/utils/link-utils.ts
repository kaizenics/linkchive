import type { Link, CurrentFolder, SortBy } from "../components/types";

export function filterAndSortLinks(
  allLinks: Link[],
  currentFolder: CurrentFolder,
  searchQuery: string,
  sortBy: SortBy
): Link[] {
  let filteredLinks = allLinks;

  // Filter by folder
  if (currentFolder !== undefined) {
    if (currentFolder === 'all') {
      // Show all links when 'all' is selected
      filteredLinks = allLinks;
    } else if (currentFolder === 'favorites') {
      // Show only favorited links
      filteredLinks = allLinks.filter(link => link.isFavorite);
    } else if (currentFolder === null) {
      // Show only unfoldered links
      filteredLinks = allLinks.filter(link => link.folderId === null);
    } else {
      // Show links from specific folder
      filteredLinks = allLinks.filter(link => link.folderId === currentFolder);
    }
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
}
