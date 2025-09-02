import { Button } from '@/components/ui/button';
import { Heart, User, Menu, LogOut, MessageSquare, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useLanguage } from '@/contexts/LanguageContext';
import { Logo } from '@/components/ui/logo';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Header() {
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const { t } = useLanguage();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Force header visibility on search page and messages page
  const isSearchPage = location.pathname === '/search';
  const isMessagesPage = location.pathname === '/messages';
  const shouldShowBackground = isScrolled || isSearchPage || isMessagesPage;

  // Ensure header doesn't overlap content on specific pages
  const pagesWithOverlapIssues = ['/messages', '/profile', '/auth', '/my-listings', '/favorites'];
  const hasOverlapIssue = pagesWithOverlapIssues.includes(location.pathname);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
      shouldShowBackground 
        ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b' 
        : 'bg-transparent'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        {/* Left section with Logo and Language - Fixed positioning */}
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-shrink-0">
          <Link to="/" className="flex items-center space-x-1 md:space-x-2">
            <div className={`flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-lg transition-all duration-300 ${
              shouldShowBackground ? 'hero-gradient' : 'bg-white/20'
            } text-white`}>
              <Logo size={16} className="md:w-5 md:h-5" />
            </div>
            <span className={`text-lg md:text-xl font-bold transition-colors duration-300 ${
              shouldShowBackground ? 'text-primary' : 'text-white'
            }`}>flat2study</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile language selector - show only on mobile */}
          <div className="md:hidden">
            <div className={`transition-colors duration-300 ${shouldShowBackground ? '' : 'text-white'}`}>
              <LanguageSelector variant="mobile-icon" />
            </div>
          </div>
          
          {/* Desktop language selector - show only on desktop */}
          <div className="hidden md:block">
            <div className={`transition-colors duration-300 ${shouldShowBackground ? '' : 'text-white'}`}>
              <LanguageSelector variant="compact" />
            </div>
          </div>
          
          <Link to="/about" className={`text-xs md:text-sm font-medium transition-colors duration-300 ${
            shouldShowBackground 
              ? 'text-foreground hover:text-foreground/80' 
              : 'text-white hover:text-white/80'
          }`}>
            About us
          </Link>
          
          {/* Show different content based on auth state */}
          {authLoading ? (
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="w-12 h-6 md:w-16 md:h-8 bg-white/20 rounded animate-pulse"></div>
              <div className="w-16 h-6 md:w-20 md:h-8 bg-white/20 rounded animate-pulse"></div>
            </div>
          ) : user ? (
            /* Authenticated user menu */
            <div className="flex items-center space-x-1 md:space-x-4">
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className={`transition-colors duration-300 ${
                    shouldShowBackground 
                      ? 'text-foreground hover:text-foreground/80' 
                      : 'text-white hover:text-white/80 hover:bg-white/10'
                  }`}>
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="h-6 w-6 rounded-full object-cover mr-2" 
                      />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    <span className="hidden md:inline">{profile?.full_name || user.email?.split('@')[0] || 'Account'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {profile?.user_type === 'student' && (
                    <DropdownMenuItem asChild>
                      <Link to="/favorites" className="flex items-center">
                        <Heart className="h-4 w-4 mr-2" />
                        Favorites
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/messages" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                      {profile?.user_type === 'agency' && unreadCount > 0 && (
                        <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  {profile?.user_type === 'agency' && (
                    <DropdownMenuItem asChild>
                      <Link to="/my-listings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        My Listings
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            /* Non-authenticated user buttons */
            <>
              <Link to="/auth">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`transition-colors duration-300 ${
                    shouldShowBackground 
                      ? 'text-foreground hover:text-foreground/80' 
                      : 'text-white hover:text-white/80 hover:bg-white/10'
                  }`}
                >
                  <User className="h-4 w-4 mr-1 md:mr-2" />
                  <span className="hidden md:inline">Log In</span>
                </Button>
              </Link>

              <Link to="/get-started">
                <Button size="sm" className={`transition-all duration-300 text-xs md:text-sm ${
                  shouldShowBackground 
                    ? 'hero-gradient text-white border-0' 
                    : 'bg-white text-primary hover:bg-white/90 border-0'
                }`}>
                  <span className="hidden md:inline">Get started</span>
                  <span className="md:hidden">Start</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}