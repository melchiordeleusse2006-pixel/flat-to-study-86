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
export default function Header() {
  const { user, profile, signOut, loading } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b' 
        : 'bg-transparent'
    }`}>
      <div className="container flex h-16 items-center justify-between">
        {/* Left section with Logo and Language */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 ${
              isScrolled ? 'hero-gradient' : 'bg-white/20'
            } text-white`}>
              <Logo size={20} />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              isScrolled ? 'text-foreground' : 'text-white'
            }`}>flat2study</span>
          </Link>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <div className={`transition-colors duration-300 ${isScrolled ? '' : 'text-white'}`}>
              <LanguageSelector variant="compact" />
            </div>
          </div>
          
          <Link to="/about" className={`text-sm font-medium transition-colors duration-300 ${
            isScrolled 
              ? 'text-foreground hover:text-foreground/80' 
              : 'text-white hover:text-white/80'
          }`}>
            About us
          </Link>
          
          <Link to="/auth">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`transition-colors duration-300 ${
                isScrolled 
                  ? 'text-foreground hover:text-foreground/80' 
                  : 'text-white hover:text-white/80 hover:bg-white/10'
              }`}
            >
              <User className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </Link>

          <Link to="/get-started">
            <Button size="sm" className={`transition-all duration-300 ${
              isScrolled 
                ? 'hero-gradient text-white border-0' 
                : 'bg-white text-primary hover:bg-white/90 border-0'
            }`}>
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}