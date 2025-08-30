import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function Messages() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

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

        {/* Messages Coming Soon */}
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg hero-gradient">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">!</span>
                </div>
              </div>
            </div>
            
            <h3 className="text-2xl font-semibold mb-4">Messages Coming Soon!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're working hard to bring you a comprehensive messaging system. 
              Soon you'll be able to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Send className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Direct Messaging</p>
                  <p className="text-sm text-muted-foreground">Chat with agencies</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Group Inquiries</p>
                  <p className="text-sm text-muted-foreground">Multiple responses</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              In the meantime, you can contact agencies directly through their listing details.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}