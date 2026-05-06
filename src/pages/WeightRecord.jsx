import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Plus, Trash2, Edit2, X, Check, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { weightStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

const defaultForm = { date: new Date().toISOString().split('T')[0], weight: '', note: '' };

export default function WeightRecord() {
  const { currentPet } = usePet();
  const pid = currentPet?.id;
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const load = async () => setRecords(await weightStorage.getAll(pid));
  useEffect(() => { load(); }, [pid]);

  function submit(e) {
    e.preventDefault();
    if (!form.weight) return;
    if (editId) {
      weightStorage.update(editId, form);
    } else {
      weightStorage.add(form, pid);
    }
    setShowForm(false);
    setEditId(null);
    setForm(defaultForm);
    load();
  }

  function startEdit(r) {
    setForm({ date: r.date, weight: r.weight, note: r.note || '' });
    setEditId(r.id);
    setShowForm(true);
  }

  function del(id) {
    if (confirm('確定刪除此筆體重紀錄？')) {
      weightStorage.remove(id);
      load();
    }
  }

  const chartData = [...records].reverse().slice(-30).map(r => ({
    date: r.date.slice(5),
    weight: parseFloat(r.weight),
  }));

  const latestWeight = records[0] ? parseFloat(records[0].weight) : null;
  const prevWeight = records[1] ? parseFloat(records[1].weight) : null;
  const diff = latestWeight && prevWeight ? (latestWeight - prevWeight).toFixed(1) : null;
  const avg = records.length > 0 ? (records.reduce((s, r) => s + parseFloat(r.weight), 0) / records.length).toFixed(1) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Stats Row */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{latestWeight}</p>
            <p className="text-xs text-gray-400 mt-1">最新 (kg)</p>
          </div>
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              {diff !== null ? (
                <>
                  {parseFloat(diff) > 0 ? <TrendingUp size={18} className="text-orange-500" /> :
                    parseFloat(diff) < 0 ? <TrendingDown size={18} className="text-blue-500" /> :
                    <Minus size={18} className="text-gray-400" />}
                  <p className={`text-2xl font-bold ${parseFloat(diff) > 0 ? 'text-orange-500' : parseFloat(diff) < 0 ? 'text-blue-500' : 'text-gray-400'}`}>
                    {parseFloat(diff) > 0 ? '+' : ''}{diff}
                  </p>
                </>
              ) : <p className="text-2xl font-bold text-gray-300">--</p>}
            </div>
            <p className="text-xs text-gray-400 mt-1">變化 (kg)</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-gray-700">{avg}</p>
            <p className="text-xs text-gray-400 mt-1">平均 (kg)</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">體重趨勢折線圖</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', fontSize: '12px' }}
                formatter={(v) => [`${v} kg`, '體重']}
              />
              {avg && <ReferenceLine y={parseFloat(avg)} stroke="#007AFF" strokeDasharray="4 4" label={{ value: '平均', fill: '#007AFF', fontSize: 10 }} />}
              <Line type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={2.5} dot={{ r: 3, fill: '#007AFF', strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">{editId ? '編輯體重紀錄' : '新增體重紀錄'}</h3>
            <button onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">日期</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">體重 (kg)</label>
                <input type="number" step="0.1" min="0" placeholder="例：5.2" value={form.weight}
                  onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className="input-field" required />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">備註（選填）</label>
              <input type="text" placeholder="例：飯後量的" value={form.note}
                onChange={e => setForm(p => ({ ...p, note: e.target.value }))} className="input-field" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="btn-primary flex-1">
                <span className="flex items-center justify-center gap-2"><Check size={16} /> {editId ? '儲存變更' : '新增紀錄'}</span>
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(defaultForm); }} className="btn-secondary">取消</button>
            </div>
          </form>
        </div>
      )}

      {/* Records List */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">紀錄列表</p>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增
          </button>
        </div>
        {records.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">⚖️</p>
            <p className="text-gray-400 text-sm">尚無體重紀錄</p>
            <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">
              新增第一筆紀錄
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map((r, i) => {
              const prev = records[i + 1];
              const d = prev ? (parseFloat(r.weight) - parseFloat(prev.weight)).toFixed(1) : null;
              return (
                <div key={r.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {i === 0 ? '最新' : `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{r.weight} kg</p>
                    <p className="text-xs text-gray-400">{r.date}{r.note && ` ・ ${r.note}`}</p>
                  </div>
                  {d !== null && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${parseFloat(d) > 0 ? 'bg-orange-100 text-orange-600' : parseFloat(d) < 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      {parseFloat(d) > 0 ? '+' : ''}{d}
                    </span>
                  )}
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => startEdit(r)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => del(r.id)} className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
