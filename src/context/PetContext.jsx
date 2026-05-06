import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { petsStorage } from '../utils/storage';

const PetContext = createContext(null);

export function PetProvider({ children }) {
  const [currentPet, setCurrentPet] = useState(null);
  const [pets, setPets] = useState([]);

  const reload = useCallback(() => {
    const all = petsStorage.getAll();
    const active = petsStorage.getActive();
    setPets(all);
    setCurrentPet(active);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const switchPet = useCallback((id) => {
    petsStorage.setActive(id);
    reload();
  }, [reload]);

  if (!currentPet) return null;

  return (
    <PetContext.Provider value={{ currentPet, pets, switchPet, reload }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePet() {
  return useContext(PetContext);
}
