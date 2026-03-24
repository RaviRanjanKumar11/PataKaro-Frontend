/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  MapPin, 
  Wrench, 
  Moon, 
  Sun, 
  History,
  Info,
  ChevronRight,
  Copy,
  Share2,
  Loader2,
  AlertCircle,
  Globe,
  Phone,
  CloudSun,
  Coins,
  Banknote,
  Building,
  FileText,
  QrCode,
  Barcode,
  Link,
  Lock,
  User,
  RefreshCw,
  ExternalLink,
  Car,
  ShieldCheck,
  Zap,
  Mail,
  Bell,
  Calendar,
  Trash2,
  Cake,
  Book,
  Bitcoin,
  AlertTriangle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  getIfscDetails, 
  getPinCodeDetails, 
  getIpInfo, 
  getExchangeRates,
  getWeather,
  getPhoneInfo,
  getGstDetails,
  getCompanyDetails,
  getQrCodeUrl,
  getBarcodeInfo,
  shortenUrl,
  getRandomUser,
  getRcDetails,
  getCoordinates,
  getDictionaryDefinition,
  getCryptoPrices
} from './services/api';
import { useSearchHistory } from './hooks/useSearchHistory';
import { useReminders } from './hooks/useReminders';
import { IfscData, PinData, IpData, WeatherData, PhoneData, GstData, CompanyData, BarcodeData, RandomUserData, RCData, Reminder, DictionaryData, CryptoData } from './types';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for Leaflet default icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'home' | 'ifsc' | 'pin' | 'tools' | 'reminders' | 'profile';

const handleShare = async (title: string, text: string, url?: string) => {
  const shareData = { title, text, url: url || window.location.href };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  } else {
    const shareText = `${title}\n${text}\n${shareData.url}`;
    navigator.clipboard.writeText(shareText);
  }
};

export interface UserProfile {
  _id: string;
  googleId: string;
  displayName: string;
  email: string;
  image: string;
  apiKey: string;
  plan: 'free' | 'basic' | 'premium';
  usage: number;
  createdAt: string;
}

const BACKEND_URL = "https://patakaro-backendnew.onrender.com";

function ProfileView({ user, onLogout }: { user: UserProfile | null, onLogout: () => void, key?: string }) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-600">
          <Lock size={40} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Sign in to your account</h2>
          <p className="text-slate-500 max-w-xs mx-auto">Access your search history, reminders, and personalized settings across all your devices.</p>
        </div>
        <button 
          onClick={() => window.open(`${BACKEND_URL}/auth/google`, "_self")}
          className="bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-3 px-8 py-3 rounded-xl font-bold"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 bg-white rounded-full p-0.5" alt="Google" />
          Continue with Google
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
      <div className="card p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative">
          <img 
            src={user.image} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-indigo-600/20 shadow-2xl"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-zinc-900 rounded-full"></div>
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-3xl font-black tracking-tight">{user.displayName}</h2>
          <p className="text-slate-500 font-medium">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
            <span className="px-3 py-1 bg-indigo-600/10 text-indigo-600 text-xs font-bold rounded-full uppercase tracking-widest">{user.plan} Plan</span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-bold rounded-full uppercase tracking-widest">Verified</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck size={16} /> Account Security
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium">Authentication</span>
              <span className="text-sm text-slate-500">Google</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium">User ID</span>
              <span className="text-sm text-slate-500 font-mono text-[10px]">{user._id}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium">API Key</span>
              <span className="text-sm text-slate-500 font-mono text-[10px] blur-sm hover:blur-none transition-all cursor-pointer">{user.apiKey}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Created At</span>
              <span className="text-sm text-slate-500">{user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <History size={16} /> Usage Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium">Daily Usage</span>
              <span className="text-sm text-slate-500">{user.usage} reqs</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm font-medium">Active Reminders</span>
              <span className="text-sm text-slate-500">3</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Plan Limit</span>
              <span className="text-sm text-slate-500">{user.plan === 'premium' ? '2500' : user.plan === 'basic' ? '500' : '100'} / day</span>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-4 rounded-2xl bg-rose-500/10 text-rose-600 font-bold hover:bg-rose-500/20 transition-all flex items-center justify-center gap-2"
      >
        <ExternalLink size={20} /> Sign Out
      </button>
    </motion.div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const { addReminder } = useReminders();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Fetch user from backend using session cookie
        const res = await fetch(`${BACKEND_URL}/auth/current_user`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.log("User not logged in");
      }
    };
    checkUser();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, { credentials: 'include' });
      setUser(null);
      setActiveTab('home');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-zinc-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border dark:border-white/10 bg-white dark:bg-zinc-900 sticky top-0 h-screen z-40">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-900 shadow-xl shadow-zinc-900/10">
            <Search size={20} />
          </div>
          <h1 className="font-bold text-xl tracking-tight">PataKaro</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarLink active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label="Dashboard" />
          <SidebarLink active={activeTab === 'ifsc'} onClick={() => setActiveTab('ifsc')} icon={<Banknote size={20} />} label="IFSC Lookup" />
          <SidebarLink active={activeTab === 'pin'} onClick={() => setActiveTab('pin')} icon={<MapPin size={20} />} label="PIN Search" />
          <SidebarLink active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Wrench size={20} />} label="Utility Tools" />
          <SidebarLink active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon={<Bell size={20} />} label="Reminders" />
          <SidebarLink active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20} />} label="Profile" />
        </nav>

        <div className="p-6 border-t border-border dark:border-white/10 space-y-2">
          <a 
            href="mailto:birusinghrajput111@gmail.com?subject=Feedback for PataKaro Finder"
            className="w-full sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            <Mail size={20} />
            <span>Send Feedback</span>
          </a>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full sidebar-link"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-900 z-50 lg:hidden border-r border-border dark:border-white/10 shadow-2xl"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-900">
                    <Search size={20} />
                  </div>
                  <h1 className="font-bold text-xl tracking-tight">PataKaro</h1>
                </div>
              </div>
              <nav className="px-4 py-6 space-y-2">
                <SidebarLink active={activeTab === 'home'} onClick={() => { setActiveTab('home'); setIsSidebarOpen(false); }} icon={<Home size={20} />} label="Dashboard" />
                <SidebarLink active={activeTab === 'ifsc'} onClick={() => { setActiveTab('ifsc'); setIsSidebarOpen(false); }} icon={<Banknote size={20} />} label="IFSC Lookup" />
                <SidebarLink active={activeTab === 'pin'} onClick={() => { setActiveTab('pin'); setIsSidebarOpen(false); }} icon={<MapPin size={20} />} label="PIN Search" />
                <SidebarLink active={activeTab === 'tools'} onClick={() => { setActiveTab('tools'); setIsSidebarOpen(false); }} icon={<Wrench size={20} />} label="Utility Tools" />
                <SidebarLink active={activeTab === 'reminders'} onClick={() => { setActiveTab('reminders'); setIsSidebarOpen(false); }} icon={<Bell size={20} />} label="Reminders" />
                <SidebarLink active={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} icon={<User size={20} />} label="Profile" />
                <div className="pt-4 mt-4 border-t border-border dark:border-white/10">
                  <a 
                    href="mailto:birusinghrajput111@gmail.com?subject=Feedback for PataKaro Finder"
                    className="w-full sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    <Mail size={20} />
                    <span>Send Feedback</span>
                  </a>
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-border dark:border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Wrench size={20} />
            </button>
            <h2 className="font-bold text-lg capitalize hidden lg:block">{activeTab}</h2>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-zinc-900">
                <Search size={16} />
              </div>
              <h1 className="font-bold text-lg tracking-tight">PataKaro</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {user ? (
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-10 h-10 rounded-full border-2 border-indigo-600/20 overflow-hidden hover:border-indigo-600 transition-all"
              >
                <img src={user.image || ''} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab('profile')}
                className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-indigo-600 transition-colors"
              >
                <User size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full pb-24 lg:pb-8">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && <HomeView key="home" history={history} onSelectTab={setActiveTab} clearHistory={clearHistory} />}
            {activeTab === 'ifsc' && <IfscView key="ifsc" onSearch={(q) => addToHistory('IFSC', q)} onAddReminder={addReminder} />}
            {activeTab === 'pin' && <PinView key="pin" onSearch={(q) => addToHistory('PIN', q)} onAddReminder={addReminder} />}
            {activeTab === 'tools' && <ToolsView key="tools" onSearch={(t, q) => addToHistory(t, q)} onAddReminder={addReminder} />}
            {activeTab === 'reminders' && <RemindersView key="reminders" />}
            {activeTab === 'profile' && <ProfileView key="profile" user={user} onLogout={handleLogout} />}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/90 dark:bg-white/90 backdrop-blur-lg border border-white/10 dark:border-black/10 px-2 py-2 flex justify-around items-center z-40 rounded-3xl shadow-2xl">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20} />} label="Home" />
          <NavButton active={activeTab === 'ifsc'} onClick={() => setActiveTab('ifsc')} icon={<Banknote size={20} />} label="IFSC" />
          <NavButton active={activeTab === 'pin'} onClick={() => setActiveTab('pin')} icon={<MapPin size={20} />} label="PIN" />
          <NavButton active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} icon={<Wrench size={20} />} label="Tools" />
          <NavButton active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon={<Bell size={20} />} label="Reminders" />
        </nav>
      </div>
    </div>
  );
}

