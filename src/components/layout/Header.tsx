import { Button } from '@/components/ui/button';
import { Heart, User, Menu, Home, LogOut, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadMessagesCount } from '@/hooks/useUnreadMessagesCount';
import { Badge } from '@/components/ui/badge';
export default function Header() {
  const {
    user,
    profile,
    signOut,
    loading
  } = useAuth();
  const unreadCount = useUnreadMessagesCount();
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg hero-gradient">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">flat2study</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {user && profile?.user_type === 'agency' && <Link to="/my-listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              My Listings
            </Link>}
          {user && <Link to="/messages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-1 relative">
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
              {unreadCount > 0 && <Badge variant="destructive" className="absolute -top-2 -right-2 min-w-[1.2rem] h-5 flex items-center justify-center text-xs px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>}
            </Link>}
          {!user && <Link to="/auth" className="px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors">
              Publish Listings
            </Link>}
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About Us
        </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {user && <Button variant="ghost" size="sm" className="hidden md:flex">
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </Button>}
          
          {user ? <div className="flex items-center space-x-2">
              <span className="text-sm hidden md:block">
                Hello, {profile?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div> : <Link to="/auth">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>}

          {user && profile?.user_type === 'agency' && <Link to="/create-listing">
              <Button size="sm" className="hero-gradient text-white border-0">
                Post Listing
              </Button>
            </Link>}

          {!user && <Link to="/auth">
              <Button size="sm" className="hero-gradient text-white border-0">
                Get Started
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