import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';

function uid() {
  return auth.currentUser?.uid;
}

function col(name) {
  return collection(db, 'users', uid(), name);
}

async function fetchAll(name) {
  const snap = await getDocs(query(col(name), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function addItem(name, item) {
  const ref = await addDoc(col(name), { ...item, createdAt: serverTimestamp() });
  return { id: ref.id, ...item };
}

async function updateItem(name, id, updates) {
  await updateDoc(doc(db, 'users', uid(), name, id), updates);
}

async function removeItem(name, id) {
  await deleteDoc(doc(db, 'users', uid(), name, id));
}

function byPet(records, petId) {
  if (!petId) return records;
  return records.filter(r => r.petId === petId || !r.petId);
}

// ── Pets ──────────────────────────────────────────────────────────────────────

export const petsStorage = {
  getAll: async () => fetchAll('pets'),
  getActive: async () => {
    const pets = await fetchAll('pets');
    const activeId = localStorage.getItem('xf_activePet');
    return pets.find(p => p.id === activeId) || pets[0] || null;
  },
  setActive: (id) => localStorage.setItem('xf_activePet', id),
  add: (item) => addItem('pets', item),
  update: (id, u) => updateItem('pets', id, u),
  remove: async (id) => {
    const pets = await fetchAll('pets');
    if (pets.length <= 1) return false;
    await removeItem('pets', id);
    const activeId = localStorage.getItem('xf_activePet');
    if (activeId === id) {
      const remaining = pets.filter(p => p.id !== id);
      if (remaining.length > 0) localStorage.setItem('xf_activePet', remaining[0].id);
    }
    return true;
  },
};

// ── Weight ────────────────────────────────────────────────────────────────────

export const weightStorage = {
  getAll: async (petId) => byPet(await fetchAll('weight'), petId),
  add: (item, petId) => addItem('weight', { ...item, petId }),
  update: (id, u) => updateItem('weight', id, u),
  remove: (id) => removeItem('weight', id),
  getLast: async (petId) => (byPet(await fetchAll('weight'), petId))[0] || null,
};

// ── Walks ─────────────────────────────────────────────────────────────────────

export const walkStorage = {
  getAll: async (petId) => byPet(await fetchAll('walks'), petId),
  add: (item, petId) => addItem('walks', { ...item, petId }),
  update: (id, u) => updateItem('walks', id, u),
  remove: (id) => removeItem('walks', id),
  getToday: async (petId) => {
    const today = new Date().toISOString().split('T')[0];
    return byPet(await fetchAll('walks'), petId).filter(w => w.date === today);
  },
};

// ── Injuries ──────────────────────────────────────────────────────────────────

export const injuryStorage = {
  getAll: async (petId) => byPet(await fetchAll('injuries'), petId),
  add: (item, petId) => addItem('injuries', { ...item, petId }),
  update: (id, u) => updateItem('injuries', id, u),
  remove: (id) => removeItem('injuries', id),
};

// ── Medical ───────────────────────────────────────────────────────────────────

export const medicalStorage = {
  getAll: async (petId) => byPet(await fetchAll('medical'), petId),
  add: (item, petId) => addItem('medical', { ...item, petId }),
  update: (id, u) => updateItem('medical', id, u),
  remove: (id) => removeItem('medical', id),
};

// ── Bowel ─────────────────────────────────────────────────────────────────────

export const bowelStorage = {
  getAll: async (petId) => byPet(await fetchAll('bowel'), petId),
  add: (item, petId) => addItem('bowel', { ...item, petId }),
  update: (id, u) => updateItem('bowel', id, u),
  remove: (id) => removeItem('bowel', id),
  getToday: async (petId) => {
    const today = new Date().toISOString().split('T')[0];
    return byPet(await fetchAll('bowel'), petId).filter(b => b.date === today);
  },
};

// ── Vaccines ──────────────────────────────────────────────────────────────────

export const vaccineStorage = {
  getAll: async (petId) => byPet(await fetchAll('vaccines'), petId),
  add: (item, petId) => addItem('vaccines', { ...item, petId }),
  update: (id, u) => updateItem('vaccines', id, u),
  remove: (id) => removeItem('vaccines', id),
};

// ── Food ──────────────────────────────────────────────────────────────────────

export const foodStorage = {
  getAll: async (petId) => byPet(await fetchAll('food'), petId),
  add: (item, petId) => addItem('food', { ...item, petId }),
  update: (id, u) => updateItem('food', id, u),
  remove: (id) => removeItem('food', id),
};
