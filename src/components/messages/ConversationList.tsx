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
        // For students: Get all messages for listings they've sent messages to
        // First get the listing IDs the student has messaged about
        const { data: studentListings } = await supabase
          .from('messages')
          .select('listing_id')
          .eq('sender_id', user.id);
        
        if (!studentListings || studentListings.length === 0) {
          setConversations([]);
          setLoading(false);
          return;
        }
        
        const listingIds = [...new Set(studentListings.map(m => m.listing_id))];
        
        // Now get all messages for those listings (both student and agency messages)
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
          .in('listing_id', listingIds)
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
        // For agencies: Group by listing and student sender to avoid merging different conversations
        messages?.forEach((message: any) => {
          const listing = message.listings;
          if (!listing) return;

          const isStudentMessage = message.sender_id !== user.id;
          
          // For student messages, use listing + student ID as key
          // For agency messages, find the corresponding student conversation
          let key: string;
          let studentSenderId: string | undefined;
          
          if (isStudentMessage) {
            // Direct student message - use student ID as part of key
            key = `${listing.id}-${message.sender_id}`;
            studentSenderId = message.sender_id;
          } else {
            // Agency message - we need to find which student conversation this belongs to
            // For now, create a temporary key and we'll fix it below
            key = `${listing.id}-agency-${message.id}`;
            studentSenderId = undefined;
          }

          if (!conversationMap.has(key)) {
            conversationMap.set(key, {
              listing,
              agency: undefined,
              lastMessage: message,
              unreadCount: 0,
              studentName: isStudentMessage ? message.sender_name : undefined,
              studentSenderId: studentSenderId
            });
          } else {
            const existing = conversationMap.get(key)!;
            if (new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
              existing.lastMessage = message;
            }
          }

          // Count unread messages from students only
          if (isStudentMessage && !message.read_at) {
            const existing = conversationMap.get(key)!;
            existing.unreadCount++;
          }
        });

        // Now handle agency messages by finding their corresponding student conversations
        const agencyMessages = messages?.filter(msg => msg.sender_id === user.id) || [];
        const studentMessages = messages?.filter(msg => msg.sender_id !== user.id) || [];
        
        agencyMessages.forEach((agencyMessage: any) => {
          const listing = agencyMessage.listings;
          if (!listing) return;
          
          // Find student messages for the same listing that occurred before this agency message
          const relevantStudentMessages = studentMessages.filter(sm => 
            sm.listing_id === agencyMessage.listing_id &&
            new Date(sm.created_at) <= new Date(agencyMessage.created_at)
          );
          
          if (relevantStudentMessages.length > 0) {
            // Find the most recent student message before this agency reply
            const latestStudentMessage = relevantStudentMessages.reduce((latest, current) => 
              new Date(current.created_at) > new Date(latest.created_at) ? current : latest
            );
            
            const studentKey = `${listing.id}-${latestStudentMessage.sender_id}`;
            const conversation = conversationMap.get(studentKey);
            
            if (conversation) {
              // Update last message if this agency reply is newer
              if (new Date(agencyMessage.created_at) > new Date(conversation.lastMessage.created_at)) {
                conversation.lastMessage = agencyMessage;
              }
            } else {
              // Create new conversation if it doesn't exist
              conversationMap.set(studentKey, {
                listing,
                agency: undefined,
                lastMessage: agencyMessage,
                unreadCount: 0,
                studentName: latestStudentMessage.sender_name,
                studentSenderId: latestStudentMessage.sender_id
              });
            }
          }
        });

        // Remove temporary agency-only conversation keys
        const keysToRemove = Array.from(conversationMap.keys()).filter(key => key.includes('-agency-'));
        keysToRemove.forEach(key => conversationMap.delete(key));
      } else {
        // For students: Include all messages for listings they've messaged about
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

          // Count unread messages from agencies to students
          if (message.sender_id !== user.id && !message.read_at) {
            const existing = conversationMap.get(key)!;
            existing.unreadCount++;
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
            {(profile?.user_type === 'agency' || profile?.user_type === 'private')
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
            // For agencies and private landlords, use listing + student ID as key, for students use listing ID
            const conversationKey = (profile?.user_type === 'agency' || profile?.user_type === 'private')
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