import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageSquare, Heart, Search, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { Badge } from '@/components/ui/badge';

const StudentHome = () => {
  const { profile } = useAuth();
  const unreadCount = useUnreadMessagesCount();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Find your perfect student accommodation in Milan
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to="/messages">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <MessageSquare className="h-12 w-12 text-primary mx-auto" />
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-[1.2rem] h-5 flex items-center justify-center text-xs px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-2">My Messages</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with landlords and agencies
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to="/favorites">
              <CardContent className="p-6 text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Saved Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Your favorite properties
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to="/search">
              <CardContent className="p-6 text-center">
                <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Explore</h3>
                <p className="text-sm text-muted-foreground">
                  Discover new properties
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              No recent activity yet. Start exploring properties to see updates here!
            </p>
            <div className="text-center">
              <Link to="/search">
                <Button>Start Exploring</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentHome;