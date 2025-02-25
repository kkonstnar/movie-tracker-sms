import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../lib/AuthContext';
import { getUserMovie, upsertUserMovie, deleteUserMovie } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useUserMovie(movieId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ['userMovie', movieId];

  const { data: userMovie } = useQuery({
    queryKey,
    queryFn: () => getUserMovie(user!.id, movieId),
    enabled: !!user,
  });

  const { mutate: updateMovie } = useMutation({
    mutationFn: (update: Parameters<typeof upsertUserMovie>[2]) =>
      upsertUserMovie(user!.id, movieId, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Updated successfully');
    },
    onError: () => {
      toast.error('Failed to update');
    },
  });

  const { mutate: removeMovie } = useMutation({
    mutationFn: () => deleteUserMovie(user!.id, movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Removed from your list');
    },
    onError: () => {
      toast.error('Failed to remove');
    },
  });

  return {
    userMovie,
    updateMovie,
    removeMovie,
    isAuthenticated: !!user,
  };
}