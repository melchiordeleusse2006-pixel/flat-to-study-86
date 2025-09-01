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
        </div>
      </div>
    </div>
  );
};

export default StudentHome;