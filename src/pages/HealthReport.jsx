import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { weightStorage, walkStorage, bowelStorage, injuryStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

function ScoreRing({ score, label, color }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F3F4F6" strokeWidth="10" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800">{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

export default function HealthReport() {
  const { currentPet } = usePet();
  const pid = currentPet?.id;
  const [state, setState] = useState({ weights: [], walks: [], bowels: [], injuries: [] });

  useEffect(() => {
    if (!pid) return;
    setState({
      weights: weightStorage.getAll(pid).slice(0, 30).reverse(),
      walks: walkStorage.getAll(pid).slice(0, 30).reverse(),
      bowels: bowelStorage.getAll(pid).slice(0, 30).reverse(),
      injuries: injuryStorage.getAll(pid),
    });
  }, [pid]);

  const activeInjuries = state.injuries.filter(i => i.status !== '已康復').length;
  const normalBowels = state.bowels.filter(b => b.status === '正常').length;
  const bowelScore = state.bowels.length > 0 ? Math.round((normalBowels / state.bowels.length) * 100) : 100;
  const walkScore = Math.min(100, state.walks.length * 5);
  const weightTrend = state.weights.length >= 2
    ? parseFloat(state.weights[state.weights.length - 1]?.weight) - parseFloat(state.weights[0]?.weight)
    : 0;
  const overallScore = Math.round((bowelScore + walkScore + (activeInjuries > 0 ? 60 : 100)) / 3);

  const recentWeightData = state.weights.slice(-14).map(w => ({ date: w.date.slice(5), weight: parseFloat(w.weight) }));

  const walkWeekData = (() => {
    const map = {};
    state.walks.forEach(w => {
      const d = w.date;
      if (!map[d]) map[d] = { date: d.slice(5), count: 0, dist: 0 };
      map[d].count++;
      map[d].dist += parseFloat(w.distance) || 0;
    });
    return Object.values(map).slice(-7);
  })();

  const bowelStatusData = [
    { name: '正常', count: state.bowels.filter(b => b.status === '正常').length, fill: '#34C759' },
    { name: '偏軟', count: state.bowels.filter(b => b.status === '偏軟').length, fill: '#FF9500' },
    { name: '偏硬', count: state.bowels.filter(b => b.status === '偏硬').length, fill: '#FF6B35' },
    { name: '異常', count: state.bowels.filter(b => b.status === '異常').length, fill: '#FF3B30' },
  ].filter(d => d.count > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Overall Score */}
      <div className="card p-6">
        <p className="section-title">整體健康評分</p>
        <div className="flex items-center justify-around py-4">
          <ScoreRing score={overallScore} label="整體" color="#007AFF" />
          <ScoreRing score={bowelScore} label="腸胃" color="#34C759" />
          <ScoreRing score={walkScore} label="運動" color="#FF9500" />
          <ScoreRing score={activeInjuries > 0 ? 60 : 100} label="傷病" color="#AF52DE" />
        </div>
        <div className={`rounded-xl px-4 py-3 mt-2 ${overallScore >= 80 ? 'bg-green-50' : overallScore >= 60 ? 'bg-yellow-50' : 'bg-red-50'}`}>
          <p className={`text-sm font-medium ${overallScore >= 80 ? 'text-green-700' : overallScore >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
            {overallScore >= 80 ? '🎉 小飛目前健康狀況良好，繼續保持！' : overallScore >= 60 ? '⚠️ 健康狀況尚可，建議多注意飲食與運動。' : '🚨 健康狀況需要注意，請考慮帶去看獸醫。'}
          </p>
        </div>
      </div>

      {/* Weight Trend */}
      {recentWeightData.length >= 2 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-700">體重趨勢（近兩週）</p>
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${weightTrend > 0 ? 'bg-orange-100 text-orange-600' : weightTrend < 0 ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
              {weightTrend > 0 ? `+${weightTrend.toFixed(1)}` : weightTrend.toFixed(1)} kg
            </span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={recentWeightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={2.5} dot={{ r: 3, fill: '#007AFF' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Walk Stats */}
      {walkWeekData.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">散步次數（近一週）</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={walkWeekData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" name="次數" fill="#34C759" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bowel Summary */}
      {bowelStatusData.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">排便狀態分佈</p>
          <div className="flex gap-3">
            {bowelStatusData.map(d => (
              <div key={d.name} className="flex-1 rounded-xl p-3 text-center" style={{ backgroundColor: d.fill + '20' }}>
                <p className="text-2xl font-bold" style={{ color: d.fill }}>{d.count}</p>
                <p className="text-xs text-gray-500 mt-1">{d.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Health Summary Table */}
      <div className="card p-5">
        <p className="section-title">數據摘要</p>
        <div className="divide-y divide-gray-50">
          {[
            { label: '體重紀錄總筆數', value: `${weightStorage.getAll(pid).length} 筆` },
            { label: '最近體重', value: weightStorage.getLast(pid) ? `${weightStorage.getLast(pid).weight} kg` : '無' },
            { label: '散步總次數', value: `${state.walks.length} 次` },
            { label: '排便紀錄總筆數', value: `${state.bowels.length} 筆` },
            { label: '正常排便率', value: state.bowels.length > 0 ? `${bowelScore}%` : 'N/A' },
            { label: '目前傷病狀況', value: activeInjuries > 0 ? `${activeInjuries} 項處理中` : '無' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-gray-500">{item.label}</span>
              <span className="text-sm font-semibold text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {(state.weights.length === 0 && state.walks.length === 0 && state.bowels.length === 0) && (
        <div className="card p-8 text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-400 text-sm">尚無足夠數據生成報告</p>
          <p className="text-gray-300 text-xs mt-1">請先記錄體重、散步或排便</p>
        </div>
      )}
    </div>
  );
}
