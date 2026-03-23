export interface SearchHistoryItem {
  id: string;
  type: 'IFSC' | 'PIN' | 'IP' | 'Phone' | 'Weather' | 'Currency' | 'GST' | 'Company' | 'QR' | 'Barcode' | 'URL' | 'Password' | 'RandomUser' | 'RC' | 'Age' | 'Dictionary' | 'Crypto' | 'BMI';
  query: string;
  timestamp: number;
}

// ... existing interfaces ...

export interface RCData {
  registration_number: string;
  owner_name: string;
  vehicle_make_model: string;
  fuel_type: string;
  engine_number: string;
  chassis_number: string;
  registration_date: string;
  fitness_upto: string;
  insurance_upto: string;
  insurance_company?: string;
  insurance_policy_number?: string;
  insurance_status?: string;
  road_tax_upto?: string;
  road_tax_status?: string;
  pucc_upto?: string;
  pucc_status?: string;
  rto_name: string;
  vehicle_class: string;
  status?: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  createdAt: number;
}

// ... existing interfaces ...

export interface BarcodeData {
  products: Array<{
    barcode_number: string;
    product_name: string;
    category: string;
    brand: string;
    description: string;
    images: string[];
  }>;
}

export interface RandomUserData {
  results: Array<{
    name: { title: string; first: string; last: string };
    email: string;
    location: { city: string; state: string; country: string };
    picture: { large: string };
    phone: string;
    cell: string;
    nat: string;
  }>;
}

export interface IfscData {
  BANK: string;
  BRANCH: string;
  ADDRESS: string;
  CITY: string;
  STATE: string;
  IFSC: string;
}

export interface PinData {
  Message: string;
  Status: string;
  PostOffice: Array<{
    Name: string;
    Description: string | null;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    State: string;
    Country: string;
    Pincode: string;
  }>;
}

export interface IpData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  org: string;
  postal: string;
  latitude: number;
  longitude: number;
}

export interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
}

export interface PhoneData {
  valid: boolean;
  number: string;
  local_format: string;
  international_format: string;
  country_prefix: string;
  country_code: string;
  country_name: string;
  location: string;
  carrier: string;
  line_type: string;
}

export interface GstData {
  gstin: string;
  lgnm: string; // Legal Name
  stj: string; // State Jurisdiction
  dty: string; // Taxpayer Type
  rgdt: string; // Registration Date
  sts: string; // Status
  pradr: {
    addr: {
      bnm: string;
      st: string;
      loc: string;
      bno: string;
      stcd: string;
      dst: string;
      flno: string;
      lt: string;
      lg: string;
      pncd: string;
    };
  };
}

export interface CompanyData {
  company_name: string;
  cin: string;
  registration_number: string;
  company_status: string;
  company_category: string;
  company_class: string;
  date_of_incorporation: string;
  registered_office_address: string;
  authorized_capital: string;
  paid_up_capital: string;
  listing_status: string;
}

export interface DictionaryData {
  word: string;
  phonetic: string;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
    }>;
  }>;
}

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: string;
  updatedAt: string;
}
