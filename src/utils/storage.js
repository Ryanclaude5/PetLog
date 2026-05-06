const KEYS = {
  PET_INFO: 'xf_petInfo',
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

function getOne(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
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

export const petStorage = {
  get: () => getOne(KEYS.PET_INFO) || {
    name: '小飛', breed: '米克斯', gender: '公',
    birthDate: '2022-03-15', avatar: '🐕', chipId: '',
  },
  save: (info) => localStorage.setItem(KEYS.PET_INFO, JSON.stringify(info)),
};

export const weightStorage = {
  getAll: () => getAll(KEYS.WEIGHT),
  add: (item) => addItem(KEYS.WEIGHT, item),
  update: (id, u) => updateItem(KEYS.WEIGHT, id, u),
  remove: (id) => removeItem(KEYS.WEIGHT, id),
  getLast: () => getAll(KEYS.WEIGHT)[0] || null,
};

export const walkStorage = {
  getAll: () => getAll(KEYS.WALKS),
  add: (item) => addItem(KEYS.WALKS, item),
  update: (id, u) => updateItem(KEYS.WALKS, id, u),
  remove: (id) => removeItem(KEYS.WALKS, id),
  getToday: () => {
    const today = new Date().toISOString().split('T')[0];
    return getAll(KEYS.WALKS).filter(w => w.date === today);
  },
};

export const injuryStorage = {
  getAll: () => getAll(KEYS.INJURIES),
  add: (item) => addItem(KEYS.INJURIES, item),
  update: (id, u) => updateItem(KEYS.INJURIES, id, u),
  remove: (id) => removeItem(KEYS.INJURIES, id),
};

export const medicalStorage = {
  getAll: () => getAll(KEYS.MEDICAL),
  add: (item) => addItem(KEYS.MEDICAL, item),
  update: (id, u) => updateItem(KEYS.MEDICAL, id, u),
  remove: (id) => removeItem(KEYS.MEDICAL, id),
};

export const bowelStorage = {
  getAll: () => getAll(KEYS.BOWEL),
  add: (item) => addItem(KEYS.BOWEL, item),
  update: (id, u) => updateItem(KEYS.BOWEL, id, u),
  remove: (id) => removeItem(KEYS.BOWEL, id),
  getToday: () => {
    const today = new Date().toISOString().split('T')[0];
    return getAll(KEYS.BOWEL).filter(b => b.date === today);
  },
};

export const vaccineStorage = {
  getAll: () => getAll(KEYS.VACCINES),
  add: (item) => addItem(KEYS.VACCINES, item),
  update: (id, u) => updateItem(KEYS.VACCINES, id, u),
  remove: (id) => removeItem(KEYS.VACCINES, id),
};

export const foodStorage = {
  getAll: () => getAll(KEYS.FOOD),
  add: (item) => addItem(KEYS.FOOD, item),
  update: (id, u) => updateItem(KEYS.FOOD, id, u),
  remove: (id) => removeItem(KEYS.FOOD, id),
};
