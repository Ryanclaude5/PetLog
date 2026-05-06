import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X, Star, Camera } from 'lucide-react';
import { petsStorage } from '../utils/storage';
import { usePet } from '../context/PetContext';

const GENDERS = ['公', '母', '未知'];

const defaultForm = {
  name: '',
  breed: '',
  gender: '公',
  birthDate: '',
  avatar: '',
  chipId: '',
  note: '',
};

function PetForm({ pet, onClose, onSave }) {
  const [form, setForm] = useState(pet ? {
    name: pet.name || '',
    breed: pet.breed || '',
    gender: pet.gender || '公',
    birthDate: pet.birthDate || '',
    avatar: pet.avatar || '',
    chipId: pet.chipId || '',
    note: pet.note || '',
  } : defaultForm);

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('avatar', ev.target.result);
    reader.readAsDataURL(file);
  }

  const isImage = form.avatar && form.avatar.startsWith('data:');

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto mx-auto">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <h3 className="font-bold text-gray-800">{pet ? '編輯寵物資料' : '新增寵物'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="px-5 py-5 space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center py-2">
            <label className="cursor-pointer group relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-blue-400 transition-colors">
                {isImage ? (
                  <img src={form.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-0.5 text-gray-400">
                    <Camera size={22} />
                    <span className="text-xs">上傳</span>
                  </div>
                )}
              </div>
              {isImage && (
                <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={18} className="text-white" />
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-2">點擊上傳寵物照片</p>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">寵物名稱 *</label>
            <input type="text" placeholder="例：小飛、咪咪" value={form.name}
              onChange={e => set('name', e.target.value)} className={inputCls} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">品種</label>
              <input type="text" placeholder="例：柴犬" value={form.breed}
                onChange={e => set('breed', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">性別</label>
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputCls}>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">出生日期</label>
            <input type="date" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">晶片號碼</label>
            <input type="text" placeholder="15位數晶片號碼（選填）" value={form.chipId}
              onChange={e => set('chipId', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium mb-1.5 block">備註</label>
            <input type="text" placeholder="過敏食物、特殊狀況..." value={form.note}
              onChange={e => set('note', e.target.value)} className={inputCls} />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button type="submit" className="w-full py-3.5 rounded-full bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 active:scale-95 transition-all">
              {pet ? '儲存變更' : '新增寵物'}
            </button>
            <button type="button" onClick={onClose} className="w-full py-3 rounded-full bg-gray-100 text-gray-600 font-medium text-sm hover:bg-gray-200 transition-all">
              取消
            </button>
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
                    className={`w-16 h-16 rounded-2xl flex-shrink-0 border-2 transition-all overflow-hidden ${
                      isActive ? 'border-blue-400 bg-white shadow-md' : 'border-gray-100 bg-gray-50'
                    }`}>
                    {pet.avatar && pet.avatar.startsWith('data:') ? (
                      <img src={pet.avatar} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-3xl">
                        {pet.avatar || '🐾'}
                      </span>
                    )}
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
