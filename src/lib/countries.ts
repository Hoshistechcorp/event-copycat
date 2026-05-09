// Curated global country + popular cities list for the LocationPicker.
export interface Country {
  code: string;
  name: string;
  flag: string;
  cities: string[];
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", flag: "🇺🇸", cities: ["New York", "Los Angeles", "Chicago", "Miami", "Austin", "Las Vegas", "San Francisco", "Atlanta", "Boston", "Seattle"] },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", cities: ["London", "Manchester", "Birmingham", "Liverpool", "Edinburgh", "Bristol", "Glasgow", "Leeds"] },
  { code: "CA", name: "Canada", flag: "🇨🇦", cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton"] },
  { code: "FR", name: "France", flag: "🇫🇷", cities: ["Paris", "Marseille", "Lyon", "Nice", "Bordeaux", "Cannes"] },
  { code: "DE", name: "Germany", flag: "🇩🇪", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"] },
  { code: "ES", name: "Spain", flag: "🇪🇸", cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Ibiza", "Málaga"] },
  { code: "IT", name: "Italy", flag: "🇮🇹", cities: ["Rome", "Milan", "Florence", "Naples", "Venice", "Turin"] },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", cities: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht"] },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", cities: ["Dubai", "Abu Dhabi", "Sharjah"] },
  { code: "AU", name: "Australia", flag: "🇦🇺", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"] },
  { code: "JP", name: "Japan", flag: "🇯🇵", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo"] },
  { code: "SG", name: "Singapore", flag: "🇸🇬", cities: ["Singapore"] },
  { code: "IN", name: "India", flag: "🇮🇳", cities: ["Mumbai", "Delhi", "Bangalore", "Goa", "Chennai", "Hyderabad", "Pune"] },
  { code: "BR", name: "Brazil", flag: "🇧🇷", cities: ["São Paulo", "Rio de Janeiro", "Salvador", "Brasília"] },
  { code: "MX", name: "Mexico", flag: "🇲🇽", cities: ["Mexico City", "Cancún", "Tulum", "Guadalajara", "Monterrey"] },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", cities: ["Cape Town", "Johannesburg", "Durban", "Pretoria"] },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", cities: ["Lagos", "Abuja", "Port Harcourt", "Ibadan"] },
  { code: "KE", name: "Kenya", flag: "🇰🇪", cities: ["Nairobi", "Mombasa", "Kisumu"] },
  { code: "GH", name: "Ghana", flag: "🇬🇭", cities: ["Accra", "Kumasi", "Takoradi"] },
  { code: "EG", name: "Egypt", flag: "🇪🇬", cities: ["Cairo", "Alexandria", "Sharm El Sheikh"] },
  { code: "TR", name: "Turkey", flag: "🇹🇷", cities: ["Istanbul", "Ankara", "Antalya", "Izmir"] },
  { code: "TH", name: "Thailand", flag: "🇹🇭", cities: ["Bangkok", "Phuket", "Chiang Mai", "Pattaya"] },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", cities: ["Jakarta", "Bali", "Surabaya"] },
  { code: "KR", name: "South Korea", flag: "🇰🇷", cities: ["Seoul", "Busan", "Incheon"] },
  { code: "CN", name: "China", flag: "🇨🇳", cities: ["Shanghai", "Beijing", "Shenzhen", "Hong Kong", "Guangzhou"] },
  { code: "AR", name: "Argentina", flag: "🇦🇷", cities: ["Buenos Aires", "Córdoba", "Mendoza"] },
  { code: "PT", name: "Portugal", flag: "🇵🇹", cities: ["Lisbon", "Porto", "Faro"] },
  { code: "IE", name: "Ireland", flag: "🇮🇪", cities: ["Dublin", "Cork", "Galway"] },
  { code: "SE", name: "Sweden", flag: "🇸🇪", cities: ["Stockholm", "Gothenburg", "Malmö"] },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", cities: ["Zurich", "Geneva", "Basel"] },
];

export const ALL_CITIES = COUNTRIES.flatMap((c) => c.cities.map((city) => ({ city, country: c.name, flag: c.flag })));
