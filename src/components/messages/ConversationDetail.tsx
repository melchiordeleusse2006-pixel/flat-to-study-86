import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, Mail, MapPin, Users, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message } from '@/types/messages';

interface ConversationDetailProps {
  conversation: Conversation;
  onMessagesRead?: () => void;
}

export function ConversationDetail({ conversation, onMessagesRead }: ConversationDetailProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();

    // Set up real-time subscription for new messages with proper filtering
    const channelName = profile?.user_type === 'agency' 
      ? `messages-${conversation.listing.id}-${conversation.studentSenderId || conversation.lastMessage.sender_id}`
      : `messages-${conversation.listing.id}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${conversation.listing.id}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Filter messages for agency users to only show messages in their conversation
          if (profile?.user_type === 'agency') {
            const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
            if (newMessage.sender_id !== studentId && newMessage.sender_id !== user?.id) {
              return; // Not part of this conversation
            }
          }
          
          // Add message to state if not already present
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
          
          // Show notification for students when they receive agency replies
          if (profile?.user_type === 'student' && newMessage.sender_id !== user?.id) {
            toast({
              title: "New message",
              description: `${newMessage.sender_name} replied to your message`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${conversation.listing.id}`
        },
        (payload) => {
          const updatedMessage = payload.new as Message;
          
          // Update existing message in state
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, profile?.user_type, user?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('listing_id', conversation.listing.id);

      // For agencies, get all messages in this conversation (both from student and agency)
      if (profile?.user_type === 'agency') {
        // Get all messages between this agency and this specific student
        const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
        query = query.or(`sender_id.eq.${studentId},sender_id.eq.${user?.id}`);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (profile?.user_type !== 'agency') return;

    try {
      // Mark all unread messages from students in this conversation as read
      const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('listing_id', conversation.listing.id)
        .eq('sender_id', studentId) // Only mark student messages as read
        .eq('agency_id', profile.id)
        .is('read_at', null);
      
      if (!error) {
        // Trigger refresh of conversations list to update unread counts
        onMessagesRead?.();
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!replyText.trim() || !user || !profile) return;

    setSending(true);
    try {
      const messageData = {
        message: replyText.trim(),
        sender_name: profile.user_type === 'agency' 
          ? (profile.agency_name || profile.full_name || 'Agency')
          : (profile.full_name || 'Student'),
        sender_phone: profile.phone,
        sender_university: profile.user_type === 'student' ? profile.university : null,
        listing_id: conversation.listing.id,
        agency_id: conversation.agency?.id || profile.id,
        sender_id: user.id
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      // Update replied_at for the original message if this is an agency reply
      if (profile.user_type === 'agency') {
        await supabase
          .from('messages')
          .update({ replied_at: new Date().toISOString() })
          .eq('listing_id', conversation.listing.id)
          .is('replied_at', null);
      }

      setReplyText('');
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const listingImage = Array.isArray(conversation.listing.images) && conversation.listing.images.length > 0 
    ? conversation.listing.images[0] 
    : '/placeholder.svg';

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
      {/* Header - Compact */}
      <Card className="flex-shrink-0 mb-3">
        <CardHeader className="pb-3 py-3">
          <div className="flex gap-3 cursor-pointer hover:bg-muted/50 -m-3 p-3 rounded-lg transition-colors" onClick={() => window.open(`/listing/${conversation.listing.id}`, '_blank')}>
            <img
              src={listingImage}
              alt={conversation.listing.title}
              className="w-16 h-16 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <CardTitle className="text-base mb-1">{conversation.listing.title}</CardTitle>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{conversation.listing.address_line}, {conversation.listing.city}</span>
                </div>
                <Badge variant="secondary" className="text-xs">€{conversation.listing.rent_monthly_eur}/month</Badge>
              </div>
              
              {profile?.user_type === 'agency' && conversation.studentName && (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">Student:</span>
                    <span>{conversation.studentName}</span>
                  </div>
                  {conversation.lastMessage.sender_university && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{conversation.lastMessage.sender_university}</span>
                    </div>
                  )}
                  {conversation.lastMessage.sender_phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{conversation.lastMessage.sender_phone}</span>
                    </div>
                  )}
                </div>
              )}

              {profile?.user_type === 'student' && conversation.agency && (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="h-3 w-3" />
                    <span className="font-medium">Agency:</span>
                    <span>{conversation.agency.agency_name}</span>
                  </div>
                  {conversation.agency.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{conversation.agency.phone}</span>
                    </div>
                  )}
                  {conversation.agency.email && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{conversation.agency.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 py-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg max-w-[80%] ${
                      message.sender_id === user?.id
                        ? 'ml-auto bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{message.sender_name}</span>
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input Section */}
          <div className="border-t p-6 flex-shrink-0">
            <div className="space-y-3">
              <Textarea
                placeholder={profile?.user_type === 'agency' ? "Type your reply..." : "Type your message..."}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="resize-none"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={sendMessage} 
                  disabled={!replyText.trim() || sending}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}