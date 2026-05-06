import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Check, Stethoscope, DollarSign } from 'lucide-react';
import { medicalStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

const REASONS = ['例行健檢', '疫苗接種', '傷口處理', '皮膚問題', '腸胃問題', '耳朵問題', '眼睛問題', '骨科問題', '牙科', '其他'];

const defaultForm = {
  date: new Date().toISOString().split('T')[0],
  hospital: '',
  doctor: '',
  reason: '',
  diagnosis: '',
  treatment: '',
  medication: '',
  cost: '',
  nextVisit: '',
  note: '',
};

function MedicalForm({ record, onClose, onSave }) {
  const [form, setForm] = useState(record ? { ...record } : defaultForm);
  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{record ? '編輯就醫紀錄' : '新增就醫紀錄'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">就醫日期 *</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">下次回診</label>
              <input type="date" value={form.nextVisit} onChange={e => set('nextVisit', e.target.value)} className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">動物醫院 *</label>
            <input type="text" placeholder="例：台北動物醫院" value={form.hospital}
              onChange={e => set('hospital', e.target.value)} className="input-field" required />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">獸醫師</label>
            <input type="text" placeholder="例：王醫師" value={form.doctor}
              onChange={e => set('doctor', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-2 block">就醫原因</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {REASONS.map(r => (
                <button key={r} type="button" onClick={() => set('reason', r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.reason === r ? 'bg-purple-500 text-white border-purple-500' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-purple-300'
                  }`}>
                  {r}
                </button>
              ))}
            </div>
            <input type="text" placeholder="或自行輸入..." value={REASONS.includes(form.reason) ? '' : form.reason}
              onChange={e => set('reason', e.target.value)} className="input-field text-sm" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">診斷結果</label>
            <textarea placeholder="醫師診斷..." value={form.diagnosis}
              onChange={e => set('diagnosis', e.target.value)} className="input-field resize-none" rows={2} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">治療方式</label>
            <textarea placeholder="注射、手術、藥物..." value={form.treatment}
              onChange={e => set('treatment', e.target.value)} className="input-field resize-none" rows={2} />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">用藥</label>
            <input type="text" placeholder="藥名、劑量..." value={form.medication}
              onChange={e => set('medication', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">費用（元）</label>
            <input type="number" min="0" placeholder="例：1500" value={form.cost}
              onChange={e => set('cost', e.target.value)} className="input-field" />
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

export default function MedicalRecord() {
  const { currentPet } = usePet();
  const pid = currentPet?.id;
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const load = async () => setRecords(await medicalStorage.getAll(pid));
  useEffect(() => { load(); }, [pid]);

  function save(form) {
    if (editRecord) {
      medicalStorage.update(editRecord.id, form);
    } else {
      medicalStorage.add(form, pid);
    }
    setShowForm(false);
    setEditRecord(null);
    load();
  }

  function del(id) {
    if (confirm('確定刪除此就醫紀錄？')) {
      medicalStorage.remove(id);
      load();
    }
  }

  const totalCost = records.reduce((s, r) => s + (parseFloat(r.cost) || 0), 0);

  const upcoming = records.filter(r => r.nextVisit && new Date(r.nextVisit) >= new Date()).sort((a, b) => new Date(a.nextVisit) - new Date(b.nextVisit));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {records.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{records.length}</p>
            <p className="text-xs text-gray-400 mt-1">就醫次數</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{totalCost.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">總費用（元）</p>
          </div>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="card p-4 bg-purple-50 border-purple-100">
          <p className="text-xs font-semibold text-purple-500 mb-2">📅 即將回診</p>
          {upcoming.slice(0, 2).map(r => (
            <div key={r.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-purple-700">{r.hospital}</span>
              <span className="text-xs font-medium text-purple-500 bg-purple-100 px-2 py-1 rounded-full">{r.nextVisit}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">就醫紀錄</p>
          <button onClick={() => { setEditRecord(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增
          </button>
        </div>

        {records.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">🏥</p>
            <p className="text-gray-400 text-sm">尚無就醫紀錄</p>
            <button onClick={() => setShowForm(true)} className="mt-4 btn-primary text-sm">新增第一筆紀錄</button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {records.map(r => (
              <div key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Stethoscope size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-800">{r.hospital}</span>
                      {r.reason && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">{r.reason}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 flex-wrap">
                      <span>{r.date}</span>
                      {r.doctor && <><span>·</span><span>獸醫：{r.doctor}</span></>}
                      {r.cost && (
                        <span className="flex items-center gap-0.5 text-green-600">
                          <DollarSign size={10} />NT$ {parseFloat(r.cost).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {r.diagnosis && <p className="text-xs text-gray-500 mt-1.5"><span className="font-medium text-gray-600">診斷：</span>{r.diagnosis}</p>}
                    {r.treatment && <p className="text-xs text-gray-500 mt-1"><span className="font-medium text-gray-600">治療：</span>{r.treatment}</p>}
                    {r.medication && <p className="text-xs text-gray-500 mt-1"><span className="font-medium text-gray-600">用藥：</span>{r.medication}</p>}
                    {r.nextVisit && (
                      <p className="text-xs text-purple-500 mt-1.5 font-medium">📅 下次回診：{r.nextVisit}</p>
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
            ))}
          </div>
        )}
      </div>

      {showForm && <MedicalForm record={editRecord} onClose={() => { setShowForm(false); setEditRecord(null); }} onSave={save} />}
    </div>
  );
}
