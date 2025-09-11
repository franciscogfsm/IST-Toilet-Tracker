import { useState, useEffect } from "react";
import { Bathroom } from "@/types";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    setFavorites(storedFavorites);
  }, []);

  const addToFavorites = (bathroomId: string) => {
    const newFavorites = [...favorites, bathroomId];
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (bathroomId: string) => {
    const newFavorites = favorites.filter((id) => id !== bathroomId);
    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
  };

  const toggleFavorite = (bathroomId: string) => {
    if (favorites.includes(bathroomId)) {
      removeFromFavorites(bathroomId);
    } else {
      addToFavorites(bathroomId);
    }
  };

  const isFavorite = (bathroomId: string) => {
    return favorites.includes(bathroomId);
  };

  const getFavoriteBathrooms = (allBathrooms: Bathroom[]) => {
    return allBathrooms.filter((bathroom) => favorites.includes(bathroom.id));
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorite,
    getFavoriteBathrooms,
  };
}
