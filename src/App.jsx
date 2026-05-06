import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home, Activity, Scale, Footprints, Heart,
  Stethoscope, ClipboardList, Bell, Package,
  Menu, X, ChevronRight, Plus, PawPrint, LogOut
} from 'lucide-react';
import { PetProvider, usePet } from './context/PetContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HealthReport from './pages/HealthReport';
import WeightRecord from './pages/WeightRecord';
import WalkRecord from './pages/WalkRecord';
import InjuryRecord from './pages/InjuryRecord';
import MedicalRecord from './pages/MedicalRecord';
import BowelRecord from './pages/BowelRecord';
import VaccineReminder from './pages/VaccineReminder';
import FoodInventory from './pages/FoodInventory';
import PetManager from './pages/PetManager';

const NAV = [
  { path: '/',              label: '儀表板',    icon: Home,          color: 'text-blue-500',   bg: 'bg-blue-50' },
  { path: '/health-report', label: '健康報告',  icon: Activity,      color: 'text-red-500',    bg: 'bg-red-50' },
  { path: '/weight',        label: '體重紀錄',  icon: Scale,         color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { path: '/walk',          label: '散步紀錄',  icon: Footprints,    color: 'text-green-500',  bg: 'bg-green-50' },
  { path: '/injury',        label: '傷病紀錄',  icon: Heart,         color: 'text-rose-500',   bg: 'bg-rose-50' },
  { path: '/medical',       label: '就醫紀錄',  icon: Stethoscope,   color: 'text-purple-500', bg: 'bg-purple-50' },
  { path: '/bowel',         label: '排便紀錄',  icon: ClipboardList, color: 'text-amber-500',  bg: 'bg-amber-50' },
  { path: '/vaccine',       label: '疫苗提醒',  icon: Bell,          color: 'text-teal-500',   bg: 'bg-teal-50' },
  { path: '/food',          label: '飼料存貨',  icon: Package,       color: 'text-orange-500', bg: 'bg-orange-50' },
];

const ALL_NAV = [
  ...NAV,
  { path: '/pets', label: '寵物管理', icon: PawPrint, color: 'text-pink-500', bg: 'bg-pink-50' },
];

function Avatar({ src, size = 'md', className = '' }) {
  const dim = size === 'sm' ? 'w-9 h-9 text-lg' : size === 'lg' ? 'w-12 h-12 text-2xl' : 'w-10 h-10 text-xl';
  const isImage = src && src.startsWith('data:');
  return isImage
    ? <img src={src} alt="" className={`${dim} rounded-xl object-cover flex-shrink-0 ${className}`} />
    : <span className={`${dim} flex items-center justify-center flex-shrink-0 ${className}`}>{src || '🐾'}</span>;
}

function LogoutButton() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <button onClick={signOut}
      className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-red-400 py-1 transition-colors">
      <LogOut size={12} /> 登出 {user.displayName || user.email}
    </button>
  );
}

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { currentPet, pets, switchPet } = usePet();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0
        border-r border-gray-100
      `}>
        {/* Current Pet Header */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-lg overflow-hidden">
              <Avatar src={currentPet?.avatar} size="lg" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">{currentPet?.name || 'PetLog'}</h1>
              <p className="text-blue-100 text-xs mt-0.5">PetLog</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white md:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Pet Switcher */}
        {pets.length > 0 && (
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {pets.map(pet => (
                <button
                  key={pet.id}
                  onClick={() => { switchPet(pet.id); }}
                  title={pet.name}
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all overflow-hidden ${
                    currentPet?.id === pet.id
                      ? 'border-blue-400 bg-white shadow-sm scale-110'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <Avatar src={pet.avatar} size="sm" />
                </button>
              ))}
              <Link
                to="/pets"
                onClick={onClose}
                className="flex-shrink-0 w-9 h-9 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
              >
                <Plus size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {ALL_NAV.map(({ path, label, icon: Icon, color, bg }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? bg : 'bg-gray-100'}`}>
                  <Icon size={16} className={active ? color : 'text-gray-400 group-hover:text-gray-600'} />
                </div>
                <span className={`text-sm font-medium ${active ? 'text-blue-600' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {label}
                </span>
                {active && <ChevronRight size={14} className="ml-auto text-blue-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <p className="text-xs text-gray-400 text-center">PetLog v1.0</p>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { currentPet } = usePet();
  const currentPage = ALL_NAV.find(n => n.path === location.pathname);

  return (
    <div className="flex h-screen bg-ios-bg overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-3 md:hidden flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 active:bg-gray-200"
          >
            <Menu size={18} />
          </button>
          <h2 className="font-semibold text-gray-800">{currentPage?.label || '儀表板'}</h2>
          <div className="ml-auto flex items-center gap-2">
            <Avatar src={currentPet?.avatar} size="sm" />
            <span className="text-sm font-medium text-gray-500">{currentPet?.name}</span>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-md border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-lg text-gray-900">{currentPage?.label || '儀表板'}</h2>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
          </div>
          <Link to="/pets" className="flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-3 py-2 hover:shadow-sm transition-shadow">
            <Avatar src={currentPet?.avatar} size="sm" />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 leading-none">{currentPet?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">切換寵物</p>
            </div>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/health-report" element={<HealthReport />} />
        <Route path="/weight" element={<WeightRecord />} />
        <Route path="/walk" element={<WalkRecord />} />
        <Route path="/injury" element={<InjuryRecord />} />
        <Route path="/medical" element={<MedicalRecord />} />
        <Route path="/bowel" element={<BowelRecord />} />
        <Route path="/vaccine" element={<VaccineReminder />} />
        <Route path="/food" element={<FoodInventory />} />
        <Route path="/pets" element={<PetManager />} />
      </Routes>
    </Layout>
  );
}

function AuthGate({ children }) {
  const { user } = useAuth();
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🐾</div>
          <p className="text-gray-400 text-sm">載入中...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Login />;
  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthGate>
          <PetProvider>
            <AppRoutes />
          </PetProvider>
        </AuthGate>
      </AuthProvider>
    </Router>
  );
}
