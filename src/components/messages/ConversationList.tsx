import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationItem } from './ConversationItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Conversation } from '@/types/messages';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export function ConversationList({ onSelectConversation, selectedConversationId }: ConversationListProps) {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
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
        // For agencies: Get all messages for their listings (both sent and received)
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

      if (profile.user_type === 'agency') {
        // For agencies: Group by listing and student sender (simpler approach)
        messages?.forEach((message: any) => {
          const listing = message.listings;
          if (!listing) return;

          // For agency messages, use the listing ID as the key (simpler grouping)
          // But track the student who initiated the conversation for display
          const key = listing.id;
          const isStudentMessage = message.sender_id !== user.id;

          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              listing,
              agency: undefined, // Agency doesn't need agency info
              lastMessage: message,
              unreadCount: 0,
              studentName: isStudentMessage ? message.sender_name : undefined,
              studentSenderId: isStudentMessage ? message.sender_id : undefined
            });
          } else {
            const existing = conversationMap.get(key)!;
            // Update last message if this is newer
            if (new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
              existing.lastMessage = message;
            }
            // Update student info if this is a student message and we don't have it yet
            if (isStudentMessage && !existing.studentName) {
              existing.studentName = message.sender_name;
              existing.studentSenderId = message.sender_id;
            }
          }

          // Count unread messages from students only
          if (isStudentMessage && !message.read_at) {
            const existing = conversationMap.get(key)!;
            existing.unreadCount++;
          }
        });
      } else {
        // For students: Group by listing, but only include their own messages
        messages?.forEach((message: any) => {
          const listing = message.listings;
          if (!listing) return;

          // Only include messages sent by the current student
          if (message.sender_id !== user.id) return;

          const key = listing.id;

          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              listing,
              agency: message.profiles,
              lastMessage: message,
              unreadCount: 0,
              studentName: undefined
            });
          } else {
            const existing = conversationMap.get(key)!;
            if (new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
              existing.lastMessage = message;
            }
          }
        });
      }

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
          <p className="text-lg font-medium mb-2">{t('messages.noConversationsYet')}</p>
          <p className="text-sm">
            {profile?.user_type === 'agency' 
              ? t('messages.noConversationsDesc')
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
          {conversations.map((conversation) => {
            // Use listing ID as key for both agencies and students (simplified)
            const conversationKey = conversation.listing.id;
            
            return (
              <ConversationItem
                key={conversationKey}
                conversation={conversation}
                isSelected={selectedConversationId === conversationKey}
                onClick={() => onSelectConversation(conversation)}
                userType={profile?.user_type || 'student'}
              />
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}