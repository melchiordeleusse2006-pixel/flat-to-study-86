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
export default function Header() {
  const {
    user,
    profile,
    signOut,
    loading
  } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const {
    t
  } = useLanguage();
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left section with Logo and Language */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg hero-gradient text-white">
              <Logo size={20} />
            </div>
            <span className="text-xl font-bold">flat2study</span>
          </Link>
          {!user && <div className="hidden md:block">
              <LanguageSelector variant="compact" />
            </div>}
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            About us
          </Link>
          
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </Link>

          <Link to="/get-started">
            <Button size="sm" className="hero-gradient text-white border-0">
              Get started
            </Button>
          </Link>
        </div>
      </div>
    </header>;
}