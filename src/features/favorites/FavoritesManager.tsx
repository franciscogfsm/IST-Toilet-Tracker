import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Bathroom } from "@/types";

interface FavoritesManagerProps {
  bathroom: Bathroom;
  onToggleFavorite?: (bathroomId: string, isFavorite: boolean) => void;
  size?: "sm" | "md" | "lg";
}

export function FavoritesManager({
  bathroom,
  onToggleFavorite,
  size = "md",
}: FavoritesManagerProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  // Load favorite status from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(bathroom.id));
  }, [bathroom.id]);

  const toggleFavorite = () => {
    const newIsFavorite = !isFavorite;
    setIsFavorite(newIsFavorite);

    // Update localStorage
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (newIsFavorite) {
      favorites.push(bathroom.id);
    } else {
      const index = favorites.indexOf(bathroom.id);
      if (index > -1) {
        favorites.splice(index, 1);
      }
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));

    // Notify parent component
    onToggleFavorite?.(bathroom.id, newIsFavorite);
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-9 w-9",
    lg: "h-10 w-10",
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFavorite}
      className={`rounded-full p-0 hover:bg-red-50 ${sizeClasses[size]}`}
      aria-label={
        isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
      }
    >
      <Heart
        className={`transition-all duration-200 ${
          isFavorite
            ? "fill-red-500 text-red-500 scale-110"
            : "text-gray-400 hover:text-red-400"
        }`}
        size={size === "sm" ? 16 : size === "md" ? 18 : 20}
      />
    </Button>
  );
}
