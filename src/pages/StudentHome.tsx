import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquare, Heart, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';

const StudentHome = () => {
  const { profile } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - invisible initially, appears on scroll */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white border-b border-border shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size={32} className="text-primary" />
            <span className="text-xl font-bold text-primary">flat2study</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link to="/messages" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <MessageSquare className="h-6 w-6 text-gray-700" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 min-w-[1.2rem] h-5 flex items-center justify-center text-xs px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Link>
            
            <Link to="/favorites" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="h-6 w-6 text-gray-700" />
            </Link>
            
            <Link to="/search" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Search className="h-6 w-6 text-gray-700" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Welcome Message */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-black mb-4">
              Welcome back, {profile?.full_name}!
            </h1>
          </div>

          {/* Search Section */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold text-center text-black mb-8">
              Where next?
            </h2>
            
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="bg-black rounded-full p-2 shadow-lg">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search for student accommodation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-0 bg-transparent text-white placeholder:text-gray-400 focus:ring-0 text-lg px-6 py-4"
                  />
                  <button
                    type="submit"
                    className="bg-white text-black rounded-full p-3 hover:bg-gray-100 transition-colors ml-2"
                  >
                    <Search className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Quick Actions - Three Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-24 mb-16">
            <Link to="/messages" className="group text-center">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <MessageSquare className="h-10 w-10 text-gray-700" />
                </div>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-[1.5rem] h-6 flex items-center justify-center text-sm px-2">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">My Messages</h3>
              <p className="text-gray-600">
                Chat with landlords and agencies
              </p>
            </Link>

            <Link to="/favorites" className="group text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors mb-4 mx-auto">
                <Heart className="h-10 w-10 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Saved Listings</h3>
              <p className="text-gray-600">
                Your favorite properties
              </p>
            </Link>

            <Link to="/search" className="group text-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors mb-4 mx-auto">
                <Search className="h-10 w-10 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-2">Explore</h3>
              <p className="text-gray-600">
                Discover new properties
              </p>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-black mb-6 flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <Search className="h-4 w-4 text-gray-600" />
                </div>
                Recent Activity
              </h2>
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-6">
                  No recent activity yet. Start exploring properties to see updates here!
                </p>
                <Link to="/search">
                  <button className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium">
                    Start Exploring
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;