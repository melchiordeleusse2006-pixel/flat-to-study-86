import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  LogOut,
  ChevronDown,
  ChevronRight,
  Filter
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
    allUsers: [],
    recentListings: [],
    recentMessages: []
  });
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [emailDomainFilter, setEmailDomainFilter] = useState<string>('');

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
        allUsers: profiles || [],
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

  const toggleUserExpansion = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const filteredUsers = useMemo(() => {
    let users = showAllUsers ? stats.allUsers : stats.recentUsers;
    
    // Filter by user type
    if (userTypeFilter !== 'all') {
      users = users.filter((user: any) => user.user_type === userTypeFilter);
    }
    
    // Filter by email domain
    if (emailDomainFilter.trim()) {
      users = users.filter((user: any) => 
        user.email && user.email.toLowerCase().includes(emailDomainFilter.toLowerCase())
      );
    }
    
    return users;
  }, [stats.allUsers, stats.recentUsers, showAllUsers, userTypeFilter, emailDomainFilter]);

  const uniqueUserTypes = useMemo(() => {
    const types = new Set(stats.allUsers.map((user: any) => user.user_type));
    return Array.from(types);
  }, [stats.allUsers]);

  const uniqueEmailDomains = useMemo(() => {
    const domains = new Set(
      stats.allUsers
        .filter((user: any) => user.email)
        .map((user: any) => user.email.split('@')[1])
        .filter(Boolean)
    );
    return Array.from(domains).sort();
  }, [stats.allUsers]);

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
        <div className="grid grid-cols-1 gap-8">
          {/* Customer Database */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center mb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Database ({filteredUsers.length} of {stats.totalUsers} total)
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAllUsers(!showAllUsers)}
                >
                  {showAllUsers ? 'Show Recent' : 'Show All'}
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm">Type:</span>
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueUserTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm">Email Domain:</span>
                  <Select value={emailDomainFilter} onValueChange={setEmailDomainFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All domains" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Domains</SelectItem>
                      {uniqueEmailDomains.map((domain) => (
                        <SelectItem key={domain} value={domain}>
                          @{domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(userTypeFilter !== 'all' || emailDomainFilter) && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setUserTypeFilter('all');
                      setEmailDomainFilter('');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.map((user: any, index) => {
                  const isExpanded = expandedUsers.has(user.id);
                  return (
                    <div key={index} className="border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                      {/* Compact Header - Always Visible */}
                      <div 
                        className="p-3 cursor-pointer flex items-center justify-between"
                        onClick={() => toggleUserExpansion(user.id)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">
                            {user.full_name || 'Anonymous User'}
                          </span>
                          <Badge variant={user.user_type === 'agency' ? 'default' : user.user_type === 'student' ? 'secondary' : 'outline'}>
                            {user.user_type}
                          </Badge>
                          {user.email && (
                            <span className="text-sm text-muted-foreground">
                              @{user.email.split('@')[1]}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(user.created_at)}
                        </div>
                      </div>

                      {/* Expanded Details - Show when clicked */}
                      {isExpanded && (
                        <div className="px-6 pb-4 border-t bg-muted/20">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                            {/* Contact Info */}
                            <div>
                              <h5 className="font-medium mb-2 text-sm">Contact Information</h5>
                              <div className="space-y-2 text-sm">
                                {user.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="break-all">{user.email}</span>
                                  </div>
                                )}
                                {user.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                                {!user.email && !user.phone && (
                                  <span className="text-muted-foreground text-xs">No contact info</span>
                                )}
                              </div>
                            </div>

                            {/* Additional Info */}
                            <div>
                              <h5 className="font-medium mb-2 text-sm">Additional Details</h5>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                {user.university && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">University:</span>
                                    <span>{user.university}</span>
                                  </div>
                                )}
                                {user.agency_name && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Agency:</span>
                                    <span>{user.agency_name}</span>
                                  </div>
                                )}
                                {user.company_size && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">Company Size:</span>
                                    <span>{user.company_size}</span>
                                  </div>
                                )}
                                {user.description && (
                                  <div>
                                    <span className="font-medium">Description:</span>
                                    <p className="mt-1 text-xs bg-muted/50 p-2 rounded">{user.description}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Account Info */}
                            <div>
                              <h5 className="font-medium mb-2 text-sm">Account Information</h5>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Joined: {formatDate(user.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Updated: {formatDate(user.updated_at)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground/70 font-mono">
                                  ID: {user.id}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Listings and Messages in a grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

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
              {stats.recentMessages.length > 0 ? (
                stats.recentMessages.map((message: any, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{message.sender_name}</span>
                          {message.sender_phone && (
                            <Badge variant="outline" className="text-xs">
                              {message.sender_phone}
                            </Badge>
                          )}
                        </div>
                        {message.sender_university && (
                          <div className="text-sm text-muted-foreground mb-2">
                            📚 {message.sender_university}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-md p-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                    </div>
                    {message.conversation_id && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        ID: {message.conversation_id}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No messages yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerDashboard;