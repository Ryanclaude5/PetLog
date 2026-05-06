const KEYS = {
  PETS: 'xf_pets',
  ACTIVE_PET: 'xf_activePet',
  WEIGHT: 'xf_weight',
  WALKS: 'xf_walks',
  INJURIES: 'xf_injuries',
  MEDICAL: 'xf_medical',
  BOWEL: 'xf_bowel',
  VACCINES: 'xf_vaccines',
  FOOD: 'xf_food',
};

function getAll(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function addItem(key, item) {
  const items = getAll(key);
  const newItem = { ...item, id: makeId(), createdAt: new Date().toISOString() };
  saveAll(key, [newItem, ...items]);
  return newItem;
}

function updateItem(key, id, updates) {
  const items = getAll(key);
  saveAll(key, items.map(item => item.id === id ? { ...item, ...updates } : item));
}

function removeItem(key, id) {
  saveAll(key, getAll(key).filter(item => item.id !== id));
}

function byPet(records, petId) {
  if (!petId) return records;
  return records.filter(r => r.petId === petId || !r.petId);
}

// ── Pets ──────────────────────────────────────────────────────────────────────

function ensureDefaultPet() {
  let pets = getAll(KEYS.PETS);
  if (pets.length === 0) {
    const defaultPet = {
      id: makeId(),
      name: '小飛',
      breed: '米克斯',
      gender: '公',
      birthDate: '2022-03-15',
      avatar: '🐕',
      chipId: '',
      createdAt: new Date().toISOString(),
    };
    saveAll(KEYS.PETS, [defaultPet]);
    localStorage.setItem(KEYS.ACTIVE_PET, defaultPet.id);
    return [defaultPet];
  }
  return pets;
}

export const petsStorage = {
  getAll: () => ensureDefaultPet(),
  getActive: () => {
    const pets = ensureDefaultPet();
    const activeId = localStorage.getItem(KEYS.ACTIVE_PET);
    return pets.find(p => p.id === activeId) || pets[0];
  },
  setActive: (id) => localStorage.setItem(KEYS.ACTIVE_PET, id),
  add: (item) => {
    ensureDefaultPet();
    return addItem(KEYS.PETS, item);
  },
  update: (id, u) => updateItem(KEYS.PETS, id, u),
  remove: (id) => {
    const pets = getAll(KEYS.PETS);
    if (pets.length <= 1) return false;
    removeItem(KEYS.PETS, id);
    const activeId = localStorage.getItem(KEYS.ACTIVE_PET);
    if (activeId === id) {
      const remaining = getAll(KEYS.PETS).filter(p => p.id !== id);
      if (remaining.length > 0) localStorage.setItem(KEYS.ACTIVE_PET, remaining[0].id);
    }
    return true;
  },
};

// ── Weight ────────────────────────────────────────────────────────────────────

export const weightStorage = {
  getAll: (petId) => byPet(getAll(KEYS.WEIGHT), petId),
  add: (item, petId) => addItem(KEYS.WEIGHT, { ...item, petId }),
  update: (id, u) => updateItem(KEYS.WEIGHT, id, u),
  remove: (id) => removeItem(KEYS.WEIGHT, id),
  getLast: (petId) => byPet(getAll(KEYS.WEIGHT), petId)[0] || null,
};

// ── Walks ─────────────────────────────────────────────────────────────────────

export const walkStorage = {
  getAll: (petId) => byPet(getAll(KEYS.WALKS), petId),
  add: (item, petId) => addItem(KEYS.WALKS, { ...item, petId }),
  update: (id, u) => updateItem(KEYS.WALKS, id, u),
  remove: (id) => removeItem(KEYS.WALKS, id),
  getToday: (petId) => {
    const today = new Date().toISOString().split('T')[0];
    return byPet(getAll(KEYS.WALKS), petId).filter(w => w.date === today);
  },
};

// ── Injuries ──────────────────────────────────────────────────────────────────

export const injuryStorage = {
  getAll: (petId) => byPet(getAll(KEYS.INJURIES), petId),
  add: (item, petId) => addItem(KEYS.INJURIES, { ...item, petId }),
  update: (id, u) => updateItem(KEYS.INJURIES, id, u),
  remove: (id) => removeItem(KEYS.INJURIES, id),
};

// ── Medical ───────────────────────────────────────────────────────────────────

export const medicalStorage = {
  getAll: (petId) => byPet(getAll(KEYS.MEDICAL), petId),
  add: (item, petId) => addItem(KEYS.MEDICAL, { ...item, petId }),
  update: (id, u) => updateItem(KEYS.MEDICAL, id, u),
  remove: (id) => removeItem(KEYS.MEDICAL, id),
};

// ── Bowel ─────────────────────────────────────────────────────────────────────

export const bowelStorage = {
  getAll: (petId) => byPet(getAll(KEYS.BOWEL), petId),
  add: (item, petId) => addItem(KEYS.BOWEL, { ...item, petId }),
  update: (id, u) => updateItem(KEYS.BOWEL, id, u),
  remove: (id) => removeItem(KEYS.BOWEL, id),
  getToday: (petId) => {
    const today = new Date().toISOString().split('T')[0];
    return byPet(getAll(KEYS.BOWEL), petId).filter(b => b.date === today);
  },
};

// ── Vaccines ──────────────────────────────────────────────────────────────────

export const vaccineStorage = {
  getAll: (petId) => byPet(getAll(KEYS.VACCINES), petId),
  add: (item, petId) => addItem(KEYS.VACCINES, { ...item, petId }),
  update: (id, u) => updateItem(KEYS.VACCINES, id, u),
  remove: (id) => removeItem(KEYS.VACCINES, id),
};

// ── Food ──────────────────────────────────────────────────────────────────────

export const foodStorage = {
  getAll: (petId) => byPet(getAll(KEYS.FOOD), petId),
  add: (item, petId) => addItem(KEYS.FOOD, { ...item, petId }),
  update: (id, u) => updateItem(KEYS.FOOD, id, u),
  remove: (id) => removeItem(KEYS.FOOD, id),
};
