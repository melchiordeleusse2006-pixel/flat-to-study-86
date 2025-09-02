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
        // For agencies: Group by listing and the original student sender
        // We need to identify conversations by the student who initiated them
        const studentMessages = messages?.filter(msg => msg.sender_id !== user.id) || [];
        const agencyReplies = messages?.filter(msg => msg.sender_id === user.id) || [];

        // First, create conversations for student messages
        studentMessages.forEach((message: any) => {
          const listing = message.listings;
          if (!listing) return;

          const key = `${listing.id}-${message.sender_id}`;

          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              listing,
              agency: message.profiles,
              lastMessage: message,
              unreadCount: 0,
              studentName: message.sender_name,
              studentSenderId: message.sender_id // Store the original student sender ID
            });
          } else {
            const existing = conversationMap.get(key)!;
            if (new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
              existing.lastMessage = message;
            }
          }

          // Count unread messages from students
          if (!message.read_at) {
            const existing = conversationMap.get(key)!;
            existing.unreadCount++;
          }
        });

        // Then, merge agency replies into existing conversations
        // Find the correct student for each agency reply by looking at conversation history
        agencyReplies.forEach((message: any) => {
          const listing = message.listings;
          if (!listing) return;

          // Find which student this agency message is replying to by checking the conversation history
          // Look for recent student messages on the same listing that this could be replying to
          const recentStudentMessages = studentMessages.filter(sm => 
            sm.listing_id === message.listing_id &&
            new Date(sm.created_at) <= new Date(message.created_at)
          );
          
          if (recentStudentMessages.length > 0) {
            // Find the most recent student message before this agency reply
            const latestStudentMessage = recentStudentMessages.reduce((latest, current) => 
              new Date(current.created_at) > new Date(latest.created_at) ? current : latest
            );
            
            const studentSenderId = latestStudentMessage.sender_id;
            const key = `${listing.id}-${studentSenderId}`;
            
            const conversation = conversationMap.get(key);
            if (conversation) {
              // Update last message if this reply is newer
              if (new Date(message.created_at) > new Date(conversation.lastMessage.created_at)) {
                conversation.lastMessage = message;
              }
            }
          }
        });
      } else {
        // For students: Group by listing
        messages?.forEach((message: any) => {
          const listing = message.listings;
          if (!listing) return;

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
          {conversations.map((conversation) => {
            // For agencies, use the student sender ID, for students use listing ID
            const conversationKey = profile?.user_type === 'agency' 
              ? `${conversation.listing.id}-${conversation.studentSenderId}`
              : conversation.listing.id;
            
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