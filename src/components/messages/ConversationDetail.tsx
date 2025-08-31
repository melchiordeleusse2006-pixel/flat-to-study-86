import { useState, useEffect } from 'react';
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
}

export function ConversationDetail({ conversation }: ConversationDetailProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
  }, [conversation]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('listing_id', conversation.listing.id);

      // For agencies, filter by sender_id to avoid mixing conversations
      if (profile?.user_type === 'agency') {
        query = query.eq('sender_id', conversation.lastMessage.sender_id);
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
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('listing_id', conversation.listing.id)
        .eq('sender_id', conversation.lastMessage.sender_id)
        .eq('agency_id', profile.id)
        .is('read_at', null);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !user || !profile || profile.user_type !== 'agency') return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          message: replyText.trim(),
          sender_name: profile.agency_name || profile.full_name || 'Agency',
          sender_phone: profile.phone,
          listing_id: conversation.listing.id,
          agency_id: profile.id,
          sender_id: user.id
        });

      if (error) throw error;

      // Update replied_at for the original message
      await supabase
        .from('messages')
        .update({ replied_at: new Date().toISOString() })
        .eq('listing_id', conversation.listing.id)
        .is('replied_at', null);

      setReplyText('');
      fetchMessages();
      
      toast({
        title: "Reply sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending reply:', error);
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
      {/* Header */}
      <Card className="flex-shrink-0 mb-4">
        <CardHeader className="pb-4">
          <div className="flex gap-4">
            <img
              src={listingImage}
              alt={conversation.listing.title}
              className="w-20 h-20 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{conversation.listing.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{conversation.listing.address_line}, {conversation.listing.city}</span>
                </div>
                <Badge variant="secondary">€{conversation.listing.rent_monthly_eur}/month</Badge>
              </div>
              
              {/* Contact Info */}
              {profile?.user_type === 'agency' && conversation.studentName && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Student:</span>
                    <span>{conversation.studentName}</span>
                  </div>
                  {conversation.lastMessage.sender_university && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{conversation.lastMessage.sender_university}</span>
                    </div>
                  )}
                  {conversation.lastMessage.sender_phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{conversation.lastMessage.sender_phone}</span>
                    </div>
                  )}
                </div>
              )}

              {profile?.user_type === 'student' && conversation.agency && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Agency:</span>
                    <span>{conversation.agency.agency_name}</span>
                  </div>
                  {conversation.agency.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{conversation.agency.phone}</span>
                    </div>
                  )}
                  {conversation.agency.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
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
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
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
              ))}
            </div>
          </ScrollArea>

          {/* Reply Section (only for agencies) */}
          {profile?.user_type === 'agency' && (
            <div className="mt-4 space-y-3">
              <Textarea
                placeholder="Type your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="resize-none"
                rows={3}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={sendReply} 
                  disabled={!replyText.trim() || sending}
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}