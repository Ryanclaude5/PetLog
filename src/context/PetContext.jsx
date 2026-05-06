import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { petsStorage } from '../utils/storage';

const PetContext = createContext(null);

export function PetProvider({ children }) {
  const [currentPet, setCurrentPet] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const all = await petsStorage.getAll();
      const activeId = localStorage.getItem('xf_activePet');
      const active = all.find(p => p.id === activeId) || all[0] || null;

      // If no pets exist, create a default one
      if (all.length === 0) {
        const newPet = await petsStorage.add({
          name: '我的寵物', breed: '', gender: '公',
          birthDate: '', avatar: '🐕', chipId: '',
        });
        petsStorage.setActive(newPet.id);
        setPets([newPet]);
        setCurrentPet(newPet);
      } else {
        setPets(all);
        setCurrentPet(active);
        if (!activeId) petsStorage.setActive(all[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const switchPet = useCallback(async (id) => {
    petsStorage.setActive(id);
    const pets = await petsStorage.getAll();
    const pet = pets.find(p => p.id === id);
    setCurrentPet(pet);
    setPets(pets);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🐾</div>
          <p className="text-gray-400 text-sm">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <PetContext.Provider value={{ currentPet, pets, switchPet, reload }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  return useContext(PetContext);
}