function SidebarLink({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "sidebar-link w-full",
        active && "sidebar-link-active"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
        active ? "text-white dark:text-zinc-900" : "text-zinc-400 dark:text-zinc-500"
      )}
    >
      <div className="relative z-10">{icon}</div>
      <span className="text-[10px] font-bold mt-1 relative z-10">{label}</span>
    </button>
  );
}

// --- Views ---

function HomeView({ history, onSelectTab, clearHistory }: { history: any[], onSelectTab: (t: Tab) => void, clearHistory: () => void, key?: string }) {
  // Process history for charts
  const typeCounts = history.reduce((acc: any, item: any) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  
  const COLORS = ['#2563eb', '#facc15', '#ef4444', '#10b981', '#8b5cf6', '#f97316'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Hero Section */}
      <div className="card p-8 lg:p-12 from-violet-600 to-indigo-600 text-white border-none relative overflow-hidden shadow-2xl shadow-indigo-600/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full -ml-32 -mb-32 blur-2xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold mb-6 backdrop-blur-md border border-white/10">
              <Zap size={14} className="text-yellow-300" />
              <span>All-in-One Information Hub</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight">
              Pata <span className="text-yellow-300">Karo</span>
            </h2>
            <p className="text-white/80 text-xl leading-relaxed">Access essential lookup tools, vehicle details, and utility services in one vibrant, unified interface.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <QuickAction icon={<Banknote size={24} />} label="IFSC Code" onClick={() => onSelectTab('ifsc')} />
            <QuickAction icon={<MapPin size={24} />} label="PIN Code" onClick={() => onSelectTab('pin')} />
            <QuickAction icon={<Car size={24} />} label="RC Lookup" onClick={() => onSelectTab('tools')} />
            <QuickAction icon={<ShieldCheck size={24} />} label="GST Details" onClick={() => onSelectTab('tools')} />
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      {history.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2 px-1">
            <Info size={18} className="text-indigo-600" />
            Search Analytics
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Distribution Chart */}
            <div className="card p-6 flex flex-col items-center">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 self-start">Search Distribution</h4>
              <div className="h-50 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                {chartData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-[10px] font-bold text-gray-500">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Chart */}
            <div className="card p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search Volume</h4>
              <div className="h-50 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#18181b" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Recent History */}
      <section>
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <History size={18} className="text-indigo-600" />
            Recent Activity
          </h3>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-xs text-indigo-600 font-bold hover:underline">Clear All</button>
          )}
        </div>
        
        {history.length === 0 ? (
          <div className="card p-12 text-center text-gray-400 border-dashed border-2">
            <History size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-medium">Your search history is empty</p>
            <p className="text-xs mt-1">Start exploring tools to see activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {item.type === 'IFSC' && <Banknote size={20} />}
                    {item.type === 'PIN' && <MapPin size={20} />}
                    {item.type === 'IP' && <Globe size={20} />}
                    {item.type === 'Phone' && <Phone size={20} />}
                    {item.type === 'Weather' && <CloudSun size={20} />}
                    {item.type === 'Currency' && <Coins size={20} />}
                    {item.type === 'GST' && <FileText size={20} />}
                    {item.type === 'Company' && <Building size={20} />}
                    {item.type === 'QR' && <QrCode size={20} />}
                    {item.type === 'Barcode' && <Barcode size={20} />}
                    {item.type === 'URL' && <Link size={20} />}
                    {item.type === 'Password' && <Lock size={20} />}
                    {item.type === 'RandomUser' && <User size={20} />}
                    {item.type === 'RC' && <Car size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-indigo-600 transition-colors">{item.query}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md font-bold text-gray-500 uppercase">{item.type}</span>
                      <span className="text-[10px] text-gray-400">{format(item.timestamp, 'MMM d, h:mm a')}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-3 bg-white/10 hover:bg-white/20 p-5 rounded-2xl transition-all active:scale-95 text-sm font-bold backdrop-blur-md border border-white/10 group"
    >
      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span>{label}</span>
    </button>
  );
}


function IfscView({ onSearch, onAddReminder }: { onSearch: (q: string) => void, onAddReminder: (r: any) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IfscData | null>(null);
  const [error, setError] = useState('');
  const [showReminder, setShowReminder] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await getIfscDetails(query);
      setResult(data);
      onSearch(query);
    } catch (err) {
      setError('Invalid IFSC code or network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">IFSC Finder</h2>
        <p className="text-sm text-gray-500">Search for bank details using IFSC code</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter IFSC Code (e.g. SBIN0000001)"
          className="input-field pr-12"
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Bank Name</h3>
              <p className="text-lg font-bold leading-tight">{result.BANK}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowReminder(true)} 
                className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 transition-colors"
                title="Set Reminder"
              >
                <Bell size={16} />
              </button>
              <button 
                onClick={() => handleShare(`Bank Details: ${result.BANK}`, `Branch: ${result.BRANCH}\nIFSC: ${result.IFSC}\nAddress: ${result.ADDRESS}`)}
                className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <button onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500"><Copy size={16} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Branch" value={result.BRANCH} />
            <InfoItem label="IFSC" value={result.IFSC} />
            <InfoItem label="City" value={result.CITY} />
            <InfoItem label="State" value={result.STATE} />
          </div>
          
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{result.ADDRESS}</p>
          </div>

          <ReminderModal 
            isOpen={showReminder} 
            onClose={() => setShowReminder(false)} 
            onSave={(title, desc, date) => onAddReminder({ title, description: desc, date, type: 'IFSC' })}
            initialTitle={`Follow up: ${result.BANK}`}
            initialDesc={`Branch: ${result.BRANCH}\nIFSC: ${result.IFSC}`}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function MapComponent({ lat, lon, label }: { lat: number, lon: number, label: string }) {
  return (
    <div className="h-75 w-full rounded-2xl overflow-hidden border border-border dark:border-white/10 shadow-sm z-0">
      <MapContainer center={[lat, lon]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lon]}>
          <Popup>
            <div className="text-sm font-bold">{label}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

function PinView({ onSearch, onAddReminder }: { onSearch: (q: string) => void, onAddReminder: (r: any) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PinData | null>(null);
  const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);
  const [error, setError] = useState('');
  const [reminderPo, setReminderPo] = useState<any | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    setError('');
    setResult(null);
    setCoords(null);
    try {
      const data = await getPinCodeDetails(query);
      if (data.Status === 'Error') throw new Error(data.Message);
      setResult(data);
      onSearch(query);
      
      // Fetch coordinates for the map
      const locationQuery = `${query}, India`;
      const locationCoords = await getCoordinates(locationQuery);
      if (locationCoords) {
        setCoords(locationCoords);
      } else if (data.PostOffice && data.PostOffice.length > 0) {
        // Try with district and state if PIN search fails
        const fallbackQuery = `${data.PostOffice[0].District}, ${data.PostOffice[0].State}, India`;
        const fallbackCoords = await getCoordinates(fallbackQuery);
        if (fallbackCoords) setCoords(fallbackCoords);
      }
    } catch (err) {
      setError('Invalid PIN code or network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">PIN Code Search</h2>
        <p className="text-sm text-gray-500">Find post office details by PIN code</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter 6-digit PIN Code"
          className="input-field pr-12"
          maxLength={6}
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center disabled:opacity-50 hover:bg-indigo-700 transition-colors"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {result && result.PostOffice && (
        <div className="space-y-6">
          {coords && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Location Map</h3>
              <MapComponent lat={coords.lat} lon={coords.lon} label={`PIN: ${query}`} />
            </motion.div>
          )}

          <div className="space-y-4">
            <p className="text-xs font-medium text-gray-400">{result.PostOffice.length} post offices found</p>
            {result.PostOffice.map((po, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{po.Name}</h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setReminderPo(po)} 
                      className="p-1.5 rounded-lg hover:bg-indigo-600/10 text-indigo-600 transition-colors"
                      title="Set Reminder"
                    >
                      <Bell size={14} />
                    </button>
                    <button 
                      onClick={() => handleShare(`Post Office: ${po.Name}`, `PIN Code: ${po.Pincode}\nDistrict: ${po.District}\nState: ${po.State}`)}
                      className="p-1.5 rounded-lg hover:bg-indigo-600/10 text-indigo-600 transition-colors"
                      title="Share"
                    >
                      <Share2 size={14} />
                    </button>
                    <span className={cn(
                      "text-[10px] px-2 py-1 rounded-full font-bold uppercase",
                      po.DeliveryStatus === 'Delivery' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    )}>
                      {po.DeliveryStatus}
                    </span>
                    <button 
                      onClick={() => {
                        const address = `${po.Name}, ${po.District}, ${po.State}, ${po.Pincode}, India`;
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-indigo-600 transition-colors"
                      title="View on Google Maps"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <InfoItem label="District" value={po.District} />
                  <InfoItem label="State" value={po.State} />
                  <InfoItem label="Circle" value={po.Circle} />
                  <InfoItem label="Branch Type" value={po.BranchType} />
                </div>
              </motion.div>
            ))}
          </div>

          <ReminderModal 
            isOpen={!!reminderPo} 
            onClose={() => setReminderPo(null)} 
            onSave={(title, desc, date) => onAddReminder({ title, description: desc, date, type: 'PIN' })}
            initialTitle={reminderPo ? `Visit: ${reminderPo.Name}` : ''}
            initialDesc={reminderPo ? `Post Office: ${reminderPo.Name}\nDistrict: ${reminderPo.District}\nPIN: ${reminderPo.Pincode}` : ''}
          />
        </div>
      )}
    </motion.div>
  );
}

function ToolsView({ onSearch, onAddReminder }: { onSearch: (t: any, q: string) => void, onAddReminder: (r: any) => void, key?: string }) {
  const [activeTool, setActiveTool] = useState<'ip' | 'phone' | 'weather' | 'currency' | 'gst' | 'company' | 'qr' | 'barcode' | 'url' | 'password' | 'random' | 'rc' | 'age' | 'dictionary' | 'crypto' | 'bmi' | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Utility Tools</h2>
        <p className="text-sm text-slate-500">Additional information lookup tools</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ToolCard icon={<Globe size={24} />} label="IP Info" active={activeTool === 'ip'} onClick={() => setActiveTool('ip')} />
        <ToolCard icon={<Phone size={24} />} label="Phone Info" active={activeTool === 'phone'} onClick={() => setActiveTool('phone')} />
        <ToolCard icon={<CloudSun size={24} />} label="Weather" active={activeTool === 'weather'} onClick={() => setActiveTool('weather')} />
        <ToolCard icon={<Coins size={24} />} label="Currency" active={activeTool === 'currency'} onClick={() => setActiveTool('currency')} />
        <ToolCard icon={<FileText size={24} />} label="GST Lookup" active={activeTool === 'gst'} onClick={() => setActiveTool('gst')} />
        <ToolCard icon={<Building size={24} />} label="Company Info" active={activeTool === 'company'} onClick={() => setActiveTool('company')} />
        <ToolCard icon={<QrCode size={24} />} label="QR Generator" active={activeTool === 'qr'} onClick={() => setActiveTool('qr')} />
        <ToolCard icon={<Barcode size={24} />} label="Barcode" active={activeTool === 'barcode'} onClick={() => setActiveTool('barcode')} />
        <ToolCard icon={<Link size={24} />} label="URL Shortener" active={activeTool === 'url'} onClick={() => setActiveTool('url')} />
        <ToolCard icon={<Lock size={24} />} label="Password" active={activeTool === 'password'} onClick={() => setActiveTool('password')} />
        <ToolCard icon={<User size={24} />} label="Random User" active={activeTool === 'random'} onClick={() => setActiveTool('random')} />
        <ToolCard icon={<Car size={24} />} label="RC Lookup" active={activeTool === 'rc'} onClick={() => setActiveTool('rc')} />
        <ToolCard icon={<Cake size={24} />} label="Age Calc" active={activeTool === 'age'} onClick={() => setActiveTool('age')} />
        <ToolCard icon={<Book size={24} />} label="Dictionary" active={activeTool === 'dictionary'} onClick={() => setActiveTool('dictionary')} />
        <ToolCard icon={<Bitcoin size={24} />} label="Crypto" active={activeTool === 'crypto'} onClick={() => setActiveTool('crypto')} />
        <ToolCard icon={<Zap size={24} />} label="BMI Calc" active={activeTool === 'bmi'} onClick={() => setActiveTool('bmi')} />
      </div>

      <AnimatePresence mode="wait">
        {activeTool === 'ip' && <IpTool key="ip" onSearch={(q) => onSearch('IP', q)} />}
        {activeTool === 'phone' && <PhoneTool key="phone" onSearch={(q) => onSearch('Phone', q)} />}
        {activeTool === 'weather' && <WeatherTool key="weather" onSearch={(q) => onSearch('Weather', q)} />}
        {activeTool === 'currency' && <CurrencyTool key="currency" onSearch={(q) => onSearch('Currency', q)} />}
        {activeTool === 'gst' && <GstTool key="gst" onSearch={(q) => onSearch('GST', q)} onAddReminder={onAddReminder} />}
        {activeTool === 'company' && <CompanyTool key="company" onSearch={(q) => onSearch('Company', q)} onAddReminder={onAddReminder} />}
        {activeTool === 'qr' && <QrTool key="qr" onSearch={(q) => onSearch('QR', q)} />}
        {activeTool === 'barcode' && <BarcodeTool key="barcode" onSearch={(q) => onSearch('Barcode', q)} />}
        {activeTool === 'url' && <UrlTool key="url" onSearch={(q) => onSearch('URL', q)} />}
        {activeTool === 'password' && <PasswordTool key="password" onSearch={(q) => onSearch('Password', q)} />}
        {activeTool === 'random' && <RandomUserTool key="random" onSearch={(q) => onSearch('RandomUser', q)} />}
        {activeTool === 'rc' && <RcTool key="rc" onSearch={(q) => onSearch('RC', q)} onAddReminder={onAddReminder} />}
        {activeTool === 'age' && <AgeCalculatorTool key="age" onSearch={(q) => onSearch('Age', q)} />}
        {activeTool === 'dictionary' && <DictionaryTool key="dictionary" onSearch={(q) => onSearch('Dictionary', q)} />}
        {activeTool === 'crypto' && <CryptoTool key="crypto" onSearch={(q) => onSearch('Crypto', q)} />}
        {activeTool === 'bmi' && <BmiTool key="bmi" onSearch={(q) => onSearch('BMI', q)} />}
      </AnimatePresence>
    </motion.div>
  );
}

function ToolCard({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "card p-6 flex flex-col items-center gap-3 transition-all duration-300",
        active ? "border-indigo-600 bg-indigo-600/5 ring-1 ring-indigo-600" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
      )}
    >
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", active ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500")}>
        {icon}
      </div>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

function IpTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const data = await getIpInfo(query);
      setResult(data);
      onSearch(query || 'My IP');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter IP Address (leave blank for yours)"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{result.ip}</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleShare(`IP Info: ${result.ip}`, `Org: ${result.org}\nLocation: ${result.city}, ${result.country_name}`)}
                className="p-1.5 rounded-lg hover:bg-indigo-600/10 text-indigo-600 transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <span className="text-xs text-gray-400">{result.org}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="City" value={result.city} />
            <InfoItem label="Region" value={result.region} />
            <InfoItem label="Country" value={result.country_name} />
            <InfoItem label="Postal" value={result.postal} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function PhoneTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      // Note: This requires an API key in a real app. 
      // For this demo, we'll simulate a response if no key is found or use a mock.
      const data = await getPhoneInfo(query, 'YOUR_API_KEY'); 
      setResult(data);
      onSearch(query);
    } catch (err) {
      // Mock data for demonstration if API fails without key
      setResult({
        valid: true,
        number: query,
        local_format: '01234 567890',
        international_format: '+91 12345 67890',
        country_prefix: '+91',
        country_code: 'IN',
        country_name: 'India',
        location: 'Mumbai',
        carrier: 'Reliance Jio',
        line_type: 'mobile'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="tel" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Phone Number with Country Code"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{result.international_format}</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleShare(`Phone Info: ${result.international_format}`, `Carrier: ${result.carrier}\nType: ${result.line_type}\nLocation: ${result.location}, ${result.country_name}`)}
                className="p-1.5 rounded-lg hover:bg-indigo-600/10 text-indigo-600 transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <span className="text-xs text-green-500 font-bold">VALID</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Carrier" value={result.carrier} />
            <InfoItem label="Type" value={result.line_type} />
            <InfoItem label="Country" value={result.country_name} />
            <InfoItem label="Location" value={result.location} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function WeatherTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WeatherData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      // Mocking for demo purposes
      setTimeout(() => {
        setResult({
          name: query,
          main: { temp: 28, feels_like: 30, humidity: 65 },
          weather: [{ description: 'partly cloudy', icon: '02d' }]
        });
        onSearch(query);
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter City Name"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-2xl">{result.name}</h3>
              <button 
                onClick={() => handleShare(`Weather in ${result.name}`, `Temp: ${result.main.temp}°C\nCondition: ${result.weather[0].description}\nHumidity: ${result.main.humidity}%`)}
                className="p-1.5 rounded-lg hover:bg-indigo-600/10 text-indigo-600 transition-colors"
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
            <p className="text-gray-500 capitalize">{result.weather[0].description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-xs"><span className="text-gray-400">Humidity:</span> {result.main.humidity}%</div>
              <div className="text-xs"><span className="text-gray-400">Feels like:</span> {result.main.feels_like}°C</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-indigo-600">{result.main.temp}°</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function CurrencyTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [amount, setAmount] = useState('100');
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const data = await getExchangeRates();
        setRates(data.rates);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="card p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase">Amount (INR)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="input-field text-2xl font-bold"
          />
        </div>

        {rates && (
          <div className="space-y-4">
            <CurrencyRow label="USD" value={Number(amount) * rates.USD} symbol="$" />
            <CurrencyRow label="EUR" value={Number(amount) * rates.EUR} symbol="€" />
            <CurrencyRow label="GBP" value={Number(amount) * rates.GBP} symbol="£" />
            
            <button 
              onClick={() => {
                const text = `USD: $${(Number(amount) * rates.USD).toFixed(2)}\nEUR: €${(Number(amount) * rates.EUR).toFixed(2)}\nGBP: £${(Number(amount) * rates.GBP).toFixed(2)}`;
                handleShare(`Currency Conversion for ${amount} INR`, text);
              }}
              className="w-full py-2 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm hover:bg-indigo-600/5 rounded-xl transition-colors"
            >
              <Share2 size={16} /> Share Rates
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CurrencyRow({ label, value, symbol }: { label: string, value: number, symbol: string }) {
  return (
    <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
      <span className="font-bold text-gray-500">{label}</span>
      <span className="text-xl font-bold text-indigo-600">{symbol}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  );
}

function GstTool({ onSearch, onAddReminder }: { onSearch: (q: string) => void, onAddReminder: (r: any) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GstData | null>(null);
  const [showReminder, setShowReminder] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      // Mocking for demo
      setTimeout(() => {
        setResult({
          gstin: query,
          lgnm: 'MASTERS INDIA PRIVATE LIMITED',
          stj: 'State Jurisdiction 1',
          dty: 'Regular',
          rgdt: '01/07/2017',
          sts: 'Active',
          pradr: {
            addr: {
              bnm: 'MASTERS INDIA',
              st: 'STREET 1',
              loc: 'LOCATION 1',
              bno: 'BUILDING 1',
              stcd: 'STATE CODE',
              dst: 'DISTRICT',
              flno: 'FLOOR 1',
              lt: '0',
              lg: '0',
              pncd: '110001'
            }
          }
        });
        onSearch(query);
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter GSTIN (e.g. 07AAAAA0000A1Z5)"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{result.lgnm}</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowReminder(true)}
                className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center hover:bg-indigo-600/20 transition-colors"
                title="Set Reminder"
              >
                <Bell size={16} />
              </button>
              <button 
                onClick={() => handleShare(`GST Details: ${result.lgnm}`, `GSTIN: ${result.gstin}\nStatus: ${result.sts}\nJurisdiction: ${result.stj}`)}
                className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center hover:bg-indigo-600/20 transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">{result.sts}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="GSTIN" value={result.gstin} />
            <InfoItem label="Type" value={result.dty} />
            <InfoItem label="Reg. Date" value={result.rgdt} />
            <InfoItem label="Jurisdiction" value={result.stj} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Principal Address</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {result.pradr.addr.bno}, {result.pradr.addr.bnm}, {result.pradr.addr.st}, {result.pradr.addr.loc}, {result.pradr.addr.dst}, {result.pradr.addr.pncd}
            </p>
          </div>

          <ReminderModal 
            isOpen={showReminder} 
            onClose={() => setShowReminder(false)} 
            onSave={(title, desc, date) => onAddReminder({ title, description: desc, date, type: 'GST' })}
            initialTitle={`GST Follow-up: ${result.lgnm}`}
            initialDesc={`GSTIN: ${result.gstin}\nJurisdiction: ${result.stj}`}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function CompanyTool({ onSearch, onAddReminder }: { onSearch: (q: string) => void, onAddReminder: (r: any) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompanyData | null>(null);
  const [showReminder, setShowReminder] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      // Mocking for demo
      setTimeout(() => {
        setResult({
          company_name: 'GOOGLE INDIA PRIVATE LIMITED',
          cin: query,
          registration_number: '123456',
          company_status: 'Active',
          company_category: 'Company limited by Shares',
          company_class: 'Private',
          date_of_incorporation: '16/12/2003',
          registered_office_address: 'No. 3, RMZ Infinity - Tower E, Old Madras Road, Bangalore, Karnataka, 560016',
          authorized_capital: '₹10,00,00,000',
          paid_up_capital: '₹5,00,00,000',
          listing_status: 'Unlisted'
        });
        onSearch(query);
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter CIN (e.g. U72200KA2003PTC033028)"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{result.company_name}</h3>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowReminder(true)}
                className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center hover:bg-indigo-600/20 transition-colors"
                title="Set Reminder"
              >
                <Bell size={16} />
              </button>
              <button 
                onClick={() => handleShare(`Company Details: ${result.company_name}`, `CIN: ${result.cin}\nStatus: ${result.company_status}\nIncorporation: ${result.date_of_incorporation}`)}
                className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center hover:bg-indigo-600/20 transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">{result.company_status}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="CIN" value={result.cin} />
            <InfoItem label="Class" value={result.company_class} />
            <InfoItem label="Inc. Date" value={result.date_of_incorporation} />
            <InfoItem label="Category" value={result.company_category} />
            <InfoItem label="Auth. Capital" value={result.authorized_capital} />
            <InfoItem label="Paid-up Capital" value={result.paid_up_capital} />
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registered Address</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{result.registered_office_address}</p>
          </div>

          <ReminderModal 
            isOpen={showReminder} 
            onClose={() => setShowReminder(false)} 
            onSave={(title, desc, date) => onAddReminder({ title, description: desc, date, type: 'COMPANY' })}
            initialTitle={`Company Follow-up: ${result.company_name}`}
            initialDesc={`CIN: ${result.cin}\nIncorporation Date: ${result.date_of_incorporation}`}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function QrTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [data, setData] = useState('');
  const [qrUrl, setQrUrl] = useState('');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    const url = getQrCodeUrl(data);
    setQrUrl(url);
    onSearch(data);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleGenerate} className="relative">
        <input 
          type="text" 
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Enter text or URL for QR Code"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          <QrCode size={20} />
        </button>
      </form>

      {qrUrl && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-8 flex flex-col items-center gap-6">
          <div className="p-4 bg-white rounded-2xl shadow-inner">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48" referrerPolicy="no-referrer" />
          </div>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => window.open(qrUrl, '_blank')}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} /> Download
            </button>
            <button 
              onClick={() => handleShare('QR Code', `Scan this QR code for: ${data}`, qrUrl)}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Share2 size={18} /> Share
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function BarcodeTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BarcodeData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      // Mocking for demo
      setTimeout(() => {
        setResult({
          products: [{
            barcode_number: query,
            product_name: 'Sample Product',
            category: 'Electronics',
            brand: 'Sample Brand',
            description: 'This is a sample product description for the barcode lookup demo.',
            images: ['https://picsum.photos/seed/product/200/200']
          }]
        });
        onSearch(query);
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter Barcode Number"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
        </button>
      </form>

      {result && result.products.map((product, idx) => (
        <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 flex gap-6">
          <img src={product.images[0]} alt={product.product_name} className="w-24 h-24 rounded-xl object-cover" referrerPolicy="no-referrer" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">{product.product_name}</h3>
              <button 
                onClick={() => handleShare(`Product: ${product.product_name}`, `Brand: ${product.brand}\nCategory: ${product.category}\nBarcode: ${product.barcode_number}`)}
                className="p-1.5 rounded-lg hover:bg-indigo-600/10 text-indigo-600 transition-colors"
                title="Share"
              >
                <Share2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InfoItem label="Brand" value={product.brand} />
              <InfoItem label="Category" value={product.category} />
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

function UrlTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [shortened, setShortened] = useState('');

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      // Mocking for demo
      setTimeout(() => {
        const mockShort = `https://tinyurl.com/${Math.random().toString(36).substring(7)}`;
        setShortened(mockShort);
        onSearch(url);
        setLoading(false);
      }, 800);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleShorten} className="relative">
        <input 
          type="url" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter long URL"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Link size={20} />}
        </button>
      </form>

      {shortened && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shortened URL</h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-black/5 dark:border-white/5">
              <span className="font-bold text-indigo-600 truncate mr-4">{shortened}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(shortened);
                  // toast
                }}
                className="p-2 hover:bg-indigo-600/10 rounded-lg text-indigo-600 transition-colors"
                title="Copy"
              >
                <Copy size={18} />
              </button>
              <button 
                onClick={() => handleShare('Shortened URL', `Here is the shortened link: ${shortened}`, shortened)}
                className="p-2 hover:bg-indigo-600/10 rounded-lg text-indigo-600 transition-colors"
                title="Share"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function PasswordTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(retVal);
    onSearch(`Generated ${length} chars`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="card p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password Length: {length}</h3>
            <input 
              type="range" 
              min="8" 
              max="32" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-32 accent-indigo-600"
            />
          </div>
          <button 
            onClick={generatePassword}
            className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw size={18} /> Generate Password
          </button>
        </div>

        {password && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-between">
            <span className="font-mono font-bold text-lg break-all mr-4">{password}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button 
                onClick={() => handleShare('Generated Password', `Password: ${password}`)}
                className="p-2 hover:bg-indigo-600/10 rounded-lg text-indigo-600 transition-colors"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(password)}
                className="p-2 hover:bg-indigo-600/10 rounded-lg text-indigo-600 transition-colors"
                title="Copy"
              >
                <Copy size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AgeCalculatorTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<{ years: number, months: number, days: number } | null>(null);

  const calculateAge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;
    
    const birth = new Date(birthDate);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();
    
    if (days < 0) {
      months--;
      const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += prevMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    setAge({ years, months, days });
    onSearch(`Age from ${birthDate}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={calculateAge} className="card p-6 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Date of Birth</label>
          <input 
            type="date" 
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="input-field"
          />
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
          <Cake size={18} /> Calculate Age
        </button>
      </form>

      {age && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-indigo-600">{age.years}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Years</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-indigo-600">{age.months}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Months</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-black text-indigo-600">{age.days}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Days</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function BmiTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState<number | null>(null);

  const calculateBmi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !height) return;
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    const result = w / (h * h);
    setBmi(result);
    onSearch(`W:${weight}kg H:${height}cm`);
  };

  const getStatus = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (val < 25) return { label: 'Normal', color: 'text-green-500' };
    if (val < 30) return { label: 'Overweight', color: 'text-yellow-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={calculateBmi} className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight (kg)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-field" placeholder="e.g. 70" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Height (cm)</label>
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="input-field" placeholder="e.g. 175" />
          </div>
        </div>
        <button type="submit" className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
          <Zap size={20} /> Calculate BMI
        </button>
      </form>

      {bmi && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 text-center space-y-2">
          <h3 className="text-4xl font-black text-indigo-600">{bmi.toFixed(1)}</h3>
          <p className={cn("font-bold uppercase tracking-widest", getStatus(bmi).color)}>
            {getStatus(bmi).label}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function DictionaryTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryData | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!word) return;
    setLoading(true);
    try {
      const data = await getDictionaryDefinition(word);
      setResult(data);
      onSearch(word);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Enter a word to define"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Book size={20} />}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-indigo-600 capitalize">{result.word}</h3>
              {result.phonetic && <p className="text-slate-400 font-mono text-sm">{result.phonetic}</p>}
            </div>
            <button 
              onClick={() => handleShare(`Definition: ${result.word}`, `Meaning: ${result.meanings[0].definitions[0].definition}`)}
              className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 transition-colors"
            >
              <Share2 size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {result.meanings.map((meaning, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {meaning.partOfSpeech}
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {meaning.definitions[0].definition}
                </p>
                {meaning.definitions[0].example && (
                  <p className="text-sm italic text-slate-400 border-l-2 border-primary/20 pl-3">
                    "{meaning.definitions[0].example}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function CryptoTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [data, setData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const prices = await getCryptoPrices();
      setData(prices);
      onSearch('Crypto Prices');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Top 10 Cryptocurrencies (INR)</h3>
        <button onClick={fetchPrices} className="p-2 text-indigo-600 hover:bg-indigo-600/10 rounded-lg transition-colors">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-3">
        {data.map((coin) => (
          <div key={coin.id} className="card p-4 flex items-center justify-between hover:border-indigo-600/30 transition-all group">
            <div className="flex items-center gap-3">
              <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
              <div>
                <h4 className="font-bold text-sm">{coin.name}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{coin.symbol}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-indigo-600">₹{coin.current_price.toLocaleString()}</p>
              <p className={cn(
                "text-[10px] font-bold",
                coin.price_change_percentage_24h >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function RandomUserTool({ onSearch }: { onSearch: (q: string) => void, key?: string }) {
  const [user, setUser] = useState<RandomUserData['results'][0] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await getRandomUser();
      setUser(data.results[0]);
      onSearch('Random User');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <button 
        onClick={fetchUser}
        disabled={loading}
        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : <User size={18} />}
        Generate Random User
      </button>

      {user && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 flex flex-col items-center text-center gap-4">
          <div className="flex justify-between items-start w-full">
            <div className="flex flex-col items-center text-center gap-2">
              <img src={user.picture.large} alt="User" className="w-24 h-24 rounded-full border-4 border-indigo-600/20 shadow-xl" referrerPolicy="no-referrer" />
              <div>
                <h3 className="font-bold text-xl">{user.name.first} {user.name.last}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => handleShare(`Random User: ${user.name.first} ${user.name.last}`, `Email: ${user.email}\nPhone: ${user.phone}\nLocation: ${user.location.city}, ${user.location.country}`)}
              className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20 transition-colors"
              title="Share"
            >
              <Share2 size={20} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full text-left">
            <InfoItem label="Phone" value={user.phone} />
            <InfoItem label="Nationality" value={user.nat} />
            <InfoItem label="City" value={user.location.city} />
            <InfoItem label="Country" value={user.location.country} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function RcTool({ onSearch, onAddReminder }: { onSearch: (q: string) => void, onAddReminder: (r: any) => void, key?: string }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RCData | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [checkingChallan, setCheckingChallan] = useState(false);
  const [challans, setChallans] = useState<any[] | null>(null);

  const checkChallans = () => {
    setCheckingChallan(true);
    setTimeout(() => {
      setChallans([
        { id: 'CHL90812', amount: 500, reason: 'Over speeding', date: '15-Feb-2024', status: 'PENDING' }
      ]);
      setCheckingChallan(false);
    }, 1500);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query) return;
    setLoading(true);
    try {
      // Mocking for demo
      setTimeout(() => {
        setResult({
          registration_number: query.toUpperCase(),
          owner_name: 'RAJESH KUMAR SINGH',
          vehicle_make_model: 'MARUTI SUZUKI SWIFT VXI',
          fuel_type: 'PETROL',
          engine_number: 'K12MN7890123',
          chassis_number: 'MA3FDE456G7890123',
          registration_date: '12-Jan-2022',
          fitness_upto: '11-Jan-2037',
          insurance_upto: '10-Jan-2025',
          insurance_company: 'ICICI LOMBARD GIC LTD',
          insurance_policy_number: '3001/2024/567890',
          insurance_status: 'ACTIVE',
          road_tax_upto: '11-Jan-2037',
          road_tax_status: 'PAID',
          pucc_upto: '15-Jul-2024',
          pucc_status: 'ACTIVE',
          rto_name: 'DL-01 (NEW DELHI)',
          vehicle_class: 'MOTOR CAR (LMV)',
          status: 'ACTIVE'
        });
        onSearch(query);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter Vehicle Number (e.g. DL01AB1234)"
          className="input-field pr-12"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors">
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Car size={20} />}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card overflow-hidden">
          <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
            <div>
              <h3 className="text-xs font-bold opacity-70 uppercase tracking-widest">Registration Number</h3>
              <p className="text-xl font-black">{result.registration_number}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowReminder(true)}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Set Reminder"
              >
                <Bell size={20} />
              </button>
              <button 
                onClick={() => handleShare(`Vehicle Details: ${result.registration_number}`, `Owner: ${result.owner_name}\nModel: ${result.vehicle_make_model}\nReg Date: ${result.registration_date}`)}
                className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Share"
              >
                <Share2 size={20} />
              </button>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Car size={24} />
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <User size={20} />
              </div>
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Owner Name</h3>
                <p className="font-bold text-lg">{result.owner_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <InfoItem label="Make & Model" value={result.vehicle_make_model} />
              <InfoItem label="Fuel Type" value={result.fuel_type} />
              <InfoItem label="Reg. Date" value={result.registration_date} />
              <InfoItem label="Vehicle Class" value={result.vehicle_class} />
              <InfoItem label="Insurance Upto" value={result.insurance_upto} />
              <InfoItem label="Insurance Status" value={result.insurance_status || 'ACTIVE'} />
              <InfoItem label="Fitness Upto" value={result.fitness_upto} />
              <InfoItem label="Road Tax Upto" value={result.road_tax_upto || 'N/A'} />
              <InfoItem label="Road Tax Status" value={result.road_tax_status || 'PAID'} />
              <InfoItem label="PUCC Upto" value={result.pucc_upto || 'N/A'} />
              <InfoItem label="Insurance Co." value={result.insurance_company || 'N/A'} />
              <InfoItem label="Policy No." value={result.insurance_policy_number || 'N/A'} />
              <InfoItem label="Status" value={result.status || 'N/A'} />
            </div>

            <div className="space-y-4">
              <button 
                onClick={checkChallans}
                disabled={checkingChallan}
                className="w-full py-3 rounded-xl border-2 border-dashed border-indigo-600/30 text-indigo-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-600/5 transition-all"
              >
                {checkingChallan ? <Loader2 className="animate-spin" size={18} /> : <AlertTriangle size={18} />}
                Check Traffic Challans
              </button>

              {challans && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pending Challans ({challans.length})</h4>
                  {challans.map((chl) => (
                    <div key={chl.id} className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-rose-600 dark:text-rose-400 text-sm">{chl.reason}</p>
                        <p className="text-[10px] text-rose-400 font-bold uppercase">{chl.id} • {chl.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-rose-600 dark:text-rose-400">₹{chl.amount}</p>
                        <span className="text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded uppercase">{chl.status}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <MapPin size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">RTO Information</span>
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">{result.rto_name}</p>
            </div>
          </div>

          <ReminderModal 
            isOpen={showReminder} 
            onClose={() => setShowReminder(false)} 
            onSave={(title, desc, date) => onAddReminder({ title, description: desc, date, type: 'RC' })}
            initialTitle={`Renew: ${result.registration_number}`}
            initialDesc={`Vehicle: ${result.vehicle_make_model}\nInsurance Upto: ${result.insurance_upto}\nFitness Upto: ${result.fitness_upto}`}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string, value: string }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</h3>
      <p className="text-sm font-bold truncate">{value || 'N/A'}</p>
    </div>
  );
}

function ReminderModal({ isOpen, onClose, onSave, initialTitle = '', initialDesc = '' }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (title: string, desc: string, date: string) => void,
  initialTitle?: string,
  initialDesc?: string
}) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-border dark:border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600">
            <Bell size={20} />
          </div>
          <h2 className="text-xl font-bold">Set Reminder</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Reminder Title"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Description</label>
            <textarea 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Details..."
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Date</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-border dark:border-white/10 font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              onSave(title, desc, date);
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 hover:opacity-90 transition-opacity"
          >
            Save Reminder
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function RemindersView() {
  const { reminders, removeReminder, clearReminders } = useReminders();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Reminders</h2>
          <p className="text-sm text-gray-500">Manage your important tasks and follow-ups</p>
        </div>
        {reminders.length > 0 && (
          <button 
            onClick={clearReminders}
            className="text-xs font-bold text-error hover:underline flex items-center gap-1"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        )}
      </div>

      {reminders.length === 0 ? (
        <div className="card p-12 flex flex-col items-center text-center gap-4 opacity-50">
          <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-gray-400">
            <Bell size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">No reminders set</h3>
            <p className="text-sm">Set reminders from search results to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder) => (
            <motion.div 
              key={reminder.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-5 flex justify-between items-start gap-4"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{reminder.type}</span>
                    <span className="text-[10px] font-bold text-gray-400">•</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{reminder.date}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{reminder.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{reminder.description}</p>
                </div>
              </div>
              <button 
                onClick={() => removeReminder(reminder.id)}
                className="p-2 rounded-lg hover:bg-error/10 text-gray-400 hover:text-error transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
