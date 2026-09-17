export type Role = 'guest' | 'organizer';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  avatar: string;
  cover?: string;
  bio: string;
  location: string;
  city?: string;
  country?: string;
  zipcode?: string;
  role: Role;
  verified?: boolean;
  title?: string; // e.g. "Event Manager"
  rating?: number;
  posts: number;
  followers: number;
  following: number;
  socials: { instagram?: string; x?: string; youtube?: string; snapchat?: string };
  interests: string[];
  mutualFriends?: number;
  kind?: 'people' | 'promoter';
};

export type Organization = {
  id: string;
  name: string;
  logo: string;
  cover: string;
  type: string; // Nightclub / Promoter / ...
  category: string; // Jazz, Rap...
  description: string;
  followers: number;
  rating: number;
  ratingCount: number;
  verified: boolean;
  categories: string[];
  email: string;
  phone: string;
  socials: { instagram?: string; x?: string; youtube?: string; snapchat?: string };
  country?: string;
  city?: string;
  location?: string;
  zipcode?: string;
  ownerId: string;
};

export type TicketType = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  minPerOrder: number;
  maxPerOrder: number;
  ageRestriction?: string;
  description?: string;
  accessArea?: string;
  checkoutNote?: string;
  startTime?: string;
  endTime?: string;
  saleEnds?: string;
  isGuestList?: boolean;
  enabled: boolean;
};

export type EventVisibility = 'public' | 'private' | 'invite' | 'password';
export type AttendanceModel = 'ticketed' | 'rsvp';
export type EventStatus = 'live' | 'draft' | 'past';

export type EventItem = {
  id: string;
  title: string;
  subtitle?: string; // lineup e.g. "Eminem, Dr. Dre..."
  category: string; // Music, Jazz, Rap
  genre?: string;
  cover: string;
  gallery: string[];
  organizationId: string;
  description: string;
  startDate: string; // ISO
  endDate: string;
  venueName: string;
  address: string;
  city: string;
  country: string;
  zipcode?: string;
  coords: { latitude: number; longitude: number };
  priceFrom: number;
  attendees: number;
  attendeeAvatars: string[];
  ticketTypes: TicketType[];
  visibility: EventVisibility;
  password?: string;
  attendance: AttendanceModel;
  showAttendeesPublic: boolean;
  guestList: {
    enabled: boolean;
    capacity: number;
    eligibility: string;
    contactCapture: string;
    marketingConsent: string;
  };
  status: EventStatus;
  boosted?: boolean;
  stats?: { revenue: number; ticketsSold: number; pageVisits: number };
};

export type CartLine = { ticketTypeId: string; qty: number };

export type DeliveryAddress = {
  id: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  location: string;
  zipcode: string;
  label: 'Home' | 'Office';
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  brand: 'mastercard' | 'visa' | 'paypal' | 'stripe' | 'applepay' | 'googlepay';
  label: string;
  last4?: string;
  fee?: string;
};

export type Ticket = {
  id: string;
  orderId: string;
  eventId: string;
  ticketTypeId: string;
  ticketTypeName: string;
  holderName: string;
  holderAvatar?: string;
  qty: number;
  cost: number;
  qrValue: string;
  scanned: boolean;
  scannedAt?: string;
  purchasedAt: string;
  complimentary?: boolean;
};

export type Order = {
  id: string;
  eventId: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  lines: { ticketTypeId: string; ticketTypeName: string; qty: number; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  status: 'paid' | 'refund_requested' | 'refunded' | 'declined';
  refundReason?: string;
  ticketIds: string[];
};

export type Post = {
  id: string;
  authorId: string;
  eventId?: string; // verified event post
  media: string[];
  caption: string;
  location?: string;
  isPublic: boolean;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  createdAt: string;
  likedByMe?: boolean;
  savedByMe?: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  likes: number;
  likedByMe?: boolean;
  createdAt: string;
  replies?: Comment[];
};

export type Conversation = {
  id: string;
  participantId: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
  typing?: boolean;
};

export type Attachment = {
  kind: 'image' | 'video' | 'file';
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string; // 'me' or user id
  text: string;
  at: string;
  read: boolean;
  attachment?: Attachment;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  at: string;
  read: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  avatar: string;
  role: 'Event Manager' | 'Door Manager';
  roleDescription: string;
  phone: string;
  email: string;
  eventId?: string;
};

export type PromoCode = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  appliesTo: string;
  usageLimit: number;
  perUserLimit: number;
  starts: string;
  expires: string;
  uses: number;
  revenue: number;
  discounts: number;
  conversion: number;
  eligible: string;
  active: boolean;
  eventId?: string;
};

export type TrackingLink = {
  id: string;
  campaign: string;
  eventId: string;
  promoter: string;
  destination: string;
  url: string;
  createdAt: string;
  clicks: number;
  sales: number;
  revenue: number;
  conversion: number;
};

export type SmsBlast = {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  status: 'active' | 'completed' | 'rejected';
  audience: string;
  scope: string;
  consentFilter: string;
  recipients: number;
};

export type Boost = {
  id: string;
  eventId: string;
  duration: string;
  budget: number;
  start: string;
  status: 'active' | 'boosted' | 'rejected';
  createdAt: string;
};

export type BankAccount = { id: string; holder: string; number: string; isDefault: boolean };

export type Transaction = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  amount: number; // signed
  at: string;
  status: 'completed' | 'pending';
};
