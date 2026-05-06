import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, Bell, Clock, CheckCircle } from 'lucide-react';
import { vaccineStorage } from '../utils/storage';

const VACCINE_TYPES = [
  '犬三合一疫苗', '狂犬病疫苗', '犬八合一疫苗', '犬四合一疫苗',
  '犬心絲蟲預防', '跳蚤蜱蟲預防', '例行健康檢查', '牙齒潔牙',
  '驅蟲（內寄生蟲）', '其他'
];

const defaultForm = {
  name: '',
  lastDate: '',
  nextDate: '',
  hospital: '',
  note: '',
  done: false,
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date(new Date().toDateString());
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function urgencyConfig(days) {
  if (days === null) return { bg: 'bg-gray-50', text: 'text-gray-500', label: '', badge: 'bg-gray-100 text-gray-500' };
  if (days < 0) return { bg: 'bg-red-50', text: 'text-red-600', label: '已過期', badge: 'bg-red-100 text-red-600' };
  if (days === 0) return { bg: 'bg-red-50', text: 'text-red-600', label: '今天到期', badge: 'bg-red-100 text-red-600' };
  if (days <= 7) return { bg: 'bg-orange-50', text: 'text-orange-600', label: `${days} 天後`, badge: 'bg-orange-100 text-orange-600' };
  if (days <= 30) return { bg: 'bg-yellow-50', text: 'text-yellow-600', label: `${days} 天後`, badge: 'bg-yellow-100 text-yellow-600' };
  return { bg: 'bg-green-50', text: 'text-green-600', label: `${days} 天後`, badge: 'bg-green-100 text-green-600' };
}

function VaccineForm({ record, onClose, onSave }) {
  const [form, setForm] = useState(record ? { ...record } : defaultForm);
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{record ? '編輯提醒' : '新增疫苗／健檢提醒'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">類型</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {VACCINE_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('name', t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.name === t ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
            <input type="text" placeholder="或自行輸入名稱 *" value={VACCINE_TYPES.includes(form.name) ? '' : form.name}
              onChange={e => set('name', e.target.value)}
              className="input-field"
              required={!form.name}
            />
            {form.name && !VACCINE_TYPES.includes(form.name) && (
              <p className="text-xs text-teal-500 mt-1">已輸入：{form.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">上次施打日期</label>
              <input type="date" value={form.lastDate} onChange={e => set('lastDate', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">下次到期日期 *</label>
              <input type="date" value={form.nextDate} onChange={e => set('nextDate', e.target.value)} className="input-field" required />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">動物醫院</label>
            <input type="text" placeholder="例：台北動物醫院" value={form.hospital}
              onChange={e => set('hospital', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">備註</label>
            <input type="text" placeholder="例：需要空腹、附帶驅蟲..." value={form.note}
              onChange={e => set('note', e.target.value)} className="input-field" />
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 cursor-pointer">
            <input type="checkbox" checked={form.done} onChange={e => set('done', e.target.checked)}
              className="w-4 h-4 rounded accent-teal-500" />
            <span className="text-sm text-gray-700">標記為已完成</span>
          </label>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">
              <span className="flex items-center justify-center gap-2"><Check size={16} />{record ? '儲存變更' : '新增提醒'}</span>
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VaccineReminder() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [tab, setTab] = useState('upcoming');

  const load = () => setRecords(vaccineStorage.getAll());
  useEffect(() => { load(); }, []);

  function save(form) {
    if (editRecord) {
      vaccineStorage.update(editRecord.id, form);
    } else {
      vaccineStorage.add(form);
    }
    setShowForm(false);
    setEditRecord(null);
    load();
  }

  function del(id) {
    if (confirm('確定刪除此提醒？')) {
      vaccineStorage.remove(id);
      load();
    }
  }

  function toggleDone(r) {
    vaccineStorage.update(r.id, { done: !r.done });
    load();
  }

  const upcoming = records
    .filter(r => !r.done)
    .sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));

  const done = records.filter(r => r.done);

  const displayList = tab === 'upcoming' ? upcoming : done;

  const urgentCount = upcoming.filter(r => {
    const d = daysUntil(r.nextDate);
    return d !== null && d <= 30;
  }).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3">
          <Bell size={18} className="text-teal-500 flex-shrink-0" />
          <p className="text-sm text-teal-700">有 <strong>{urgentCount}</strong> 項疫苗／健檢將在 30 天內到期，請儘快安排。</p>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">疫苗 ／ 健檢提醒</p>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-50">
          {[
            { key: 'upcoming', label: `待辦 (${upcoming.length})` },
            { key: 'done', label: `已完成 (${done.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {displayList.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">{tab === 'upcoming' ? '💉' : '✅'}</p>
            <p className="text-gray-400 text-sm">
              {tab === 'upcoming' ? '尚無待辦提醒' : '尚無已完成紀錄'}
            </p>
            {tab === 'upcoming' && (
              <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">新增第一筆提醒</button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {displayList.map(r => {
              const days = daysUntil(r.nextDate);
              const urg = urgencyConfig(days);
              return (
                <div key={r.id} className={`p-4 ${r.done ? 'opacity-60' : ''}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleDone(r)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        r.done ? 'bg-green-100' : urg.bg
                      }`}>
                      {r.done ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <Bell size={18} className={urg.text} />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${r.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{r.name}</span>
                        {!r.done && days !== null && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urg.badge}`}>
                            {urg.label || `${days} 天後`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-gray-400">
                        {r.lastDate && <span className="flex items-center gap-1"><Clock size={10} /> 上次：{r.lastDate}</span>}
                        {r.nextDate && <span className="flex items-center gap-1">📅 到期：{r.nextDate}</span>}
                        {r.hospital && <span>🏥 {r.hospital}</span>}
                      </div>
                      {r.note && <p className="text-xs text-gray-400 mt-1">{r.note}</p>}
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

      {showForm && <VaccineForm record={editRecord} onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={save} />}
    </div>
  );
}
