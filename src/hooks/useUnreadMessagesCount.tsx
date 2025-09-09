import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function useUnreadMessagesCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!user || !profile) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        let query = supabase.from('messages').select('id');

        if (profile.user_type === 'agency') {
          // For agencies: count unread messages TO them from students
          query = query
            .eq('agency_id', profile.id)
            .neq('sender_id', user.id) // Only count messages not sent by the agency
            .is('read_at', null);
        } else if (profile.user_type === 'student') {
          // For students: count unread messages FROM agencies to them
          query = query
            .eq('sender_id', user.id) // Messages sent by this student
            .is('replied_at', null); // That haven't been replied to yet
          
          // Actually, let's count agency replies that the student hasn't seen
          query = supabase
            .from('messages')
            .select('id')
            .neq('sender_id', user.id) // Messages not sent by this student (i.e., from agencies)
            .is('read_at', null); // That haven't been read by the student
            
          // Filter to only messages for listings the student has messaged about
          const { data: studentMessages } = await supabase
            .from('messages')
            .select('listing_id')
            .eq('sender_id', user.id);
            
          if (studentMessages && studentMessages.length > 0) {
            const listingIds = [...new Set(studentMessages.map(m => m.listing_id))];
            query = query.in('listing_id', listingIds);
          } else {
            // Student hasn't sent any messages, so no unread count
            setUnreadCount(0);
            return;
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching unread messages count:', error);
          return;
        }

        setUnreadCount(data?.length || 0);
      } catch (error) {
        console.error('Error in fetchUnreadCount:', error);
      }
    };

    fetchUnreadCount();

    // Subscribe to new messages for real-time updates
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: profile.user_type === 'agency' 
            ? `agency_id=eq.${profile.id}`
            : `sender_id=neq.${user.id}` // For students, listen to messages not sent by them
        },
        () => {
          fetchUnreadCount();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: profile.user_type === 'agency' 
            ? `agency_id=eq.${profile.id}`
            : `sender_id=neq.${user.id}` // For students, listen to updates to messages not sent by them
        },
        () => {
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Listen for manual refresh events when messages are read
    const handleUnreadRefresh = () => {
      fetchUnreadCount();
    };

    window.addEventListener('unread-messages-refresh', handleUnreadRefresh);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('unread-messages-refresh', handleUnreadRefresh);
    };
  }, [user, profile]);

  return unreadCount;
}