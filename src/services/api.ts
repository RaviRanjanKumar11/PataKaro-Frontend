
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API = axios.create({
  baseURL: BASE_URL
});

API.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem("apiKey");

  if (apiKey) {
    config.headers["x-api-key"] = apiKey;
  }

  return config;
});


// IFSC Code Search
export const getIfscDetails = async (ifsc: string) => {
  const response = await 
   API.get("/ifsc", {
    params: { ifsc }
  });
  return response.data;
};

// PIN Code Search
export const getPinCodeDetails = async (pin: string) => {
  const response = await 
  API.get("/pincode", {
    params: { pin }
  });
  return response.data;
};

// IP Address Info
export const getIpInfo = async (ip: string = '') => {
  const response = await API.get("/ip", { params: ip ? { ip } : {} });
  return response.data;
};



// Currency Converter (INR to USD, EUR)
export const getExchangeRates = async () => {
  const response = await API.get("/exchange");
  return response.data;
};

// Weather Info (Requires API Key - using placeholder)
export const getWeather = async (city: string) => {
  const response = await API.get("/weather", {
    params: { city }
  });
  return response.data;
};

// Phone Number Info (Requires API Key - using placeholder for APILayer)
export const getPhoneInfo = async (number: string) => {
  const response = await API.get("/phone", {
    params: { number }
  });
  return response.data;
};

// GST Lookup (Masters India API)
export const getGstDetails = async (gstin: string) => {
  const response = await API.get("/gst", {
    params: { gstin }
  });
  return response.data;
};

// Company Info (MCA Data)
export const getCompanyDetails = async (cin: string) => {
  const response = await API.get("/company", {
    params: { cin }
  });
  return response.data;
};

// QR Code Generator (goqr.me)
export const getQrCodeUrl = (data: string) => {
  return `${BASE_URL}/qr?data=${encodeURIComponent(data)}`;
};

// Barcode Lookup
export const getBarcodeInfo = async (barcode: string) => {
  const response = await API.get("/barcode", {
    params: { barcode }
  });
  return response.data;
};

// URL Shortener (TinyURL)
export const shortenUrl = async (url: string) => {
  const response = await API.get("/shorten", {
    params: { url }
  });
  return response.data;
};

// Random User Data
export const getRandomUser = async () => {
  const response = await API.get("/random-user");
  return response.data;
};
// Vehicle RC Lookup (RTO Data)
export const getRcDetails = async (rcNumber: string) => {
  const response = await API.get("/rc", {
    params: { rcNumber }
  });
  return response.data;
};

// Geocoding (Nominatim OpenStreetMap)
export const getCoordinates = async (query: string) => {
  const response = await API.get("/geocode", {
    params: { query }
  });
  return response.data;
};


// Dictionary API (Free Dictionary API)
export const getDictionaryDefinition = async (word: string) => {
  const response = await API.get("/dictionary", {
    params: { word }
  });
  return response.data;
};

// Crypto Prices
export const getCryptoPrices = async () => {
  const response = await API.get("/crypto");
  return response.data;
};
