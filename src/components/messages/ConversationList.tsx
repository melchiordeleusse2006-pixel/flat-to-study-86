import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationItem } from './ConversationItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Conversation } from '@/types/messages';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;
    
    fetchConversations();
  }, [user, profile]);

  const fetchConversations = async () => {
    if (!user || !profile) return;

    try {
      let query;
      
      if (profile.user_type === 'agency') {
        // For agencies: Get messages for their listings
        query = supabase
          .from('messages')
          .select(`
            *,
            listings:listing_id (
              id,
              title,
              images,
              rent_monthly_eur,
              city,
              address_line
            )
          `)
          .eq('agency_id', profile.id)
          .order('created_at', { ascending: false });
      } else {
        // For students: Get their sent messages
        query = supabase
          .from('messages')
          .select(`
            *,
            listings:listing_id (
              id,
              title,
              images,
              rent_monthly_eur,
              city,
              address_line
            ),
            profiles:agency_id (
              id,
              agency_name,
              phone,
              email
            )
          `)
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });
      }

      const { data: messages, error } = await query;

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Group messages by listing for students, by listing+student for agencies
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((message: any) => {
        const listing = message.listings;
        if (!listing) return;

        const key = profile.user_type === 'agency' 
          ? `${listing.id}-${message.sender_name}` 
          : listing.id;

        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            listing,
            agency: message.profiles,
            lastMessage: message,
            unreadCount: 0,
            studentName: profile.user_type === 'agency' ? message.sender_name : undefined
          });
        } else {
          const existing = conversationMap.get(key)!;
          if (new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
            existing.lastMessage = message;
          }
        }

        // Count unread messages (for agencies)
        if (profile.user_type === 'agency' && !message.read_at) {
          const existing = conversationMap.get(key)!;
          existing.unreadCount++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card className="h-full p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">No conversations yet</p>
          <p className="text-sm">
            {profile?.user_type === 'agency' 
              ? 'When students send inquiries about your listings, they\'ll appear here.'
              : 'Send a message to an agency through a listing to start a conversation.'
            }
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-2">
          {conversations.map((conversation) => (
            <ConversationItem
              key={`${conversation.listing.id}-${conversation.studentName || 'student'}`}
              conversation={conversation}
              isSelected={selectedConversationId === `${conversation.listing.id}-${conversation.studentName || 'student'}`}
              onClick={() => onSelectConversation(conversation)}
              userType={profile?.user_type || 'student'}
            />
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}