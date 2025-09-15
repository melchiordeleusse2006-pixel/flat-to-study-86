import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MessageCircle, MapPin, Calendar, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message } from '@/types/messages';

interface OwnerConversationsProps {
  onBack: () => void;
}

export function OwnerConversations({ onBack }: OwnerConversationsProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    fetchAllConversations();
  }, []);

  const fetchAllConversations = async () => {
    try {
      console.log('Fetching conversations for owner dashboard...');
      
      // Use the special owner function that bypasses RLS
      const { data: conversationData, error } = await supabase
        .rpc('get_all_conversations_for_owner');

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      console.log('Raw conversation data:', conversationData);

      // Transform the data into the expected format
      const conversations: Conversation[] = conversationData?.map((row: any) => ({
        listing: {
          id: row.listing_id,
          title: row.listing_title || 'Untitled Property',
          images: row.listing_images || [],
          rent_monthly_eur: row.listing_rent_monthly_eur || 0,
          city: row.listing_city || '',
          address_line: row.listing_address_line || ''
        },
        agency: row.agency_id ? {
          id: row.agency_id,
          agency_name: row.agency_name || 'Unknown Agency',
          phone: row.agency_phone,
          email: row.agency_email
        } : undefined,
        lastMessage: {
          id: row.last_message_id,
          message: row.last_message_content || '',
          sender_name: row.student_name || 'Unknown Student',
          created_at: row.last_message_created_at,
          listing_id: row.listing_id,
          agency_id: row.agency_id,
          sender_id: row.student_sender_id
        },
        unreadCount: 0,
        studentName: row.student_name,
        studentSenderId: row.student_sender_id
      })) || [];

      console.log('Processed conversations:', conversations);
      setConversations(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async (conversation: Conversation) => {
    setMessagesLoading(true);
    try {
      console.log('Fetching messages for conversation:', conversation.listing.id, conversation.studentSenderId);
      
      // Use the special owner function that bypasses RLS
      const { data, error } = await supabase
        .rpc('get_conversation_messages_for_owner', {
          p_listing_id: conversation.listing.id,
          p_student_sender_id: conversation.studentSenderId
        });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchConversationMessages(conversation);
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">All Conversations</h2>
          <Badge variant="secondary">{conversations.length} total</Badge>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Conversations List */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Conversations</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {conversations.map((conversation, index) => {
                  const listingImage = Array.isArray(conversation.listing.images) && conversation.listing.images.length > 0 
                    ? conversation.listing.images[0] 
                    : '/placeholder.svg';
                  
                  const isSelected = selectedConversation?.listing.id === conversation.listing.id && 
                                   selectedConversation?.studentSenderId === conversation.studentSenderId;

                  return (
                    <div
                      key={`${conversation.listing.id}-${conversation.studentSenderId || index}`}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={listingImage}
                          alt={conversation.listing.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{conversation.listing.title}</h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{conversation.listing.city}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-xs">
                              <User className="h-3 w-3" />
                              <span>{conversation.studentName || 'Student'}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(conversation.lastMessage.created_at))} ago</span>
                            </div>
                          </div>
                          {conversation.agency && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Building className="h-3 w-3" />
                              <span>{conversation.agency.agency_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Detail */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedConversation ? 'Messages (Read-Only)' : 'Select a Conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            {!selectedConversation ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            ) : messagesLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Listing Info */}
                <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="flex gap-3">
                    <img
                      src={Array.isArray(selectedConversation.listing.images) && selectedConversation.listing.images.length > 0 
                        ? selectedConversation.listing.images[0] 
                        : '/placeholder.svg'}
                      alt={selectedConversation.listing.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{selectedConversation.listing.title}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{selectedConversation.listing.address_line}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          €{selectedConversation.listing.rent_monthly_eur}/month
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1">
                  <div className="space-y-3 pr-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>No messages in this conversation</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isAgencyMessage = message.agency_id && message.sender_id !== selectedConversation.studentSenderId;
                        
                        return (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg max-w-[80%] ${
                              isAgencyMessage
                                ? 'bg-primary text-primary-foreground ml-auto'
                                : 'bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">
                                {message.sender_name}
                              </span>
                              <span className="text-xs opacity-70">
                                {formatDistanceToNow(new Date(message.created_at))} ago
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                            {message.sender_university && (
                              <div className="mt-1 text-xs opacity-70">
                                University: {message.sender_university}
                              </div>
                            )}
                            {message.sender_phone && (
                              <div className="mt-1 text-xs opacity-70">
                                Phone: {message.sender_phone}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}