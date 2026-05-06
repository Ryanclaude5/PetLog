import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { injuryStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

const STATUS_CONFIG = {
  '處理中': { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500', border: 'border-red-200' },
  '復原中': { bg: 'bg-orange-100', text: 'text-orange-600', dot: 'bg-orange-400', border: 'border-orange-200' },
  '已康復': { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500', border: 'border-green-200' },
};

const BODY_PARTS = ['頭部', '眼睛', '耳朵', '口腔', '頸部', '胸部', '腹部', '背部', '前腳', '後腳', '尾巴', '皮膚', '其他'];

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  title: '',
  bodyPart: '',
  status: '處理中',
  symptoms: '',
  treatment: '',
  note: '',
};

function InjuryForm({ record, onClose, onSave }) {
  const [form, setForm] = useState(record ? { ...record } : defaultForm);
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{record ? '編輯傷病紀錄' : '新增傷病紀錄'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">日期</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">狀態</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-field">
                <option>處理中</option>
                <option>復原中</option>
                <option>已康復</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">傷病名稱 *</label>
            <input type="text" placeholder="例：右前腳割傷、皮膚過敏" value={form.title}
              onChange={e => set('title', e.target.value)} className="input-field" required />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">身體部位</label>
            <div className="flex flex-wrap gap-2">
              {BODY_PARTS.map(p => (
                <button key={p} type="button"
                  onClick={() => set('bodyPart', form.bodyPart === p ? '' : p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.bodyPart === p ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">症狀描述</label>
            <textarea placeholder="描述症狀狀況..." value={form.symptoms}
              onChange={e => set('symptoms', e.target.value)} className="input-field resize-none" rows={2} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">處理方式 / 治療</label>
            <textarea placeholder="藥物、包紮、就醫..." value={form.treatment}
              onChange={e => set('treatment', e.target.value)} className="input-field resize-none" rows={2} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">備註</label>
            <input type="text" placeholder="其他備注..." value={form.note}
              onChange={e => set('note', e.target.value)} className="input-field" />
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

export default function InjuryRecord() {
  const { currentPet } = usePet();
  const pid = currentPet?.id;
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [filter, setFilter] = useState('全部');

  const load = () => setRecords(injuryStorage.getAll(pid));
  useEffect(() => { load(); }, [pid]);

  function save(form) {
    if (editRecord) {
      injuryStorage.update(editRecord.id, form);
    } else {
      injuryStorage.add(form, pid);
    }
    setShowForm(false);
    setEditRecord(null);
    load();
  }

  function del(id) {
    if (confirm('確定刪除此傷病紀錄？')) {
      injuryStorage.remove(id);
      load();
    }
  }

  const filters = ['全部', '處理中', '復原中', '已康復'];
  const filtered = filter === '全部' ? records : records.filter(r => r.status === filter);

  const counts = {
    '處理中': records.filter(r => r.status === '處理中').length,
    '復原中': records.filter(r => r.status === '復原中').length,
    '已康復': records.filter(r => r.status === '已康復').length,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className={`card p-4 text-center border ${cfg.border}`}>
            <p className={`text-2xl font-bold ${cfg.text}`}>{counts[status]}</p>
            <p className="text-xs text-gray-400 mt-1">{status}</p>
          </div>
        ))}
      </div>

      {/* Alert if active */}
      {counts['處理中'] > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">目前有 <strong>{counts['處理中']}</strong> 項傷病正在處理中，請持續追蹤。</p>
        </div>
      )}

      {/* List */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">傷病紀錄</p>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-3 border-b border-gray-50 overflow-x-auto">
          {filters.map(f => (
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
            <p className="text-4xl mb-3">❤️</p>
            <p className="text-gray-400 text-sm">{filter === '全部' ? '尚無傷病紀錄，小飛很健康！' : `沒有「${filter}」的紀錄`}</p>
            {filter === '全部' && (
              <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">新增紀錄</button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(r => {
              const cfg = STATUS_CONFIG[r.status];
              return (
                <div key={r.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                      <span className="text-lg">🩹</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{r.title}</span>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {r.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <span>{r.date}</span>
                        {r.bodyPart && <><span>·</span><span>{r.bodyPart}</span></>}
                      </div>
                      {r.symptoms && <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{r.symptoms}</p>}
                      {r.treatment && (
                        <p className="text-xs text-gray-500 mt-1">
                          <span className="font-medium text-gray-600">處理：</span>{r.treatment}
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

      {showForm && <InjuryForm record={editRecord} onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={save} />}
    </div>
  );
}
