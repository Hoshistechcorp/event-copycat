import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";
import event6 from "@/assets/event-6.jpg";

export type EventCategory = "All" | "Music" | "Parties" | "Workshops" | "Tech" | "Food & Drink" | "Birthday" | "Sports";
export type Location = "All Locations" | "Lagos" | "Abuja" | "Port Harcourt" | "Ibadan" | "Accra";
export type DateFilter = "Any Date" | "Today" | "This Weekend" | "This Week" | "This Month";

export interface Performer {
  name: string;
  role: string;
  avatar: string;
}

export interface EventItem {
  id: number | string;
  title: string;
  organizer: string;
  date: string;
  fullDate: string;
  time: string;
  price: string;
  image: string;
  vibing: string;
  verified: boolean;
  category: EventCategory;
  location: Location;
  venue: string;
  description: string;
  tickets: { name: string; price: string; perks: string[] }[];
  performers: Performer[];
  coordinates: { lat: number; lng: number };
}

export const allEvents: EventItem[] = [
  {
    id: 1, title: "Vibes & Grills 3.0", organizer: "The Grill Master", date: "OCT 12", fullDate: "Saturday, October 12, 2025", time: "4:00 PM", price: "₦5,000", image: event1, vibing: "120+", verified: true, category: "Parties", location: "Lagos", venue: "Lekki Phase 1",
    description: "Get ready for the ultimate outdoor party experience! Vibes & Grills 3.0 brings together the best DJs, grilled delicacies, and an unforgettable atmosphere. Whether you're coming for the music, the food, or the vibes — this is the event of the season.",
    tickets: [
      { name: "Regular", price: "₦5,000", perks: ["General admission", "1 free drink"] },
      { name: "VIP", price: "₦15,000", perks: ["Priority entry", "VIP lounge access", "3 free drinks", "Grills platter"] },
      { name: "Table for 5", price: "₦50,000", perks: ["Reserved table", "Bottle service", "5 VIP wristbands"] },
    ],
    performers: [
      { name: "DJ Neptune", role: "Headliner DJ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neptune" },
      { name: "Chef Tunde", role: "Grill Master", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tunde" },
      { name: "MC Bimbo", role: "Host", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bimbo" },
    ],
    coordinates: { lat: 6.4478, lng: 3.4723 },
  },
  {
    id: 2, title: "Tech Mixer Lagos", organizer: "Lagos Tech Hub", date: "OCT 15", fullDate: "Tuesday, October 15, 2025", time: "10:00 AM", price: "Free", image: event2, vibing: "85+", verified: false, category: "Tech", location: "Lagos", venue: "Co-Creation Hub, Yaba",
    description: "Connect with Lagos' brightest tech minds at this networking mixer. Featuring lightning talks from startup founders, hands-on demos, and plenty of opportunities to meet your next co-founder or collaborator.",
    tickets: [
      { name: "General Admission", price: "Free", perks: ["Entry", "Refreshments", "Networking session"] },
    ],
    performers: [
      { name: "Ada Nduka", role: "Keynote Speaker", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ada" },
      { name: "Emeka Obi", role: "Panel Moderator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emeka" },
    ],
    coordinates: { lat: 6.5158, lng: 3.3902 },
  },
  {
    id: 3, title: "Sip & Paint Night", organizer: "Art Studio X", date: "OCT 18", fullDate: "Friday, October 18, 2025", time: "6:00 PM", price: "₦7,500", image: event3, vibing: "45+", verified: false, category: "Arts", location: "Abuja", venue: "Wuse 2 Art Gallery",
    description: "Unleash your inner artist! Join us for a relaxing evening of painting, fine wine, and great company. No experience needed — our instructors will guide you through creating your own masterpiece to take home.",
    tickets: [
      { name: "Single", price: "₦7,500", perks: ["All art supplies", "2 glasses of wine", "Take home your painting"] },
      { name: "Couple", price: "₦12,000", perks: ["All art supplies for 2", "Bottle of wine", "Take home paintings"] },
    ],
    performers: [
      { name: "Amara Eze", role: "Lead Instructor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara" },
      { name: "Yemi Alade", role: "Guest Artist", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yemi" },
    ],
    coordinates: { lat: 9.0579, lng: 7.4951 },
  },
  {
    id: 4, title: "Outdoor Cinema: Classics", organizer: "Park View Screens", date: "OCT 20", fullDate: "Sunday, October 20, 2025", time: "7:30 PM", price: "₦3,000", image: event4, vibing: "200+", verified: true, category: "Parties", location: "Port Harcourt", venue: "Port Harcourt Pleasure Park",
    description: "Enjoy timeless classic films under the stars at the beautiful Pleasure Park. Bring a blanket, grab some popcorn, and settle in for a magical movie night with friends and family.",
    tickets: [
      { name: "Standard", price: "₦3,000", perks: ["Lawn seating", "Popcorn & drink"] },
      { name: "Premium", price: "₦8,000", perks: ["Bean bag seating", "Snack box", "Blanket provided"] },
    ],
    performers: [
      { name: "Nollywood Mike", role: "Film Curator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike" },
      { name: "DJ Spinall", role: "Pre-show DJ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=spinall" },
    ],
    coordinates: { lat: 4.8156, lng: 7.0498 },
  },
  {
    id: 5, title: "Comedy Roast Night", organizer: "Lagos Laughs", date: "OCT 22", fullDate: "Tuesday, October 22, 2025", time: "8:00 PM", price: "₦10,000", image: event5, vibing: "150+", verified: false, category: "Music", location: "Ibadan", venue: "Ventura Mall, Samonda",
    description: "Brace yourself for a night of side-splitting comedy! Top comedians take the stage to roast each other and the audience in this no-holds-barred comedy special.",
    tickets: [
      { name: "Regular", price: "₦10,000", perks: ["General admission"] },
      { name: "Front Row", price: "₦25,000", perks: ["Front row seats", "Meet & greet", "2 drinks"] },
    ],
    performers: [
      { name: "Bovi", role: "Headliner", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bovi" },
      { name: "Basketmouth", role: "Special Guest", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=basket" },
      { name: "Waris", role: "Opening Act", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=waris" },
    ],
    coordinates: { lat: 7.3776, lng: 3.9470 },
  },
  {
    id: 6, title: "Morning Yoga Session", organizer: "Flow with Tola", date: "OCT 23", fullDate: "Wednesday, October 23, 2025", time: "6:30 AM", price: "Free", image: event6, vibing: "30+", verified: false, category: "Sports", location: "Accra", venue: "Labadi Beach",
    description: "Start your morning right with a calming yoga session on the beach. Suitable for all levels — from beginners to advanced practitioners. Bring your mat and an open mind.",
    tickets: [
      { name: "Free Entry", price: "Free", perks: ["Guided session", "Beach access"] },
    ],
    performers: [
      { name: "Tola Adeyemo", role: "Yoga Instructor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tola" },
    ],
    coordinates: { lat: 5.5560, lng: -0.1969 },
  },
  {
    id: 7, title: "Afrobeats Dance Class", organizer: "Dance Lagos", date: "OCT 25", fullDate: "Friday, October 25, 2025", time: "5:00 PM", price: "₦4,000", image: event1, vibing: "60+", verified: true, category: "Music", location: "Lagos", venue: "National Theatre, Iganmu",
    description: "Learn the hottest Afrobeats dance moves from professional choreographers. Whether you're a seasoned dancer or have two left feet, this class is designed for everyone to have a blast.",
    tickets: [
      { name: "Drop-in", price: "₦4,000", perks: ["1 class", "Water bottle"] },
      { name: "Monthly Pass", price: "₦12,000", perks: ["4 classes", "Priority booking"] },
    ],
    performers: [
      { name: "Poco Lee", role: "Lead Choreographer", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=poco" },
      { name: "Pinki Debbie", role: "Dance Instructor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pinki" },
    ],
    coordinates: { lat: 6.4312, lng: 3.3890 },
  },
  {
    id: 8, title: "Startup Pitch Night", organizer: "Founders Club", date: "OCT 26", fullDate: "Saturday, October 26, 2025", time: "3:00 PM", price: "Free", image: event2, vibing: "95+", verified: true, category: "Tech", location: "Abuja", venue: "Transcorp Hilton",
    description: "Watch the next big startups pitch their ideas to a panel of investors and industry experts. Great networking opportunity for founders, investors, and tech enthusiasts.",
    tickets: [
      { name: "Audience", price: "Free", perks: ["Entry", "Networking", "Refreshments"] },
      { name: "Pitcher", price: "Free", perks: ["5-min pitch slot", "Feedback from judges", "Investor access"] },
    ],
    performers: [
      { name: "Jason Njoku", role: "Judge", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jason" },
      { name: "Rebecca Enonchong", role: "Judge", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rebecca" },
      { name: "Iyinoluwa Aboyeji", role: "Keynote", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=iyin" },
    ],
    coordinates: { lat: 9.0579, lng: 7.4891 },
  },
  {
    id: 9, title: "Jollof Cook-Off", organizer: "Foodies NG", date: "OCT 28", fullDate: "Monday, October 28, 2025", time: "12:00 PM", price: "₦2,500", image: event3, vibing: "180+", verified: false, category: "Food & Drink", location: "Lagos", venue: "Eko Atlantic",
    description: "The ultimate jollof rice showdown! Watch top chefs compete for the crown of best jollof, sample all the entries, and cast your vote. Plus live music, drinks, and more.",
    tickets: [
      { name: "Taster", price: "₦2,500", perks: ["Sample all entries", "Vote", "1 drink"] },
      { name: "Contestant", price: "₦5,000", perks: ["Cooking station", "Ingredients provided", "Trophy for winner"] },
    ],
    performers: [
      { name: "Chef Fregz", role: "Head Judge", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fregz" },
      { name: "Hilda Baci", role: "Celebrity Chef", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hilda" },
    ],
    coordinates: { lat: 6.4153, lng: 3.4109 },
  },
  {
    id: 10, title: "Open Mic Poetry", organizer: "Verse Lagos", date: "OCT 30", fullDate: "Wednesday, October 30, 2025", time: "7:00 PM", price: "₦1,500", image: event4, vibing: "40+", verified: false, category: "Arts", location: "Ibadan", venue: "UI Conference Centre",
    description: "An intimate evening of spoken word and poetry. Whether you want to perform or simply listen, this is a safe space to experience raw, powerful storytelling through verse.",
    tickets: [
      { name: "Listener", price: "₦1,500", perks: ["Entry", "1 drink"] },
      { name: "Performer", price: "Free", perks: ["5-min stage slot", "Entry", "1 drink"] },
    ],
    performers: [
      { name: "Sage Hasson", role: "Featured Poet", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sage" },
      { name: "Dike Chukwumerije", role: "Spoken Word", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dike" },
    ],
    coordinates: { lat: 7.4400, lng: 3.9000 },
  },
  {
    id: 11, title: "Beach Volleyball Tournament", organizer: "Sports NG", date: "NOV 1", fullDate: "Friday, November 1, 2025", time: "9:00 AM", price: "₦3,500", image: event5, vibing: "110+", verified: true, category: "Sports", location: "Lagos", venue: "Elegushi Beach",
    description: "Assemble your team and compete in the most exciting beach volleyball tournament in Lagos! Great prizes, great vibes, and a full day of sun, sand, and sport.",
    tickets: [
      { name: "Spectator", price: "₦3,500", perks: ["Entry", "Beach access", "1 drink"] },
      { name: "Team Entry (4)", price: "₦20,000", perks: ["Team registration", "Jerseys", "Prizes for winners"] },
    ],
    performers: [
      { name: "Coach Bola", role: "Tournament Director", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bola" },
      { name: "DJ Kaywise", role: "Event DJ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kaywise" },
    ],
    coordinates: { lat: 6.4281, lng: 3.4536 },
  },
  {
    id: 12, title: "Wine Tasting Evening", organizer: "Vine & Dine", date: "NOV 3", fullDate: "Sunday, November 3, 2025", time: "6:00 PM", price: "₦15,000", image: event6, vibing: "35+", verified: false, category: "Food & Drink", location: "Abuja", venue: "Sheraton Hotel",
    description: "An exclusive evening of fine wines from around the world. Our sommelier will guide you through a curated tasting of 8 premium wines paired with artisanal cheeses and charcuterie.",
    tickets: [
      { name: "Standard Tasting", price: "₦15,000", perks: ["8 wine tastings", "Cheese board", "Tasting notes"] },
      { name: "Premium Pairing", price: "₦30,000", perks: ["12 premium wines", "Full charcuterie", "Take-home bottle"] },
    ],
    performers: [
      { name: "Sommelier Kachi", role: "Wine Expert", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=kachi" },
      { name: "Chef Imoteda", role: "Food Pairing Chef", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=imoteda" },
    ],
    coordinates: { lat: 9.0579, lng: 7.4951 },
  },
];

export const categories: EventCategory[] = ["All", "Music", "Parties", "Workshops", "Tech", "Food & Drink", "Arts", "Sports"];
export const locations: Location[] = ["All Locations", "Lagos", "Abuja", "Port Harcourt", "Ibadan", "Accra"];
export const dateFilters: DateFilter[] = ["Any Date", "Today", "This Weekend", "This Week", "This Month"];
