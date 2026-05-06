import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Footprints, ClipboardList, Heart, Bell, Package, ChevronRight, Plus } from 'lucide-react';
import { weightStorage, walkStorage, bowelStorage, foodStorage, vaccineStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

function StatCard({ to, icon, label, value, unit, sub, color, bgColor }) {
  return (
    <Link to={to} className="card p-4 hover:shadow-md transition-shadow active:scale-95 duration-150">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bgColor}`}>
          <span className={`text-base ${color}`}>{icon}</span>
        </div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">
        {value}
        {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </Link>
  );
}

function QuickBtn({ to, icon, label, color }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-2 p-4 rounded-2xl ${color} hover:opacity-90 active:scale-95 transition-all`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-white">{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  const { currentPet } = usePet();
  const pid = currentPet?.id;

  const [data, setData] = useState({
    todayWalks: [],
    todayBowels: [],
    lastWeight: null,
    lowFood: [],
    upcomingVaccines: [],
  });

  useEffect(() => {
    if (!pid) return;
    const todayWalks = walkStorage.getToday(pid);
    const todayBowels = bowelStorage.getToday(pid);
    const lastWeight = weightStorage.getLast(pid);
    const lowFood = foodStorage.getAll(pid).filter(f => f.minAmount && parseFloat(f.currentAmount) <= parseFloat(f.minAmount));

    const vaccines = vaccineStorage.getAll(pid);
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const upcomingVaccines = vaccines.filter(v => {
      if (v.done) return false;
      if (!v.nextDate) return false;
      return new Date(v.nextDate) <= soon;
    });

    setData({ todayWalks, todayBowels, lastWeight, lowFood, upcomingVaccines });
  }, [pid]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? '早安' : hour < 17 ? '午安' : '晚安';
  const dateStr = now.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const totalWalkDist = data.todayWalks.reduce((s, w) => s + (parseFloat(w.distance) || 0), 0);
  const totalWalkMin = data.todayWalks.reduce((s, w) => s + (parseInt(w.duration) || 0), 0);

  const hasAlerts = data.lowFood.length > 0 || data.upcomingVaccines.length > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative">
          <p className="text-blue-100 text-sm mb-1">{dateStr}</p>
          <h1 className="text-2xl font-bold">
            {greeting}！{currentPet?.name} {currentPet?.avatar}
          </h1>
          <p className="text-blue-100 text-sm mt-1">今天一起保持健康吧</p>
          {data.lastWeight && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-xl px-3 py-1.5">
              <span className="text-sm font-medium">最新體重 {data.lastWeight.weight} kg</span>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {hasAlerts && (
        <div className="space-y-2">
          {data.lowFood.length > 0 && (
            <Link to="/food" className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
              <span className="text-orange-500 text-lg">⚠️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-orange-700">飼料存量不足</p>
                <p className="text-xs text-orange-500 truncate">{data.lowFood.map(f => f.name).join('、')}</p>
              </div>
              <ChevronRight size={14} className="text-orange-400" />
            </Link>
          )}
          {data.upcomingVaccines.length > 0 && (
            <Link to="/vaccine" className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3">
              <span className="text-teal-500 text-lg">💉</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-teal-700">即將到期的疫苗／健檢</p>
                <p className="text-xs text-teal-500 truncate">{data.upcomingVaccines.map(v => v.name).join('、')}</p>
              </div>
              <ChevronRight size={14} className="text-teal-400" />
            </Link>
          )}
        </div>
      )}

      {/* Today Stats */}
      <div>
        <p className="section-title px-1">今日總覽</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            to="/weight" icon="⚖️" label="體重" bgColor="bg-blue-50" color="text-blue-500"
            value={data.lastWeight ? data.lastWeight.weight : '--'}
            unit="kg"
            sub={data.lastWeight ? data.lastWeight.date : '尚無紀錄'}
          />
          <StatCard
            to="/walk" icon="🦮" label="今日散步" bgColor="bg-green-50" color="text-green-500"
            value={data.todayWalks.length}
            unit="次"
            sub={totalWalkDist > 0 ? `${totalWalkDist.toFixed(1)} km・${totalWalkMin} 分鐘` : '尚未記錄'}
          />
          <StatCard
            to="/bowel" icon="💩" label="今日排便" bgColor="bg-amber-50" color="text-amber-500"
            value={data.todayBowels.length}
            unit="次"
            sub={data.todayBowels.length > 0 ? data.todayBowels[0].status : '尚未記錄'}
          />
          <StatCard
            to="/health-report" icon="❤️" label="整體健康" bgColor="bg-red-50" color="text-red-500"
            value="良好"
            sub="點擊查看詳情"
          />
        </div>
      </div>

      {/* Quick Add */}
      <div>
        <p className="section-title px-1">快速新增</p>
        <div className="grid grid-cols-4 gap-3">
          <QuickBtn to="/walk" icon="🦮" label="散步" color="bg-green-500" />
          <QuickBtn to="/bowel" icon="💩" label="排便" color="bg-amber-500" />
          <QuickBtn to="/weight" icon="⚖️" label="體重" color="bg-blue-500" />
          <QuickBtn to="/medical" icon="🏥" label="就醫" color="bg-purple-500" />
        </div>
      </div>

      {/* Summary */}
      <div className="card p-4">
        <p className="section-title">活動摘要</p>
        <div className="divide-y divide-gray-50">
          {[
            { icon: '🦮', label: '散步', value: data.todayWalks.length > 0 ? `${data.todayWalks.length} 次 ／ ${totalWalkMin} 分鐘` : '尚未記錄', to: '/walk' },
            { icon: '💩', label: '排便', value: data.todayBowels.length > 0 ? `${data.todayBowels.length} 次` : '尚未記錄', to: '/bowel' },
            { icon: '⚖️', label: '體重', value: data.lastWeight ? `${data.lastWeight.weight} kg` : '尚未記錄', to: '/weight' },
            { icon: '💉', label: '疫苗提醒', value: data.upcomingVaccines.length > 0 ? `${data.upcomingVaccines.length} 項即將到期` : '無', to: '/vaccine' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="flex items-center justify-between py-3 group">
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-600">{item.value}</span>
                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
