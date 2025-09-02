import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, Mail, MapPin, Users, Calendar, ArrowLeft, GraduationCap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Conversation, Message } from '@/types/messages';

interface MobileConversationDetailProps {
  conversation: Conversation;
  onBack: () => void;
  onMessagesRead?: () => void;
}

export function MobileConversationDetail({ 
  conversation, 
  onBack, 
  onMessagesRead 
}: MobileConversationDetailProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
    // Fetch student profile details if agency is viewing
    if (profile?.user_type === 'agency') {
      fetchStudentProfile();
    }

    // Set up real-time subscription for new messages
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
          
          // Filter messages for agency users
          if (profile?.user_type === 'agency') {
            const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
            if (newMessage.sender_id !== studentId && newMessage.sender_id !== user?.id) {
              return;
            }
          }
          
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
          
          if (profile?.user_type === 'student' && newMessage.sender_id !== user?.id) {
            toast({
              title: "New message",
              description: `${newMessage.sender_name} replied to your message`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, profile?.user_type, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      let query = supabase
        .from('messages')
        .select('*')
        .eq('listing_id', conversation.listing.id);

      if (profile?.user_type === 'agency') {
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

  const fetchStudentProfile = async () => {
    try {
      const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', studentId)
        .single();
      
      if (error) {
        console.error('Error fetching student profile:', error);
        return;
      }
      
      setStudentProfile(data);
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (profile?.user_type !== 'agency') return;

    try {
      const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('listing_id', conversation.listing.id)
        .eq('sender_id', studentId)
        .eq('agency_id', profile.id)
        .is('read_at', null);
      
      if (!error) {
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
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b bg-background">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="animate-pulse bg-muted rounded h-5 w-32"></div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Mobile Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <img
          src={listingImage}
          alt={conversation.listing.title}
          className="w-10 h-10 rounded-lg object-cover"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold truncate">
            {conversation.listing.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{conversation.listing.address_line}, {conversation.listing.city}</span>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          €{conversation.listing.rent_monthly_eur}/mo
        </Badge>
      </div>

      {/* Student Details Card for Agencies */}
      {profile?.user_type === 'agency' && conversation.studentName && (
        <div className="bg-muted/50 border-b p-4 flex-shrink-0">
          <div className="text-xs font-medium text-muted-foreground mb-2">Student Details</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-3 w-3" />
              <span className="font-medium">{conversation.studentName}</span>
            </div>
            {(studentProfile?.university || conversation.lastMessage.sender_university) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                <span>{studentProfile?.university || conversation.lastMessage.sender_university}</span>
              </div>
            )}
            {(studentProfile?.phone || conversation.lastMessage.sender_phone) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{studentProfile?.phone || conversation.lastMessage.sender_phone}</span>
              </div>
            )}
            {studentProfile?.email && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{studentProfile.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3 py-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg max-w-[85%] ${
                    message.sender_id === user?.id
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-xs">{message.sender_name}</span>
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

        {/* Message Input */}
        <div className="border-t p-4 flex-shrink-0 bg-background">
          <div className="flex gap-2">
            <Textarea
              placeholder={profile?.user_type === 'agency' ? "Type your reply..." : "Type your message..."}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="resize-none flex-1"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!replyText.trim() || sending}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}