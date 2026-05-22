"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search as SearchIcon, 
  MapPin, 
  Briefcase, 
  ChevronLeft, 
  Zap, 
  Layers, 
  Navigation, 
  Sparkles, 
  Bell, 
  User, 
  ShieldCheck, 
  Star, 
  MessageSquare, 
  Phone, 
  Compass, 
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  Award,
  AlertCircle,
  X,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';
import { GUWAHATI_AREAS } from '@/lib/location';
import WorkerModal from '@/components/search/WorkerModal';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

const LiveMapView = dynamic(() => import('@/components/search/LiveMapView'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase animate-pulse">Loading Live Map...</p>
      </div>
    </div>
  )
});

// Haversine distance calculator
const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function MapSearchPage() {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  return (
    <APIProvider apiKey={API_KEY}>
      <SearchPageContent />
    </APIProvider>
  );
}

function SearchPageContent() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [workers, setWorkers] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search States
  const [locationQuery, setLocationQuery] = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [workDuration, setWorkDuration] = useState('Hourly'); // Hourly, 6 Hours, Full Day, Emergency
  const [mapCenter, setMapCenter] = useState({ lat: 26.1456, lng: 91.6789 });

  // AI Search States
  const [searchMode, setSearchMode] = useState<'standard' | 'ai'>('standard');
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExtractedInfo, setAiExtractedInfo] = useState<any>(null);
  
  // UI States
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [hoveredWorkerId, setHoveredWorkerId] = useState<string | null>(null);
  const [showSkillHints, setShowSkillHints] = useState(false);
  const [showLocationHints, setShowLocationHints] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Mobile bottom sheet state
  const [bottomSheetState, setBottomSheetState] = useState<'collapsed' | 'half' | 'full'>('half');
  const [isMobile, setIsMobile] = useState(false);

  // Active filter chips
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Booking & Chat modal states
  const [bookingSuccessModal, setBookingSuccessModal] = useState<any>(null);
  const [chatModalWorker, setChatModalWorker] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');

  // Google Maps Autocomplete
  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const [autocompleteService, setAutocompleteService] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);
  const [googleSuggestions, setGoogleSuggestions] = useState<any[]>([]);

  // Detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (placesLib) {
      setAutocompleteService(new placesLib.AutocompleteService());
    }
  }, [placesLib]);

  useEffect(() => {
    if (geocodingLib) {
      setGeocoder(new geocodingLib.Geocoder());
    }
  }, [geocodingLib]);

  // Fetch google autocomplete suggestions
  useEffect(() => {
    if (!autocompleteService || !locationQuery || locationQuery === 'Selected Area' || locationQuery === 'My Location') {
      setGoogleSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      autocompleteService.getPlacePredictions(
        {
          input: locationQuery,
          componentRestrictions: { country: 'in' },
        },
        (predictions: any, status: any) => {
          if (status === 'OK' && predictions) {
            setGoogleSuggestions(
              predictions.map((p: any) => ({
                name: p.structured_formatting.main_text,
                description: p.description,
                placeId: p.place_id,
              }))
            );
          } else {
            setGoogleSuggestions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [locationQuery, autocompleteService]);

  // Fetch initial worker and skill data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [workersRes, skillsRes] = await Promise.all([
          api.get('/workers/search'),
          api.get('/workers/skills')
        ]);
        setWorkers(workersRes.data);
        setSkills(skillsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle GPS search to detect user's current location
  const handleGPSDetect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          setLocationQuery('My Location');
          setShowLocationHints(false);
        },
        (err) => {
          console.error("GPS detection failed, fallback to default", err);
          alert("Could not retrieve GPS location. Please type manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearch = () => {
    if (locationQuery && locationQuery !== 'My Location' && locationQuery !== 'Selected Area') {
      // First try matching local predefined Guwahati areas
      const area = GUWAHATI_AREAS.find(a => a.name.toLowerCase() === locationQuery.toLowerCase());
      if (area) {
        setMapCenter({ lat: area.lat, lng: area.lng });
      } else if (geocoder) {
        // Resolve custom query via Google Geocoder
        geocoder.geocode({ address: locationQuery, componentRestrictions: { country: 'in' } }, (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            const geometry = results[0].geometry;
            if (geometry && geometry.location) {
              setMapCenter({
                lat: geometry.location.lat(),
                lng: geometry.location.lng(),
              });
              setLocationQuery(results[0].formatted_address.split(',')[0]);
            }
          }
        });
      }
    }

    if (skillSearch && !selectedSkill) {
      const matchedSkill = skills.find(s => s.name.toLowerCase().includes(skillSearch.toLowerCase()));
      if (matchedSkill) {
        setSelectedSkill(matchedSkill.id);
        setSkillSearch(matchedSkill.name);
      }
    }

    setShowSkillHints(false);
    setShowLocationHints(false);
    
    // Automatically maximize/restore bottom sheet after query
    if (isMobile) {
      setBottomSheetState('half');
    }
  };

  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiExtractedInfo(null);
    try {
      const res = await api.post('/ai/search', { query: aiQuery });
      if (res.data && res.data.success) {
        setWorkers(res.data.workers || []);
        setAiExtractedInfo(res.data.extracted);
        
        // Match center lat/lng if the location was matched by AI
        if (res.data.extracted?.matchedArea) {
          const { lat, lng } = res.data.extracted.matchedArea;
          setMapCenter({ lat, lng });
        }
        
        // Also update standard search fields so user can transition back/inspect details
        if (res.data.extracted?.skill) {
          const matchedSkill = skills.find((s: any) => s.name.toLowerCase().includes(res.data.extracted.skill.toLowerCase()));
          if (matchedSkill) {
            setSelectedSkill(matchedSkill.id);
            setSkillSearch(matchedSkill.name);
          } else {
            setSelectedSkill('');
            setSkillSearch(res.data.extracted.skill);
          }
        }
        if (res.data.extracted?.location) {
          setLocationQuery(res.data.extracted.location);
        }
      }
    } catch (err) {
      console.error('AI search failed:', err);
      alert('AI search is temporarily unavailable. Using standard search fallback.');
    } finally {
      setAiLoading(false);
      if (isMobile) {
        setBottomSheetState('half');
      }
    }
  };

  const handleSelectLocation = (loc: any) => {
    setLocationQuery(loc.name);
    setShowLocationHints(false);

    if (loc.lat && loc.lng) {
      setMapCenter({ lat: loc.lat, lng: loc.lng });
      return;
    }

    if (geocoder) {
      if (loc.placeId) {
        geocoder.geocode({ placeId: loc.placeId }, (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            const geometry = results[0].geometry;
            if (geometry && geometry.location) {
              setMapCenter({
                lat: geometry.location.lat(),
                lng: geometry.location.lng(),
              });
            }
          }
        });
      } else if (loc.description) {
        geocoder.geocode({ address: loc.description }, (results: any, status: any) => {
          if (status === 'OK' && results?.[0]) {
            const geometry = results[0].geometry;
            if (geometry && geometry.location) {
              setMapCenter({
                lat: geometry.location.lat(),
                lng: geometry.location.lng(),
              });
            }
          }
        });
      }
    }
  };

  const toggleFilter = (filterKey: string) => {
    const nextFilters = new Set(activeFilters);
    if (nextFilters.has(filterKey)) {
      nextFilters.delete(filterKey);
    } else {
      nextFilters.add(filterKey);
    }
    setActiveFilters(nextFilters);
  };

  const handleBookNow = (w: any) => {
    if (!user) {
      router.push('/auth/login?redirect=/search');
      return;
    }
    // Simulate booking order creation
    setBookingSuccessModal({
      worker: w,
      bookingId: `BK-${Math.floor(100000 + Math.random() * 900000)}`,
      amount: w.skills?.[0]?.skill?.baseRate || 500,
      duration: workDuration
    });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    alert(`Message sent to ${chatModalWorker.user.name}: "${chatMessage}"`);
    setChatMessage('');
    setChatModalWorker(null);
  };

  // AI-based Fuzzy Search Algorithm
  const smartSearch = (query: string, target: string) => {
    if (!query) return true;
    const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
    const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (t.includes(q)) return true;
    
    let qIdx = 0;
    for (let i = 0; i < t.length && qIdx < q.length; i++) {
      if (t[i] === q[qIdx]) qIdx++;
    }
    return qIdx === q.length;
  };

  // Filter skills and suggestions
  const availableSkillIds = new Set(workers.flatMap(w => w.skills?.map((s: any) => s.skillId) || []));
  const dynamicSkills = skills.filter(s => availableSkillIds.has(s.id));
  const filteredSkills = dynamicSkills.filter(s => smartSearch(skillSearch, s.name));
  const filteredLocalLocations = GUWAHATI_AREAS.filter(loc => smartSearch(locationQuery, loc.name));

  const formattedLocalLocations = filteredLocalLocations.map(loc => ({
    name: loc.name,
    description: `${loc.name}, Guwahati, Assam`,
    lat: loc.lat,
    lng: loc.lng,
    isLocal: true,
  }));

  const combinedSuggestions = [
    ...formattedLocalLocations,
    ...googleSuggestions.filter(g => 
      !formattedLocalLocations.some(l => l.name.toLowerCase() === g.name.toLowerCase())
    )
  ];

  // Process and filter/sort workers
  const processedWorkers = useMemo(() => {
    let result = workers.map(w => {
      const distance = haversineKm(mapCenter.lat, mapCenter.lng, w.currentLat || 26.1456, w.currentLng || 91.6789);
      // Fallback rate
      const baseRate = w.skills?.[0]?.skill?.baseRate || 500;
      
      return {
        ...w,
        distance,
        baseRate,
        experienceYears: Math.floor((w.rating || 4.5) * 2), // Mock experience years
        isFemale: w.user.name.toLowerCase().includes('sita') || 
                  w.user.name.toLowerCase().includes('devi') || 
                  w.user.name.toLowerCase().includes('eve') ||
                  w.user.gender?.toLowerCase() === 'female'
      };
    });

    // Skill Filter
    if (selectedSkill === 'others') {
      result = result.filter(w => w.id.length % 2 === 0);
    } else if (selectedSkill) {
      result = result.filter(w => w.skills.some((s: any) => s.skillId === selectedSkill));
    } else if (skillSearch && skillSearch.toLowerCase() !== 'all workers' && skillSearch.toLowerCase() !== 'all professions') {
      result = result.filter(w => w.skills.some((s: any) => s.skill.name.toLowerCase().includes(skillSearch.toLowerCase())));
    }

    // Chip Filters
    if (activeFilters.has('Nearby')) {
      result = result.filter(w => w.distance <= 4.0); // Within 4km
    }
    if (activeFilters.has('Verified')) {
      result = result.filter(w => w.isVerified);
    }
    if (activeFilters.has('Top Rated')) {
      result = result.filter(w => w.rating >= 4.7);
    }
    if (activeFilters.has('Available Now')) {
      result = result.filter(w => w.isAvailable);
    }
    if (activeFilters.has('Emergency')) {
      result = result.filter(w => w.isAvailable && w.rating >= 4.7);
    }
    if (activeFilters.has('Female Worker')) {
      result = result.filter(w => w.isFemale);
    }
    if (activeFilters.has('Experienced')) {
      result = result.filter(w => w.experienceYears >= 5);
    }

    // Sort cheapest first
    if (activeFilters.has('Cheapest')) {
      result.sort((a, b) => a.baseRate - b.baseRate);
    } else if (searchMode === 'ai') {
      // Sort by AI Score descending
      result.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    } else {
      // Default: sort by proximity (closest first)
      result.sort((a, b) => a.distance - b.distance);
    }

    return result;
  }, [workers, selectedSkill, skillSearch, mapCenter, activeFilters, searchMode]);

  // Snaps bottom sheet state cycles
  const handleSwipeToggle = () => {
    if (bottomSheetState === 'collapsed') setBottomSheetState('half');
    else if (bottomSheetState === 'half') setBottomSheetState('full');
    else setBottomSheetState('collapsed');
  };

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      
      {/* 1. TOP STICKY NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-[100] h-16 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-black text-slate-800 tracking-tight">
                Hire<span className="text-blue-600">Me</span>
              </span>
              <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest -mt-0.5">AI Marketplace</span>
            </div>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden md:block" />
          <span className="text-xs font-bold text-slate-400 hidden md:block uppercase tracking-wider">Service Search Engine</span>
        </div>

        {/* Center Search Shortcut indicator (Airbnb style) */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full cursor-pointer hover:bg-slate-100 transition-colors shadow-inner">
          <Compass size={14} className="text-blue-600" />
          <span className="text-xs font-black text-slate-700">Explore Nearby Providers</span>
        </div>

        {/* Right Nav Options */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:inline-flex px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black rounded-xl transition-all active:scale-95">
            Become a Worker
          </button>
          
          <div className="relative">
            <button className="p-2 text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-xl transition-all relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200" />

          {/* User Account Controls */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 py-1.5 pl-1.5 pr-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all active:scale-98"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-black text-slate-700 hidden sm:block max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-[110]"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed In As</p>
                      <p className="text-xs font-extrabold text-slate-800 truncate">{user.email}</p>
                    </div>
                    <Link href="/dashboard" className="block px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-slate-50"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link 
              href="/auth/login?redirect=/search" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
            >
              <User size={14} />
              Login / Register
            </Link>
          )}
        </div>
      </nav>

      {/* Main Inner Area Container */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* 2. FLOATING SEARCH PANEL */}
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pt-4 pb-2 z-40">
          {/* Search Mode Toggle */}
          <div className="flex items-center gap-3 mb-3 pl-2">
            <button 
              onClick={() => {
                setSearchMode('standard');
                setAiExtractedInfo(null);
              }}
              className={`text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                searchMode === 'standard' 
                  ? 'text-blue-600 bg-blue-50 border border-blue-100 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 bg-transparent border border-transparent'
              }`}
            >
              <SlidersHorizontal size={12} />
              Standard Search
            </button>
            <button 
              onClick={() => setSearchMode('ai')} 
              className={`text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                searchMode === 'ai' 
                  ? 'text-purple-600 bg-purple-50 border border-purple-100 shadow-sm font-extrabold' 
                  : 'text-slate-500 hover:text-slate-700 bg-transparent border border-transparent'
              }`}
            >
              <Sparkles size={12} className="text-purple-500 animate-pulse" />
              AI Smart Search
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-3 p-3 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-3xl shadow-xl">
            {searchMode === 'standard' ? (
              <>
                {/* Field A: Location Input */}
                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-100 md:pr-2">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Where do you need help?" 
                    value={locationQuery}
                    onFocus={() => setShowLocationHints(true)}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                         const bestMatch = combinedSuggestions[0];
                         if (bestMatch) handleSelectLocation(bestMatch);
                         else handleSearch();
                      }
                    }}
                    className="w-full bg-transparent pl-11 pr-10 py-3 text-sm font-extrabold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button 
                    onClick={handleGPSDetect}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                    title="Use Current Location"
                  >
                    <Compass size={16} />
                  </button>

                  <AnimatePresence>
                    {showLocationHints && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[60]"
                      >
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-blue-600" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Suggested Areas</span>
                          </div>
                          <button onClick={() => setShowLocationHints(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={12} />
                          </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto py-1">
                          {combinedSuggestions.map((loc, idx) => (
                            <button 
                              key={idx}
                              onMouseDown={(e) => { 
                                e.preventDefault();
                                handleSelectLocation(loc);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs text-slate-600 flex flex-col justify-center border-b border-slate-50 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <Navigation size={12} className={loc.isLocal ? "text-blue-500" : "text-purple-500"} />
                                <span className="font-extrabold text-slate-800">{loc.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-400 pl-5">{loc.description}</span>
                            </button>
                          ))}
                          {combinedSuggestions.length === 0 && (
                            <div className="px-4 py-3 text-xs text-slate-400 italic">Type to search local areas...</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Field B: Skill Selector */}
                <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-100 md:px-2">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="What skill are you seeking?" 
                    value={skillSearch}
                    onFocus={() => setShowSkillHints(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearch();
                    }}
                    onChange={(e) => {
                      setSkillSearch(e.target.value);
                      if (e.target.value === '') setSelectedSkill('');
                    }}
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm font-extrabold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                  
                  <AnimatePresence>
                    {showSkillHints && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-[60]"
                      >
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles size={12} className="text-purple-600" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">AI Skill Intelligence</span>
                          </div>
                          <button onClick={() => setShowSkillHints(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={12} />
                          </button>
                        </div>
                        <div className="max-h-60 overflow-y-auto py-1">
                          <button 
                            onMouseDown={(e) => { 
                              e.preventDefault();
                              setSelectedSkill(''); 
                              setSkillSearch('All Workers'); 
                              setShowSkillHints(false); 
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs text-slate-700 font-extrabold flex items-center gap-2 border-b border-slate-50"
                          >
                            <Layers size={14} className="text-blue-500" />
                            All Professions
                          </button>
                          {filteredSkills.map(skill => (
                            <button 
                              key={skill.id}
                              onMouseDown={(e) => { 
                                e.preventDefault();
                                setSelectedSkill(skill.id); 
                                setSkillSearch(skill.name); 
                                setShowSkillHints(false); 
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs text-slate-600 flex items-center gap-2 border-b border-slate-50 last:border-0"
                            >
                              <Zap size={14} className="text-amber-500" />
                              {skill.name}
                            </button>
                          ))}
                          <button 
                            onMouseDown={(e) => { 
                              e.preventDefault();
                              setSelectedSkill('others'); 
                              setSkillSearch('Others'); 
                              setShowSkillHints(false); 
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs text-slate-600 flex items-center gap-2"
                          >
                            <Zap size={14} className="text-purple-500" />
                            Others
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Field C: Work Duration Dropdown */}
                <div className="flex-1 relative md:px-2 flex items-center">
                  <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select 
                    value={workDuration}
                    onChange={(e) => setWorkDuration(e.target.value)}
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm font-extrabold text-slate-700 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="Hourly">Hourly Rate</option>
                    <option value="6 Hours">6 Hours Package</option>
                    <option value="Full Day">Full Day Slot</option>
                    <option value="Emergency">Emergency Quick Hire</option>
                  </select>
                  <div className="absolute right-4 pointer-events-none text-slate-400">
                    ▼
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  onClick={handleSearch}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 shrink-0"
                >
                  <SearchIcon size={16} />
                  Search
                </button>
              </>
            ) : (
              <>
                {/* AI Query Input */}
                <div className="flex-1 relative flex items-center">
                  <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 animate-pulse" size={18} />
                  <input 
                    type="text" 
                    placeholder="Describe what you need (e.g. 'I need a verified plumber near Paltan Bazar' or 'highly rated electrician in Beltola')" 
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAISearch();
                    }}
                    className="w-full bg-transparent pl-11 pr-4 py-3 text-sm font-extrabold text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                
                {/* AI Search Submit Button */}
                <button 
                  onClick={handleAISearch}
                  disabled={aiLoading}
                  className="bg-purple-600 hover:bg-purple-500 disabled:bg-purple-400 text-white px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 active:scale-95 shrink-0"
                >
                  {aiLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {aiLoading ? 'Analyzing Query...' : 'AI Search'}
                </button>
              </>
            )}
          </div>

          {/* AI Extracted Info Badge Banner */}
          {searchMode === 'ai' && aiExtractedInfo && (
            <div className="mt-3 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-purple-600 animate-bounce" />
                <span className="text-xs text-slate-600 font-extrabold">
                  AI extracted: <span className="text-purple-700 bg-purple-100/50 px-2 py-0.5 rounded-lg border border-purple-200/50 font-black">{aiExtractedInfo.skill || 'Any skill'}</span>
                  {aiExtractedInfo.location && (
                    <> in <span className="text-indigo-700 bg-indigo-100/50 px-2 py-0.5 rounded-lg border border-indigo-200/50 font-black">{aiExtractedInfo.location}</span></>
                  )}
                </span>
              </div>
              {aiExtractedInfo.matchedArea && (
                <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-black uppercase tracking-wider">
                  <MapPin size={10} />
                  Map centered on {aiExtractedInfo.matchedArea.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. SCROLLABLE FILTER CHIPS ROW */}
        <div className="w-full max-w-6xl mx-auto px-4 md:px-6 mb-4 z-30">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {['Nearby', 'Verified', 'Top Rated', 'Cheapest', 'Available Now', 'Emergency', 'Female Worker', 'Experienced'].map((chip) => {
              const isActive = activeFilters.has(chip);
              return (
                <button
                  key={chip}
                  onClick={() => toggleFilter(chip)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap border ${
                    isActive 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. MAIN SPLIT LAYOUT (Sidebar | Map) */}
        <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
          
          {/* Backdrops for suggestions dropdowns click-outs */}
          {(showSkillHints || showLocationHints) && (
            <div 
              className="absolute inset-0 z-35 bg-transparent" 
              onClick={() => { setShowSkillHints(false); setShowLocationHints(false); }} 
            />
          )}

          {/* LEFT SECTION: SCROLLABLE SIDEBAR (On desktop) / BOTTOM SHEET DRAWER (On mobile) */}
          <motion.div 
            animate={isMobile ? { height: bottomSheetHeights[bottomSheetState] } : {}}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`
              md:w-[440px] w-full md:h-full bg-white md:bg-slate-50 border-t md:border-t-0 md:border-r border-slate-200/80 shadow-2xl md:shadow-none z-40 rounded-t-[32px] md:rounded-t-none flex flex-col overflow-hidden
              ${isMobile ? 'absolute bottom-0 left-0 right-0' : 'relative h-full shrink-0'}
            `}
          >
            {/* Mobile Drag Indicator Handle */}
            <div 
              className="md:hidden w-full py-4 flex flex-col items-center justify-center cursor-pointer border-b border-slate-100 hover:bg-slate-50 transition-colors"
              onClick={handleSwipeToggle}
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {bottomSheetState === 'collapsed' ? 'Swipe Up for list' : 'Swipe Down for map'}
              </span>
            </div>

            {/* Sidebar List Header */}
            <div className="p-5 border-b border-slate-200/60 bg-white/70 backdrop-blur flex justify-between items-center shrink-0">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Professionals</p>
                <h2 className="text-xl font-black text-slate-800 tracking-tight mt-0.5">
                  {processedWorkers.length} {processedWorkers.length === 1 ? 'expert' : 'experts'} nearby
                </h2>
              </div>
              <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <TrendingUp size={12} />
                Live Sync
              </div>
            </div>

            {/* Scrollable list of worker cards */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              {processedWorkers.map((worker) => (
                <div
                  key={worker.id}
                  onMouseEnter={() => setHoveredWorkerId(worker.id)}
                  onMouseLeave={() => setHoveredWorkerId(null)}
                  className={`p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative ${
                    hoveredWorkerId === worker.id ? 'border-blue-400 ring-1 ring-blue-400/20 bg-blue-50/10' : ''
                  }`}
                >
                  {/* Top line details */}
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex gap-3">
                      {/* Avatar container */}
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
                          <img
                            src={worker.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.user.name)}&background=2563EB&color=fff&bold=true`}
                            alt={worker.user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {worker.isVerified && (
                          <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-md shadow-md border border-white">
                            <ShieldCheck size={12} />
                          </div>
                        )}
                      </div>

                      {/* Name & Skill */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-slate-800 hover:text-blue-600 transition-colors uppercase tracking-tight flex items-center gap-1">
                            {worker.user.name}
                            {worker.isFemale ? (
                              <span className="text-rose-500 font-black text-sm" title="Female">♀</span>
                            ) : (
                              <span className="text-blue-500 font-black text-sm" title="Male">♂</span>
                            )}
                          </h4>
                          {worker.isGroupLeader && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 border border-purple-100 rounded text-[9px] font-bold">
                              Leader
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                          {worker.skills?.[0]?.skill?.name || 'General Skilled Hand'}
                        </p>
                        
                        <div className="flex items-center gap-1 mt-1.5">
                          <div className="flex items-center text-amber-500">
                            <Star size={12} className="fill-current" />
                            <span className="text-xs font-black text-slate-800 ml-1">{worker.rating?.toFixed(1) || '4.8'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">({worker.reviewCount || 12} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {/* Rate box */}
                    <div className="text-right shrink-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rate</p>
                      <p className="font-black text-base text-slate-800">
                        ₹{workDuration === '6 Hours' 
                          ? Math.floor(worker.baseRate * 0.9 * 6)
                          : workDuration === 'Full Day'
                          ? Math.floor(worker.baseRate * 1.5)
                          : worker.baseRate}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">
                        {workDuration === '6 Hours' ? 'per 6 hrs' : workDuration === 'Full Day' ? 'per day' : 'per hour'}
                      </p>
                      {searchMode === 'ai' && worker.aiScore !== undefined && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg text-[9px] font-black mt-1.5">
                          <Sparkles size={8} className="text-purple-500 animate-pulse" />
                          {Math.round(worker.aiScore * 100)}% Match
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mid attributes section */}
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 pb-3 mb-4 text-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Distance</p>
                      <p className="text-xs font-extrabold text-slate-700">{worker.distance.toFixed(1)} km away</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Experience</p>
                      <p className="text-xs font-extrabold text-slate-700">{worker.experienceYears} Years</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Availability</p>
                      <p className="text-xs font-extrabold text-emerald-600 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Online
                      </p>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBookNow(worker); }}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-blue-500/10 flex items-center justify-center gap-1"
                    >
                      <Zap size={13} />
                      Hire Now
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setChatModalWorker(worker); }}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs transition-all active:scale-95 flex items-center justify-center gap-1 border border-slate-200/50"
                    >
                      <MessageSquare size={13} />
                      Chat
                    </button>
                  </div>
                </div>
              ))}

              {processedWorkers.length === 0 && (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
                  <AlertCircle className="mx-auto text-slate-400 mb-2" size={24} />
                  <p className="text-sm font-black text-slate-600">No workers match active filters.</p>
                  <button 
                    onClick={() => { setActiveFilters(new Set()); setSelectedSkill(''); setSkillSearch(''); }}
                    className="mt-3 text-xs font-black text-blue-600 hover:text-blue-500 uppercase tracking-wider"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT SECTION: MAP CONTAINER */}
          <div className="flex-1 h-full relative z-10">
            <LiveMapView 
              workers={processedWorkers} 
              center={mapCenter} 
              onWorkerClick={(w) => setSelectedWorker(w)} 
              onMapClick={(lat, lng) => {
                setMapCenter({ lat, lng });
                setLocationQuery("Selected Area");
                setShowSkillHints(false);
              }}
              hoveredWorkerId={hoveredWorkerId}
            />

            {/* Quick stats floating drawer */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-30">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl min-w-[160px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Search Area</p>
                 <p className="text-xs font-black text-blue-600 flex items-center gap-1.5 mt-1 truncate">
                   <Navigation size={12} className="fill-current text-blue-500" />
                   {locationQuery || "Guwahati Metro"}
                 </p>
              </div>
            </div>

            {/* Floating Quick Emergency Hiring Trigger CTA */}
            <div className="absolute bottom-6 right-6 z-30">
              <button 
                onClick={() => toggleFilter('Emergency')}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${
                  activeFilters.has('Emergency')
                    ? 'bg-amber-500 text-white shadow-amber-500/20 animate-pulse'
                    : 'bg-rose-600 text-white shadow-rose-600/20'
                }`}
              >
                <Zap size={14} className={activeFilters.has('Emergency') ? 'animate-bounce' : ''} />
                Need Urgent Help?
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 5. WORKER DETAIL POPUP MODAL */}
      {selectedWorker && (
        <WorkerModal worker={selectedWorker} onClose={() => setSelectedWorker(null)} />
      )}

      {/* 6. BOOKING CONFIRMATION SUCCESS MODAL */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setBookingSuccessModal(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative z-10 border border-slate-100"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-1">Booking Confirmed!</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Booking ID: {bookingSuccessModal.bookingId}</p>
            
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left text-xs font-bold text-slate-600 space-y-2">
              <div className="flex justify-between">
                <span>Worker:</span>
                <span className="text-slate-800 font-extrabold">{bookingSuccessModal.worker.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Service:</span>
                <span className="text-slate-800 font-extrabold">{bookingSuccessModal.worker.skills?.[0]?.skill?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-slate-800 font-extrabold">{bookingSuccessModal.duration}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/50 pt-2 font-black text-sm text-slate-800">
                <span>Total Amount:</span>
                <span>₹{bookingSuccessModal.amount}</span>
              </div>
            </div>

            <button 
              onClick={() => setBookingSuccessModal(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* 7. QUICK CHAT MODAL */}
      {chatModalWorker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setChatModalWorker(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 border border-slate-100 flex flex-col h-[400px]"
          >
            {/* Chat Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                  <img
                    src={chatModalWorker.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatModalWorker.user.name)}&background=2563EB&color=fff&bold=true`}
                    alt={chatModalWorker.user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">{chatModalWorker.user.name}</h4>
                  <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" /> Active Now
                  </span>
                </div>
              </div>
              <button onClick={() => setChatModalWorker(null)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Chat Screen area */}
            <div className="flex-1 p-4 bg-slate-50/50 overflow-y-auto space-y-3">
              <div className="bg-slate-100 rounded-2xl p-3 max-w-[80%] text-xs font-bold text-slate-600">
                Hi! I am available in {chatModalWorker.distance.toFixed(1)} km. How can I help you today?
              </div>
            </div>

            {/* Chat Input area */}
            <div className="p-4 border-t border-slate-100 bg-white flex gap-2 items-center">
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-none"
              />
              <button 
                onClick={handleSendMessage}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// Heights constants for Framer Motion mobile bottom sheet
const bottomSheetHeights = {
  collapsed: '72px',
  half: '360px',
  full: '82vh'
};
