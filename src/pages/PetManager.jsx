import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Check, Star } from 'lucide-react';
import { petsStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

const AVATARS = ['🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐇', '🐹', '🦜', '🐠', '🐢', '🦎', '🐓', '🐾'];
const GENDERS = ['公', '母', '未知'];

const defaultForm = {
  name: '',
  breed: '',
  gender: '公',
  birthDate: '',
  avatar: '🐕',
  chipId: '',
  note: '',
};

function PetForm({ pet, onClose, onSave }) {
  const [form, setForm] = useState(pet ? {
    name: pet.name || '',
    breed: pet.breed || '',
    gender: pet.gender || '公',
    birthDate: pet.birthDate || '',
    avatar: pet.avatar || '🐕',
    chipId: pet.chipId || '',
    note: pet.note || '',
  } : defaultForm);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{pet ? '編輯寵物資料' : '新增寵物'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-5 space-y-5">
          {/* Avatar Picker */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">選擇頭像</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(a => (
                <button key={a} type="button" onClick={() => set('avatar', a)}
                  className={`w-11 h-11 rounded-2xl text-2xl flex items-center justify-center border-2 transition-all ${
                    form.avatar === a ? 'border-blue-400 bg-blue-50 scale-110' : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">寵物名稱 *</label>
            <input type="text" placeholder="例：小飛、咪咪" value={form.name}
              onChange={e => set('name', e.target.value)} className="input-field" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">品種</label>
              <input type="text" placeholder="例：柴犬、米克斯" value={form.breed}
                onChange={e => set('breed', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">性別</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field">
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">出生日期</label>
            <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">晶片號碼</label>
            <input type="text" placeholder="15位數晶片號碼（選填）" value={form.chipId}
              onChange={e => set('chipId', e.target.value)} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">備註</label>
            <input type="text" placeholder="過敏食物、特殊狀況..." value={form.note}
              onChange={e => set('note', e.target.value)} className="input-field" />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1">
              <span className="flex items-center justify-center gap-2">
                <Check size={16} />{pet ? '儲存變更' : '新增寵物'}
              </span>
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">取消</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function calcAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 12) return `${months} 個月`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} 歲 ${rem} 個月` : `${years} 歲`;
}

export default function PetManager() {
  const { currentPet, pets, switchPet, reload } = usePet();
  const [showForm, setShowForm] = useState(false);
  const [editPet, setEditPet] = useState(null);

  function save(form) {
    if (editPet) {
      petsStorage.update(editPet.id, form);
    } else {
      const newPet = petsStorage.add(form);
      petsStorage.setActive(newPet.id);
    }
    reload();
    setShowForm(false);
    setEditPet(null);
  }

  function del(pet) {
    if (!confirm(`確定刪除「${pet.name}」？此操作無法復原，相關紀錄仍會保留。`)) return;
    const ok = petsStorage.remove(pet.id);
    if (!ok) alert('至少需要保留一隻寵物');
    else reload();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-50">
          <p className="font-semibold text-gray-800">我的寵物</p>
          <button onClick={() => { setEditPet(null); setShowForm(true); }}
            className="flex items-center gap-1.5 text-blue-500 font-medium text-sm hover:text-blue-600">
            <Plus size={16} /> 新增寵物
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {pets.map(pet => {
            const isActive = currentPet?.id === pet.id;
            const age = calcAge(pet.birthDate);
            return (
              <div key={pet.id} className={`p-4 transition-colors ${isActive ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <button onClick={() => switchPet(pet.id)}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2 transition-all ${
                      isActive ? 'border-blue-400 bg-white shadow-md' : 'border-gray-100 bg-gray-50'
                    }`}>
                    {pet.avatar}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0" onClick={() => switchPet(pet.id)}>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-lg">{pet.name}</h3>
                      {isActive && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                          <Star size={10} fill="currentColor" /> 目前
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-400">
                      {pet.breed && <span>{pet.breed}</span>}
                      {pet.gender && <><span>·</span><span>{pet.gender}</span></>}
                      {age && <><span>·</span><span>{age}</span></>}
                    </div>
                    {pet.chipId && <p className="text-xs text-gray-300 mt-1">晶片：{pet.chipId}</p>}
                    {pet.note && <p className="text-xs text-gray-400 mt-1 italic">{pet.note}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {!isActive && (
                      <button onClick={() => switchPet(pet.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600">
                        切換
                      </button>
                    )}
                    <div className="flex gap-1">
                      <button onClick={() => { setEditPet(pet); setShowForm(true); }}
                        className="flex-1 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500 flex items-center justify-center">
                        <Edit2 size={13} />
                      </button>
                      {pets.length > 1 && (
                        <button onClick={() => del(pet)}
                          className="flex-1 h-8 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips */}
      <div className="card p-4 bg-blue-50 border-blue-100">
        <p className="text-xs text-blue-600 font-semibold mb-1">💡 提示</p>
        <p className="text-xs text-blue-500">點擊寵物頭像或按「切換」即可切換目前寵物。所有紀錄（體重、散步等）都會依寵物分開儲存。</p>
      </div>

      {showForm && (
        <PetForm
          pet={editPet}
          onClose={() => { setShowForm(false); setEditPet(null); }}
          onSave={save}
        />
      )}
    </div>
  );
}
