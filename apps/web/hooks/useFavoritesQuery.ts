import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFavorites, toggleFavorite } from '@/lib/favorites';

export function useFavoritesQuery() {
    const queryClient = useQueryClient();

    // Fetch all user favorites
    const { data: favorites = [], isLoading } = useQuery({
        queryKey: ['favorites'],
        queryFn: async () => await getFavorites(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Mutation to toggle favorite status
    const mutation = useMutation({
        mutationFn: async (propertyId: string) => {
            const success = await toggleFavorite(propertyId);
            if (!success) throw new Error('Toggle failed');
            return propertyId;
        },
        onMutate: async (propertyId) => {
            // Cancel pending refetches to avoid wiping pessimistic updates
            await queryClient.cancelQueries({ queryKey: ['favorites'] });
            const previousFavorites = queryClient.getQueryData<string[]>(['favorites']);

            // Optimistically update
            queryClient.setQueryData<string[]>(['favorites'], (old) => {
                if (!old) return [propertyId];
                return old.includes(propertyId)
                    ? old.filter(id => id !== propertyId)
                    : [...old, propertyId];
            });

            return { previousFavorites };
        },
        onError: (err, propertyId, context) => {
            // Revert on error
            if (context?.previousFavorites) {
                queryClient.setQueryData(['favorites'], context.previousFavorites);
            }
        },
        onSettled: () => {
            // Sync on success/error
            queryClient.invalidateQueries({ queryKey: ['favorites'] });
        },
    });

    return {
        favorites,
        isLoading,
        toggleFavorite: mutation.mutate,
        isFavorite: (id: string) => favorites.includes(id),
    };
}
