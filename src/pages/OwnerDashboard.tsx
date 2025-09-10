import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  MessageCircle, 
  TrendingUp, 
  Eye,
  Mail,
  Phone,
  MapPin,
  Calendar,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OwnerDashboardProps {
  onLogout: () => void;
}

const OwnerDashboard = ({ onLogout }: OwnerDashboardProps) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalMessages: 0,
    activeAgencies: 0,
    recentUsers: [],
    recentListings: [],
    recentMessages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      const activeAgencies = profiles?.filter(p => p.user_type === 'agency').length || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        totalListings: listings?.length || 0,
        totalMessages: messages?.length || 0,
        activeAgencies,
        recentUsers: profiles?.slice(0, 5) || [],
        recentListings: listings?.slice(0, 5) || [],
        recentMessages: messages?.slice(0, 5) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Flat2Study Owner Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Listings</p>
                  <div className="text-2xl font-bold">{stats.totalListings}</div>
                </div>
                <Building className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Messages</p>
                  <div className="text-2xl font-bold">{stats.totalMessages}</div>
                </div>
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Agencies</p>
                  <div className="text-2xl font-bold">{stats.activeAgencies}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentUsers.map((user: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{user.full_name || 'Anonymous'}</span>
                        <Badge variant={user.user_type === 'agency' ? 'default' : 'secondary'}>
                          {user.user_type}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        {user.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Listings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Recent Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentListings.map((listing: any, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium line-clamp-1">{listing.title}</span>
                        <Badge variant={listing.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                          {listing.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {listing.city}, {listing.country}
                        </div>
                        <div className="font-medium text-foreground">
                          €{listing.rent_monthly_eur}/month
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(listing.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Messages */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentMessages.map((message: any, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{message.sender_name}</span>
                      {message.sender_phone && (
                        <span className="text-sm text-muted-foreground">({message.sender_phone})</span>
                      )}
                    </div>
                    <p className="text-sm line-clamp-2">{message.message}</p>
                    {message.sender_university && (
                      <div className="text-xs text-muted-foreground mt-1">
                        University: {message.sender_university}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {formatDate(message.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;