import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationDetail } from '@/components/messages/ConversationDetail';
import type { Conversation } from '@/types/messages';

export default function Messages() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [refreshConversations, setRefreshConversations] = useState(0);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-6xl mx-auto py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg hero-gradient">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Messages</h1>
            <p className="text-muted-foreground">
              {profile?.user_type === 'agency' 
                ? 'Manage inquiries from potential tenants' 
                : 'Your conversations with property agencies'
              }
            </p>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)] overflow-hidden">
          {/* Conversations List - Fixed */}
          <div className="h-full overflow-hidden">
            <ConversationList 
              onSelectConversation={setSelectedConversation}
              selectedConversationId={selectedConversation ? 
                (profile?.user_type === 'agency' 
                  ? `${selectedConversation.listing.id}-${selectedConversation.studentSenderId}`
                  : selectedConversation.listing.id) : undefined}
              key={refreshConversations}
            />
          </div>

          {/* Conversation Detail - Independently Scrollable */}
          <div className="h-full overflow-hidden">
            {selectedConversation ? (
              <ConversationDetail 
                conversation={selectedConversation} 
                onMessagesRead={() => setRefreshConversations(prev => prev + 1)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/10 rounded-lg border border-dashed border-muted-foreground/25">
                <div className="text-center p-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list to view messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}