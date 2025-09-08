import { useState } from "react";
import { Star, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  bathroomName: string;
  onClose: () => void;
}

export function ReviewForm({ bathroomName, onClose }: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [cleanlinessRating, setCleanlinessRating] = useState(0);
  const [paperSupplyRating, setPaperSupplyRating] = useState(0);
  const [privacyRating, setPrivacyRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredOverall, setHoveredOverall] = useState(0);
  const [hoveredCleanliness, setHoveredCleanliness] = useState(0);
  const [hoveredPaper, setHoveredPaper] = useState(0);
  const [hoveredPrivacy, setHoveredPrivacy] = useState(0);
  const { toast } = useToast();

  const StarRating = ({
    rating,
    setRating,
    hovered,
    setHovered,
    label,
  }: {
    rating: number;
    setRating: (rating: number) => void;
    hovered: number;
    setHovered: (rating: number) => void;
    label: string;
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-all duration-150 hover:scale-110"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`h-5 w-5 ${
                star <= (hovered || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (overallRating === 0) {
      toast({
        title: "Avaliação necessária",
        description: "Por favor, selecione uma classificação geral",
        variant: "destructive",
      });
      return;
    }

    // Simulate review submission
    toast({
      title: "Avaliação enviada!",
      description: "Obrigado pelo seu feedback sobre " + bathroomName,
    });

    onClose();
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">
          Avaliar {bathroomName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <StarRating
            rating={overallRating}
            setRating={setOverallRating}
            hovered={hoveredOverall}
            setHovered={setHoveredOverall}
            label="Classificação geral *"
          />

          <Separator />

          {/* Detailed Ratings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">
              Avaliações específicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StarRating
                rating={cleanlinessRating}
                setRating={setCleanlinessRating}
                hovered={hoveredCleanliness}
                setHovered={setHoveredCleanliness}
                label="Limpeza"
              />

              <StarRating
                rating={paperSupplyRating}
                setRating={setPaperSupplyRating}
                hovered={hoveredPaper}
                setHovered={setHoveredPaper}
                label="Papel higiénico"
              />

              <StarRating
                rating={privacyRating}
                setRating={setPrivacyRating}
                hovered={hoveredPrivacy}
                setHovered={setHoveredPrivacy}
                label="Privacidade"
              />
            </div>
          </div>

          <Separator />

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Comentário (opcional)
            </label>
            <Textarea
              placeholder="Descreva a sua experiência... (equipamentos, limpeza, localização, etc.)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none bg-background/50 border-border/50 focus:border-primary/50"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-primary-foreground"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar avaliação
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
