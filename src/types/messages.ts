export interface Message {
  id: string;
  message: string;
  sender_name: string;
  sender_phone?: string;
  sender_university?: string;
  created_at: string;
  read_at?: string;
  listing_id: string;
  agency_id: string;
  sender_id: string;
  replied_at?: string;
}

export interface Listing {
  id: string;
  title: string;
  images: string[];
  rent_monthly_eur: number;
  city: string;
  address_line: string;
}

export interface Agency {
  id: string;
  agency_name: string;
  phone?: string;
  email?: string;
}

export interface Conversation {
  listing: Listing;
  agency?: Agency;
  lastMessage: Message;
  unreadCount: number;
  studentName?: string;
  studentSenderId?: string;
}