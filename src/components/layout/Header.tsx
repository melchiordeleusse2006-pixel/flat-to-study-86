import { Button } from '@/components/ui/button';
import { Heart, User, Menu, Home, LogOut, MessageSquare, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useLanguage } from '@/contexts/LanguageContext';
export default function Header() {
  const {
    user,
    profile,
    signOut,
    loading
  } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  const { t } = useLanguage();
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Left section with Logo and Language */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg hero-gradient">
              <Home className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">flat2study</span>
          </Link>
          {!user && (
            <div className="hidden md:block">
              <LanguageSelector variant="compact" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user && profile?.user_type === 'agency' && <Link to="/my-listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('header.myListings')}
            </Link>}
          {user && <Link to="/messages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 relative">
              <MessageSquare className="h-4 w-4" />
              <span>{t('header.messages')}</span>
              {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-[1.2rem] h-5 flex items-center justify-center text-xs px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>}
            </Link>}
          {!user && <Link to="/auth" className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors">
              {t('header.publishListings')}
            </Link>}
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{t('header.about')}
        </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {user && <Link to="/favorites">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Heart className="h-4 w-4 mr-2" />
                {t('header.favorites')}
              </Button>
            </Link>}
          
          {user ? <div className="flex items-center space-x-2">
              <span className="text-sm hidden md:block">
                {t('header.hello')}, {profile?.full_name || user.email}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {t('header.profile')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      {t('header.profileInfo')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1">
                    <LanguageSelector variant="compact" />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('header.signOut')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> : <Link to="/auth">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Log In
              </Button>
            </Link>}

          {user && profile?.user_type === 'agency' && <Link to="/create-listing">
              <Button size="sm" className="hero-gradient text-white border-0">
                {t('header.postListing')}
              </Button>
            </Link>}

          {!user && <Link to="/get-started">
              <Button size="sm" className="hero-gradient text-white border-0">
                {t('header.getStarted')}
              </Button>
            </Link>}

          {/* Mobile menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>;
}