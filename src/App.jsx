import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Home, Activity, Scale, Footprints, Heart,
  Stethoscope, ClipboardList, Bell, Package, Menu, X, ChevronRight
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import HealthReport from './pages/HealthReport';
import WeightRecord from './pages/WeightRecord';
import WalkRecord from './pages/WalkRecord';
import InjuryRecord from './pages/InjuryRecord';
import MedicalRecord from './pages/MedicalRecord';
import BowelRecord from './pages/BowelRecord';
import VaccineReminder from './pages/VaccineReminder';
import FoodInventory from './pages/FoodInventory';

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

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex-shrink-0
        border-r border-gray-100
      `}>
        {/* Pet Profile */}
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-6 translate-x-6" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-4 -translate-x-4" />
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl shadow-lg">
              🐕
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-tight">小飛</h1>
              <p className="text-blue-100 text-xs mt-0.5">PetLog</p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white md:hidden">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {NAV.map(({ path, label, icon: Icon, color, bg }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5
                  transition-all duration-150 group
                  ${active ? 'bg-blue-50' : 'hover:bg-gray-50'}
                `}
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

        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">PetLog v1.0</p>
        </div>
      </aside>
    </>
  );
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = NAV.find(n => n.path === location.pathname);

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
          <div className="ml-auto text-xl">{currentPage?.path === '/' ? '🐾' : ''}</div>
        </header>

        {/* Desktop Header */}
        <header className="hidden md:flex items-center px-8 py-4 bg-white/50 backdrop-blur-md border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-lg text-gray-900">{currentPage?.label || '儀表板'}</h2>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
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
        </Routes>
      </Layout>
    </Router>
  );
}
