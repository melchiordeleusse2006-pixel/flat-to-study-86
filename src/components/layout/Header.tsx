import { Button } from '@/components/ui/button';
import { Heart, User, Menu, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
          <Link 
            to="/search" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Find a place
          </Link>
          <Link 
            to="/agency" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            For Agencies
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </Button>
          
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>

          <Button size="sm" className="hero-gradient text-white border-0">
            Post Listing
          </Button>

          {/* Mobile menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}