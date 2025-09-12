import { useState } from 'react';
import { Listing } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Bed, Bath, Square, Building2, MessageCircle, Calendar, ChevronLeft, ChevronRight, Sofa } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { useIsMobile } from '@/hooks/use-mobile';

interface ListingCardProps {
  listing: Listing;
  onHover?: (listingId: string | null) => void;
  onClick?: (listingId: string) => void;
  isHovered?: boolean;
  className?: string;
}

export default function ListingCard({ 
  listing, 
  onHover, 
  onClick, 
  isHovered, 
  className 
}: ListingCardProps) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const isMobile = useIsMobile();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleMessageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Message clicked for listing:', listing.id);
  };

  const handleVisitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Visit request for listing:', listing.id);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(listing.id);
  };

  return (
    <div 
      className={`bg-white border border-border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 ${isHovered ? 'scale-[1.01] border-primary/30 shadow-lg' : ''} ${className}`}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      onClick={() => onClick?.(listing.id)}
    >
      <div className="flex">
        {/* Image Section - Left Side */}
        <div className="relative w-80 h-60 flex-shrink-0 overflow-hidden">
          {listing.images && listing.images.length > 0 ? (
            <>
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              
              {/* Image navigation for multiple images */}
              {listing.images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white border-none shadow-md z-30 rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => 
                        prev === 0 ? listing.images.length - 1 : prev - 1
                      );
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/90 hover:bg-white border-none shadow-md z-30 rounded-full flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(prev => 
                        prev === listing.images.length - 1 ? 0 : prev + 1
                      );
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Image count indicator */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
              {currentImageIndex + 1}/{listing.images.length}
            </div>
          )}

          {/* Featured badge */}
          {listing.status === 'PUBLISHED' && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-medium">
              FEATURED
            </div>
          )}
        </div>

        {/* Content Section - Right Side */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            {/* Price */}
            <div className="text-3xl font-bold text-foreground mb-2">
              {formatPrice(listing.rentMonthlyEUR)}/mese
            </div>
            
            {/* Title and Location */}
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-foreground">
              {listing.title}
            </h3>
            
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm">{listing.addressLine}, {listing.city}</span>
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-sm">
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'locale' : 'locali'}</span>
              </div>
              
              {listing.sizeSqm && (
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{listing.sizeSqm} m²</span>
                </div>
              )}
              
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{listing.bathrooms} bagno{listing.bathrooms !== 1 ? 'i' : ''}</span>
              </div>
              
              {listing.floor && (
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Piano {listing.floor}</span>
                </div>
              )}

              {listing.amenities.includes('Elevator') && (
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Ascensore</span>
                </div>
              )}

              {listing.furnished && (
                <div className="flex items-center">
                  <Sofa className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Arredato</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons and Agency */}
          <div className="flex justify-between items-end">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="px-4"
                onClick={handleMessageClick}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                MESSAGGIO
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="px-4"
                onClick={handleVisitClick}
              >
                <Calendar className="h-4 w-4 mr-2" />
                VISITA
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={handleFavoriteClick}
              >
                <Heart 
                  className={`h-5 w-5 ${isFavorited(listing.id) ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} 
                />
              </Button>
            </div>

            {/* Agency Logo/Name */}
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">
                {listing.agency.name}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}