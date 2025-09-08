import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConversationList } from '@/components/messages/ConversationList';
import { ConversationDetail } from '@/components/messages/ConversationDetail';
import { ZapierWebhookSettings } from '@/components/messages/ZapierWebhookSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      
      <main className={`${isMobile ? 'px-0' : 'container max-w-6xl mx-auto'} ${isMobile ? 'pt-24' : 'py-8 pt-24'}`}>
        {isMobile ? (
          <Tabs defaultValue="messages" className="h-[calc(100vh-96px)] flex flex-col">
            {/* Mobile Header with Tabs */}
            <div className="flex-shrink-0 border-b bg-background">
              <div className="relative flex items-center justify-center p-4">
                <Link to="/" className="absolute left-4">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-3 w-3 mr-1" />
                    {t('messages.backToHome')}
                  </Button>
                </Link>
                <div className="text-center">
                  <h1 className="text-xl font-bold">{t('messages.title')}</h1>
                  <p className="text-xs text-muted-foreground">
                    {profile?.user_type === 'agency' 
                      ? t('messages.manageTenantInquiries')
                      : t('messages.conversationsWithAgencies')
                    }
                  </p>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="messages" className="text-xs">Messages</TabsTrigger>
                  <TabsTrigger value="notifications" className="text-xs">Email Setup</TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="messages" className="flex-1 overflow-hidden mt-0">
              {!showConversationDetail ? (
                <ConversationList 
                  onSelectConversation={handleSelectConversation}
                  selectedConversationId={selectedConversation ? 
                    (profile?.user_type === 'agency' 
                      ? `${selectedConversation.listing.id}-${selectedConversation.studentSenderId}`
                      : selectedConversation.listing.id) : undefined}
                  key={refreshConversations}
                />
              ) : (
                <div className="h-full overflow-hidden">
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
                  
                  <div className="h-[calc(100%-80px)]">
                    {selectedConversation && (
                      <ConversationDetail 
                        conversation={selectedConversation} 
                        onMessagesRead={() => setRefreshConversations(prev => prev + 1)}
                      />
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="flex-1 overflow-auto mt-0 p-4">
              <ZapierWebhookSettings />
            </TabsContent>
        ) : (
            {/* Header */}
            <div className="relative flex items-center justify-center mb-8">
              <Link to="/" className="absolute left-0">
                <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('messages.backToHome')}
                </Button>
              </Link>
              <div className="text-center">
                <h1 className="text-3xl font-bold">{t('messages.title')}</h1>
                <p className="text-muted-foreground">
                  {profile?.user_type === 'agency' 
                    ? t('messages.manageTenantInquiries')
                    : t('messages.conversationsWithAgencies')
                  }
                </p>
              </div>
            </div>

            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="notifications">Email Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="h-[calc(100vh-200px)]">

            {/* Messages Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden">
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
            </TabsContent>

            <TabsContent value="notifications">
              <ZapierWebhookSettings />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}