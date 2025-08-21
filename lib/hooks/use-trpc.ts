import { api } from '@/lib/trpc-client';

/**
 * Custom hook that provides easy access to tRPC utils
 * Useful for invalidating queries, prefetching, etc.
 */
export function useTRPCUtils() {
  return api.useUtils();
}

/**
 * Example usage patterns for tRPC in your components:
 * 
 * // Basic query
 * const { data: links, isLoading } = api.links.getAll.useQuery();
 * 
 * // Query with parameters
 * const { data: link } = api.links.getById.useQuery({ id: 1 });
 * 
 * // Mutation
 * const createLink = api.links.create.useMutation({
 *   onSuccess: () => {
 *     // Invalidate and refetch links
 *     utils.links.getAll.invalidate();
 *   },
 * });
 * 
 * // Using utils for cache management
 * const utils = useTRPCUtils();
 * 
 * // Invalidate specific query
 * utils.links.getAll.invalidate();
 * 
 * // Prefetch data
 * utils.links.getAll.prefetch();
 * 
 * // Set query data manually
 * utils.links.getAll.setData(undefined, newData);
 */
