import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, X } from "lucide-react";

interface ReviewFormProps {
  bathroomName: string;
  onClose: () => void;
  onSubmit: (reviewData: ReviewData) => void;
}

interface ReviewData {
  rating: number;
  comment: string;
  user_name: string;
  cleanliness: number;
  paper_supply: number;
  privacy: number;
}

export function ReviewForm({
  bathroomName,
  onClose,
  onSubmit,
}: ReviewFormProps) {
  const [formData, setFormData] = useState<ReviewData>({
    rating: 5,
    comment: "",
    user_name: "",
    cleanliness: 5,
    paper_supply: 5,
    privacy: 5,
  });

  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_name.trim() || !formData.comment.trim()) {
      alert("Por favor preencha todos os campos obrigatórios.");
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const RatingInput = ({
    label,
    value,
    onChange,
    name,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    name: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(null)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 ${
                star <= (hoveredRating ?? value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Avaliar {bathroomName}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_name">Nome *</Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, user_name: e.target.value }))
              }
              placeholder="Seu nome"
              required
            />
          </div>

          <RatingInput
            label="Avaliação Geral *"
            value={formData.rating}
            onChange={(rating) => setFormData((prev) => ({ ...prev, rating }))}
            name="rating"
          />

          <RatingInput
            label="Limpeza"
            value={formData.cleanliness}
            onChange={(cleanliness) =>
              setFormData((prev) => ({ ...prev, cleanliness }))
            }
            name="cleanliness"
          />

          <RatingInput
            label="Fornecimento de Papel"
            value={formData.paper_supply}
            onChange={(paper_supply) =>
              setFormData((prev) => ({ ...prev, paper_supply }))
            }
            name="paper_supply"
          />

          <RatingInput
            label="Privacidade"
            value={formData.privacy}
            onChange={(privacy) =>
              setFormData((prev) => ({ ...prev, privacy }))
            }
            name="privacy"
          />

          <div className="space-y-2">
            <Label htmlFor="comment">Comentário *</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Conte-nos sua experiência..."
              rows={3}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Enviar Avaliação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
