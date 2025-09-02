import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationDetail } from '@/components/messages/ConversationDetail';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import type { Conversation } from '@/types/messages';

export default function Messages() {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [refreshConversations, setRefreshConversations] = useState(0);
  const [showConversationDetail, setShowConversationDetail] = useState(false);

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
              <p className="text-muted-foreground">{t('messages.loadingMessages')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowConversationDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowConversationDetail(false);
    setSelectedConversation(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className={`${isMobile ? 'px-0' : 'container max-w-6xl mx-auto'} ${isMobile ? 'pt-16' : 'py-8'}`}>
        {/* Mobile: Show either conversation list or detail */}
        {isMobile ? (
          <>
            {!showConversationDetail ? (
              /* Mobile Conversation List */
              <div className="h-[calc(100vh-64px)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 border-b bg-background">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg hero-gradient">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{t('messages.title')}</h1>
                    <p className="text-xs text-muted-foreground">
                      {profile?.user_type === 'agency' 
                        ? t('messages.manageTenantInquiries')
                        : t('messages.conversationsWithAgencies')
                      }
                    </p>
                  </div>
                </div>
                
                <div className="h-[calc(100vh-120px)] overflow-hidden">
                  <ConversationList 
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation ? 
                      (profile?.user_type === 'agency' 
                        ? `${selectedConversation.listing.id}-${selectedConversation.studentSenderId}`
                        : selectedConversation.listing.id) : undefined}
                    key={refreshConversations}
                  />
                </div>
              </div>
            ) : (
              /* Mobile Conversation Detail */
              <div className="h-[calc(100vh-64px)] overflow-hidden">
                {/* Mobile Header with Back Button */}
                <div className="flex items-center gap-3 p-4 border-b bg-background">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleBackToList}
                    className="p-2"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold truncate">
                      {selectedConversation?.listing.title}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation?.listing.address_line}, {selectedConversation?.listing.city}
                    </p>
                  </div>
                </div>
                
                <div className="h-[calc(100vh-120px)]">
                  {selectedConversation && (
                    <ConversationDetail 
                      conversation={selectedConversation} 
                      onMessagesRead={() => setRefreshConversations(prev => prev + 1)}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Desktop: Side-by-side layout */
          <>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg hero-gradient">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t('messages.title')}</h1>
                <p className="text-muted-foreground">
                  {profile?.user_type === 'agency' 
                    ? t('messages.manageTenantInquiries')
                    : t('messages.conversationsWithAgencies')
                  }
                </p>
              </div>
            </div>

            {/* Messages Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)] overflow-hidden">
              {/* Conversations List - Fixed */}
              <div className="h-full overflow-hidden">
                <ConversationList 
                  onSelectConversation={handleSelectConversation}
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
                        {t('messages.selectConversation')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('messages.selectConversationDesc')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}