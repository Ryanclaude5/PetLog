import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { bowelStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

const STATUS_CONFIG = {
  '正常': { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', emoji: '✅' },
  '偏軟': { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400', emoji: '🟡' },
  '偏硬': { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', emoji: '🟠' },
  '異常': { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', emoji: '🔴' },
};

const SHAPES = [
  { id: '1', label: '1型', desc: '硬球狀', color: '#DC2626' },
  { id: '2', label: '2型', desc: '臘腸硬塊', color: '#EA580C' },
  { id: '3', label: '3型', desc: '臘腸有裂縫', color: '#D97706' },
  { id: '4', label: '4型', desc: '香蕉光滑', color: '#16A34A' },
  { id: '5', label: '5型', desc: '軟團', color: '#CA8A04' },
  { id: '6', label: '6型', desc: '泥狀鬆散', color: '#B45309' },
  { id: '7', label: '7型', desc: '水樣無形', color: '#DC2626' },
];

const COLORS = ['褐色', '深褐色', '黑色', '紅色', '黃色', '綠色', '白色/灰色'];

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  count: '1',
  shape: '4',
  color: '褐色',
  status: '正常',
  note: '',
};

function BowelForm({ record, onClose, onSave }) {
  const [form, setForm] = useState(record ? { ...record } : defaultForm);
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{record ? '編輯排便紀錄' : '新增排便紀錄'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">日期</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">時間</label>
              <input type="time" value={form.time} onChange={e => set('time', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">次數</label>
              <input type="number" min="1" max="20" value={form.count} onChange={e => set('count', e.target.value)} className="input-field" />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">排便狀態</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.status === s ? `${cfg.bg} ${cfg.text} border-current` : 'bg-gray-50 text-gray-500 border-transparent hover:border-gray-200'
                  }`}>
                  <div>{cfg.emoji}</div>
                  <div className="mt-0.5">{s}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Shape - Bristol Scale */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">便便形狀（Bristol 量表）</label>
            <div className="grid grid-cols-2 gap-2">
              {SHAPES.map(s => (
                <button key={s.id} type="button" onClick={() => set('shape', s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-left transition-all ${
                    form.shape === s.id ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                  <span className="text-lg font-bold" style={{ color: s.color }}>{s.id}</span>
                  <div>
                    <p className="text-xs font-medium text-gray-700">{s.label}</p>
                    <p className="text-xs text-gray-400">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">顏色</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.color === c ? 'bg-amber-500 text-white border-amber-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-amber-300'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">異常備註</label>
            <textarea placeholder="血絲、黏液、異物、特殊氣味..." value={form.note}
              onChange={e => set('note', e.target.value)} className="input-field resize-none" rows={2} />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">
              <span className="flex items-center justify-center gap-2"><Check size={16} />{record ? '儲存變更' : '新增紀錄'}</span>
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BowelRecord() {
  const { currentPet } = usePet();
  const pid = currentPet?.id;
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [filter, setFilter] = useState('全部');

  const load = async () => setRecords(await bowelStorage.getAll(pid));
  useEffect(() => { load(); }, [pid]);

  function save(form) {
    if (editRecord) {
      bowelStorage.update(editRecord.id, form);
    } else {
      bowelStorage.add(form, pid);
    }
    setShowForm(false);
    setEditRecord(null);
    load();
  }

  function del(id) {
    if (confirm('確定刪除此排便紀錄？')) {
      bowelStorage.remove(id);
      load();
    }
  }

  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, s) => {
    acc[s] = records.filter(r => r.status === s).length;
    return acc;
  }, {});

  const filtered = filter === '全部' ? records : records.filter(r => r.status === filter);

  const shapeLabel = (id) => SHAPES.find(s => s.id === id)?.desc || '';

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Status Summary */}
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(STATUS_CONFIG).map(([s, cfg]) => (
          <div key={s} className={`card p-3 text-center ${cfg.bg} border-0`}>
            <p className={`text-xl font-bold ${cfg.text}`}>{statusCounts[s]}</p>
            <p className={`text-xs ${cfg.text} opacity-80 mt-0.5`}>{s}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">排便紀錄</p>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-1 p-3 border-b border-gray-50 overflow-x-auto">
          {['全部', ...Object.keys(STATUS_CONFIG)].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">💩</p>
            <p className="text-gray-400 text-sm">{filter === '全部' ? '尚無排便紀錄' : `沒有「${filter}」的紀錄`}</p>
            {filter === '全部' && (
              <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">新增第一筆紀錄</button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(r => {
              const cfg = STATUS_CONFIG[r.status];
              return (
                <div key={r.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${cfg.bg}`}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          {r.status}
                        </span>
                        <span className="text-xs text-gray-400">{r.date} {r.time}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {r.count && r.count !== '1' && (
                          <span className="text-xs text-gray-500">次數：{r.count}</span>
                        )}
                        {r.shape && (
                          <span className="text-xs text-gray-500">
                            Bristol {r.shape}型 {shapeLabel(r.shape) ? `(${shapeLabel(r.shape)})` : ''}
                          </span>
                        )}
                        {r.color && (
                          <span className="text-xs text-gray-500">顏色：{r.color}</span>
                        )}
                      </div>
                      {r.note && (
                        <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                          <span>⚠️</span> {r.note}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setEditRecord(r); setShowForm(true); }}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => del(r.id)}
                        className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && <BowelForm record={editRecord} onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={save} />}
    </div>
  );
}
