import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus, MessageSquare, Home, TrendingUp, Users, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SellSideHome = () => {
  const { profile } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const [hasListings, setHasListings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListingsCount = async () => {
      if (!profile?.user_id) return;
      
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id')
          .eq('agency_id', profile.user_id);
        
        if (!error) {
          setHasListings(data && data.length > 0);
        }
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListingsCount();
  }, [profile?.user_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">
            Manage your property listings and connect with students
          </p>
        </div>

        {!hasListings ? (
          /* First Time User - Big Create Listing Button */
          <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-12 text-center">
              <Plus className="h-20 w-20 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Create your first property listing and start connecting with students looking for accommodation.
              </p>
              <Link to="/create-listing">
                <Button size="lg" className="px-12 py-6 text-lg">
                  Create Your First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <Link to="/create-listing">
                  <CardContent className="p-6 text-center">
                    <Plus className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Add Listing</h3>
                    <p className="text-sm text-muted-foreground">
                      Post a new property
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <Link to="/my-listings">
                  <CardContent className="p-6 text-center">
                    <Home className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">My Listings</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage your properties
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
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
                    <h3 className="font-semibold mb-2">Messages</h3>
                    <p className="text-sm text-muted-foreground">
                      Chat with potential tenants
                    </p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View performance metrics
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Properties currently listed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Views across all listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{unreadCount}</div>
                  <p className="text-xs text-muted-foreground">New messages received</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Contact Us Section */}
        <Card className="bg-muted/30">
          <CardContent className="p-8">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold mb-4">Need Help Getting Started?</h3>
              <p className="text-muted-foreground mb-6">
                Our team is here to help you succeed. Whether you have questions about listings, 
                need technical support, or want to learn best practices for attracting students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Schedule a Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SellSideHome;