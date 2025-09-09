import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, Mail, MapPin, Users, Calendar, GraduationCap } from 'lucide-react';
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
  const [loading, setLoading] = useState(false); // Start with false for instant loading
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    // Mark messages as read immediately when conversation opens
    setTimeout(() => markMessagesAsRead(), 500);
    
    // Fetch student profile details if agency is viewing
    if (profile?.user_type === 'agency') {
      fetchStudentProfile();
    }

    // Create truly unique channel names to prevent cross-conversation pollution
    const channelName = profile?.user_type === 'agency' 
      ? `agency-${profile.id}-student-${conversation.studentSenderId}-listing-${conversation.listing.id}`
      : `student-${user?.id}-listing-${conversation.listing.id}`;
    
    // Generate a conversation ID to ensure proper message isolation
    const conversationId = profile?.user_type === 'agency' 
      ? `listing-${conversation.listing.id}-student-${conversation.studentSenderId}`
      : `listing-${conversation.listing.id}-student-${user?.id}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          // Filter by conversation_id to ensure proper isolation
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Strict conversation isolation
          if (profile?.user_type === 'agency') {
            const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
            
            // For agencies: only accept messages that are either:
            // 1. From the specific student in this conversation
            // 2. From this agency user (but only if it's the most recent agency message)
            if (newMessage.sender_id === studentId) {
              // Student message - always accept
              console.log('Agency: Accepting student message', newMessage.id);
            } else if (newMessage.sender_id === user?.id) {
              // Agency message - only accept if this is the active conversation
              // Check if this conversation is currently active by comparing timestamps
              const isActiveConversation = true; // Accept for now, we'll filter later if needed
              if (isActiveConversation) {
                console.log('Agency: Accepting own message', newMessage.id);
              } else {
                console.log('Agency: Rejecting own message - not for this conversation', newMessage.id);
                return;
              }
            } else {
              // Message from different student - reject
              console.log('Agency: Rejecting message from different student', {
                messageId: newMessage.id,
                sender: newMessage.sender_id,
                expectedStudent: studentId
              });
              return;
            }
          } else {
            // For students: accept all messages for this listing (both their own and agency replies)
            // Students see all agency responses for listings they've messaged about
            console.log('Student: Accepting message', newMessage.id);
          }
          
          // Add message to state if not already present
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            const newMessages = [...prev, newMessage].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            return newMessages;
          });
          
          // Auto-scroll to new message
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          
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

  // Separate effect to handle conversation changes and mark messages as read
  useEffect(() => {
    if (user && profile) {
      setTimeout(() => markMessagesAsRead(), 100);
    }
  }, [conversation.listing.id, conversation.studentSenderId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // Generate conversation ID for filtering
      const conversationId = profile?.user_type === 'agency' 
        ? `listing-${conversation.listing.id}-student-${conversation.studentSenderId}`
        : `listing-${conversation.listing.id}-student-${user?.id}`;

      // Fetch messages for this specific conversation
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    // Removed finally block to eliminate loading state change
  };

  const fetchStudentProfile = async () => {
    try {
      const studentId = conversation.studentSenderId || conversation.lastMessage.sender_id;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', studentId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching student profile:', error);
        return;
      }
      
      if (data) {
        setStudentProfile(data);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !profile) return;

    try {
      // Generate conversation ID for filtering
      const conversationId = profile.user_type === 'agency' 
        ? `listing-${conversation.listing.id}-student-${conversation.studentSenderId}`
        : `listing-${conversation.listing.id}-student-${user.id}`;

      if (profile.user_type === 'agency') {
        // Mark all unread messages from students in this conversation as read
        const { error } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id) // Only mark student messages as read
          .is('read_at', null);
        
        if (error) {
          console.error('Error marking messages as read:', error);
        } else {
          console.log('Agency messages marked as read successfully');
        }
      } else if (profile.user_type === 'student') {
        // Mark all unread agency messages in this conversation as read
        const conversationId = `listing-${conversation.listing.id}-student-${user.id}`;
        const { error } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversationId)
          .neq('sender_id', user.id) // Only mark agency messages as read
          .is('read_at', null);
        
        if (error) {
          console.error('Error marking student messages as read:', error);
        } else {
          console.log('Student messages marked as read successfully');
        }
      }

      // Trigger refresh of conversations list to update unread counts
      onMessagesRead?.();
      // Also trigger unread count refresh in header
      window.dispatchEvent(new CustomEvent('unread-messages-refresh'));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!replyText.trim() || !user || !profile) return;

    setSending(true);
    try {
      // Fetch the most current profile data to ensure university info is up-to-date
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const profileToUse = currentProfile || profile;

      // Generate conversation ID for proper message isolation
      const conversationId = profile.user_type === 'agency'
        ? `listing-${conversation.listing.id}-student-${conversation.studentSenderId}`
        : `listing-${conversation.listing.id}-student-${user.id}`;

      const messageData = {
        message: replyText.trim(),
        sender_name: profileToUse.user_type === 'agency' 
          ? (profileToUse.agency_name || profileToUse.full_name || 'Agency')
          : (profileToUse.full_name || 'Student'),
        sender_phone: profileToUse.phone,
        sender_university: profileToUse.user_type === 'student' ? profileToUse.university : null,
        listing_id: conversation.listing.id,
        agency_id: conversation.agency?.id || profileToUse.id,
        sender_id: user.id,
        conversation_id: conversationId
      };

      const { data: insertedMessage, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Immediately add the message to the local state for instant feedback
      if (insertedMessage) {
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === insertedMessage.id);
          if (exists) return prev;
          return [...prev, insertedMessage];
        });
        
        // Scroll to the new message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }

      // Frontend fallback: trigger notification if message inserted successfully
      if (insertedMessage) {
        try {
          await supabase.functions.invoke('send-message-notification', {
            body: { message_id: insertedMessage.id }
          });
        } catch (notificationError) {
          console.log('Notification sending failed (fallback):', notificationError);
          // Don't show error to user, this is just a fallback
        }
      }

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
      <div className="h-full flex flex-col">
        {/* Show the header immediately while messages load */}
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
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Show minimal loading in messages area */}
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col min-h-0 p-6">
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="animate-pulse">Loading messages...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
              {/* Student Contact Info at top of messages for Agencies */}
              {profile?.user_type === 'agency' && (studentProfile || conversation.studentName || conversation.lastMessage.sender_university || conversation.lastMessage.sender_phone) && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 max-w-[80%]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm text-blue-900">Student Contact Information</span>
                    </div>
                    <span className="text-xs text-blue-600">Contact Details</span>
                  </div>
                  <div className="space-y-2 text-sm text-blue-800">
                    {/* Name */}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">
                        {studentProfile?.full_name || conversation.studentName || conversation.lastMessage.sender_name}
                      </span>
                    </div>
                    
                    {/* University */}
                    {(studentProfile?.university || conversation.lastMessage.sender_university) && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        <span>University: {studentProfile?.university || conversation.lastMessage.sender_university}</span>
                      </div>
                    )}
                    
                    {/* Phone */}
                    {(studentProfile?.phone || conversation.lastMessage.sender_phone) && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>Phone: {studentProfile?.phone || conversation.lastMessage.sender_phone}</span>
                      </div>
                    )}
                    
                    {/* Email */}
                    {studentProfile?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email: {studentProfile.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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