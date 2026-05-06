import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, Package, AlertTriangle } from 'lucide-react';
import { foodStorage } from '../utils/storage';

const FOOD_TYPES = ['主食乾糧', '主食濕食', '零食點心', '保健品', '處方飼料', '其他'];

const defaultForm = {
  name: '',
  brand: '',
  type: '主食乾糧',
  unit: 'g',
  totalWeight: '',
  currentAmount: '',
  minAmount: '',
  purchaseDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  price: '',
  note: '',
};

function stockPercent(current, total) {
  if (!total || !current) return 0;
  return Math.min(100, Math.round((parseFloat(current) / parseFloat(total)) * 100));
}

function stockColor(pct) {
  if (pct <= 20) return 'bg-red-500';
  if (pct <= 40) return 'bg-orange-400';
  if (pct <= 60) return 'bg-yellow-400';
  return 'bg-green-500';
}

function FoodForm({ record, onClose, onSave }) {
  const [form, setForm] = useState(record ? { ...record } : defaultForm);
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{record ? '編輯飼料' : '新增飼料'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-gray-400 mb-2 block">飼料類型</label>
            <div className="flex flex-wrap gap-2">
              {FOOD_TYPES.map(t => (
                <button key={t} type="button" onClick={() => set('type', t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.type === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">飼料名稱 *</label>
            <input type="text" placeholder="例：希爾思健康優護成犬飼料" value={form.name}
              onChange={e => set('name', e.target.value)} className="input-field" required />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">品牌</label>
            <input type="text" placeholder="例：Hill's" value={form.brand}
              onChange={e => set('brand', e.target.value)} className="input-field" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">購買包裝重量</label>
              <input type="number" min="0" step="0.1" placeholder="例：7000" value={form.totalWeight}
                onChange={e => set('totalWeight', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">單位</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)} className="input-field">
                <option>g</option>
                <option>kg</option>
                <option>罐</option>
                <option>包</option>
                <option>顆</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">目前剩餘 *</label>
              <input type="number" min="0" step="0.1" placeholder={`剩餘量 (${form.unit})`} value={form.currentAmount}
                onChange={e => set('currentAmount', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">警示閾值</label>
              <input type="number" min="0" step="0.1" placeholder={`低於此量警示 (${form.unit})`} value={form.minAmount}
                onChange={e => set('minAmount', e.target.value)} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">購買日期</label>
              <input type="date" value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">有效期限</label>
              <input type="date" value={form.expiryDate} onChange={e => set('expiryDate', e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">購買價格（元）</label>
            <input type="number" min="0" placeholder="例：850" value={form.price}
              onChange={e => set('price', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">備註</label>
            <input type="text" placeholder="購買地點、備注..." value={form.note}
              onChange={e => set('note', e.target.value)} className="input-field" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">
              <span className="flex items-center justify-center gap-2"><Check size={16} />{record ? '儲存變更' : '新增'}</span>
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FoodInventory() {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const load = () => setRecords(foodStorage.getAll());
  useEffect(() => { load(); }, []);

  function save(form) {
    if (editRecord) {
      foodStorage.update(editRecord.id, form);
    } else {
      foodStorage.add(form);
    }
    setShowForm(false);
    setEditRecord(null);
    load();
  }

  function del(id) {
    if (confirm('確定刪除此飼料紀錄？')) {
      foodStorage.remove(id);
      load();
    }
  }

  function quickUpdate(r) {
    const v = prompt(`更新「${r.name}」的剩餘量 (${r.unit})：`, r.currentAmount);
    if (v !== null && !isNaN(parseFloat(v))) {
      foodStorage.update(r.id, { currentAmount: v });
      load();
    }
  }

  const lowStock = records.filter(r => r.minAmount && parseFloat(r.currentAmount) <= parseFloat(r.minAmount));

  const expiringSoon = records.filter(r => {
    if (!r.expiryDate) return false;
    const d = (new Date(r.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
    return d <= 30 && d >= 0;
  });

  const expired = records.filter(r => {
    if (!r.expiryDate) return false;
    return new Date(r.expiryDate) < new Date();
  });

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Alerts */}
      {(lowStock.length > 0 || expiringSoon.length > 0 || expired.length > 0) && (
        <div className="space-y-2">
          {lowStock.length > 0 && (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
              <AlertTriangle size={16} className="text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-700"><strong>存量不足：</strong>{lowStock.map(f => f.name).join('、')}</p>
            </div>
          )}
          {expired.length > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700"><strong>已過期：</strong>{expired.map(f => f.name).join('、')}</p>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
              <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-700"><strong>即將過期（30天內）：</strong>{expiringSoon.map(f => f.name).join('、')}</p>
            </div>
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">飼料存貨</p>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增
          </button>
        </div>

        {records.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">🍖</p>
            <p className="text-gray-400 text-sm">尚無飼料存貨紀錄</p>
            <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">新增第一筆</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map(r => {
              const pct = stockPercent(r.currentAmount, r.totalWeight);
              const isLow = r.minAmount && parseFloat(r.currentAmount) <= parseFloat(r.minAmount);
              const isExpired = r.expiryDate && new Date(r.expiryDate) < new Date();
              const isExpiringSoon = r.expiryDate && !isExpired && (new Date(r.expiryDate) - new Date()) / (1000 * 60 * 60 * 24) <= 30;

              return (
                <div key={r.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isLow ? 'bg-orange-100' : 'bg-orange-50'}`}>
                      <Package size={18} className={isLow ? 'text-orange-600' : 'text-orange-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{r.name}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{r.type}</span>
                        {isLow && <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">存量不足</span>}
                        {isExpired && <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">已過期</span>}
                        {isExpiringSoon && !isExpired && <span className="text-xs font-medium text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">即將過期</span>}
                      </div>
                      {r.brand && <p className="text-xs text-gray-400 mt-0.5">{r.brand}</p>}

                      {/* Stock Bar */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            剩餘：{r.currentAmount} {r.unit}
                            {r.totalWeight ? ` / ${r.totalWeight} ${r.unit}` : ''}
                          </span>
                          {r.totalWeight && <span className="text-xs font-medium text-gray-500">{pct}%</span>}
                        </div>
                        {r.totalWeight && (
                          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${stockColor(pct)}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-400">
                        {r.purchaseDate && <span>購買：{r.purchaseDate}</span>}
                        {r.expiryDate && <span className={isExpired ? 'text-red-500' : isExpiringSoon ? 'text-yellow-500' : ''}>期限：{r.expiryDate}</span>}
                        {r.price && <span>NT$ {parseFloat(r.price).toLocaleString()}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => quickUpdate(r)}
                        className="px-2 py-1 rounded-lg bg-blue-50 text-blue-500 text-xs font-medium hover:bg-blue-100 whitespace-nowrap">
                        更新存量
                      </button>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditRecord(r); setShowForm(true); }}
                          className="flex-1 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => del(r.id)}
                          className="flex-1 h-7 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && <FoodForm record={editRecord} onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={save} />}
    </div>
  );
}
