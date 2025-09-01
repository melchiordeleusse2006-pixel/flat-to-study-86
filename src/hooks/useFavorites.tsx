import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites(new Set());
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching favorites:', error);
        return;
      }

      const favoriteIds = new Set(data?.map(fav => fav.listing_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (!user) return;

    const isFavorited = favorites.has(listingId);
    
    // Optimistically update UI
    const newFavorites = new Set(favorites);
    if (isFavorited) {
      newFavorites.delete(listingId);
    } else {
      newFavorites.add(listingId);
    }
    setFavorites(newFavorites);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) {
          console.error('Error removing favorite:', error);
          // Revert optimistic update
          setFavorites(favorites);
        }
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId
          });

        if (error) {
          console.error('Error adding favorite:', error);
          // Revert optimistic update
          setFavorites(favorites);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert optimistic update
      setFavorites(favorites);
    }
  };

  const isFavorited = (listingId: string) => {
    return favorites.has(listingId);
  };

  return {
    favorites,
    isFavorited,
    toggleFavorite,
    loading: loading && !!user
  };
};