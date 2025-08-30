import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MessageCircle, Clock, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '@/types/messages';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  userType: string;
}

export function ConversationItem({ conversation, isSelected, onClick, userType }: ConversationItemProps) {
  const { listing, agency, lastMessage, unreadCount, studentName } = conversation;
  
  const listingImage = Array.isArray(listing.images) && listing.images.length > 0 
    ? listing.images[0] 
    : '/placeholder.svg';

  const truncateMessage = (text: string, maxLength: number = 60) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Listing Image */}
        <div className="relative flex-shrink-0">
          <img
            src={listingImage}
            alt={listing.title}
            className="w-16 h-16 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {unreadCount}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-medium text-sm truncate pr-2">
              {listing.title}
            </h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(lastMessage.created_at), { addSuffix: true })}
            </div>
          </div>

          {/* Location and Price */}
          <div className="flex items-center gap-4 mb-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{listing.city}</span>
            </div>
            <span className="font-medium">€{listing.rent_monthly_eur}/month</span>
          </div>

          {/* Contact Info (for agencies) or Agency Name (for students) */}
          {userType === 'agency' && studentName && (
            <div className="text-xs text-muted-foreground mb-2">
              <span className="font-medium">From:</span> {studentName}
              {lastMessage.sender_university && (
                <span className="ml-2">• {lastMessage.sender_university}</span>
              )}
            </div>
          )}

          {userType === 'student' && agency && (
            <div className="text-xs text-muted-foreground mb-2">
              <span className="font-medium">Agency:</span> {agency.agency_name}
            </div>
          )}

          {/* Last Message Preview */}
          <div className="flex items-center gap-2">
            <MessageCircle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <p className="text-sm text-muted-foreground truncate">
              {truncateMessage(lastMessage.message)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}