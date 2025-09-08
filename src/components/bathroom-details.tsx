import { useState } from "react";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Accessibility,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Bathroom, Review } from "@/data/bathrooms";
import { ReviewForm } from "./review-form";

interface BathroomDetailsProps {
  bathroom: Bathroom;
  onClose: () => void;
}

export function BathroomDetails({ bathroom, onClose }: BathroomDetailsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const getSupplyColor = (supply: string) => {
    switch (supply) {
      case "Bom":
        return "text-green-600";
      case "Médio":
        return "text-yellow-600";
      case "Fraco":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case "Excelente":
        return "text-green-600";
      case "Boa":
        return "text-blue-600";
      case "Média":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl mb-2">{bathroom.name}</CardTitle>
              <p className="text-muted-foreground">{bathroom.building}</p>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Rating & Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < bathroom.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{bathroom.rating}</span>
                <span className="text-sm text-muted-foreground">
                  ({bathroom.reviewCount} avaliações)
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{bathroom.distance}m de distância</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>Limpo {bathroom.lastCleaned}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Papel higiénico:</span>
                <span
                  className={`text-sm font-semibold ${getSupplyColor(
                    bathroom.paperSupply
                  )}`}
                >
                  {bathroom.paperSupply}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Privacidade:</span>
                <span
                  className={`text-sm font-semibold ${getPrivacyColor(
                    bathroom.privacy
                  )}`}
                >
                  {bathroom.privacy}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Accessibility className="h-4 w-4" />
                <span className="text-sm">
                  {bathroom.accessibility ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Acessível
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      Não acessível
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Facilities */}
          <div>
            <h3 className="font-semibold mb-3">Equipamentos disponíveis</h3>
            <div className="flex flex-wrap gap-2">
              {bathroom.facilities.map((facility, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {facility}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Avaliações recentes
              </h3>
              <Button
                size="sm"
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-primary to-primary-hover"
              >
                Avaliar
              </Button>
            </div>

            <div className="space-y-4">
              {bathroom.reviews.slice(0, 3).map((review) => (
                <Card key={review.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{review.user}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.date).toLocaleDateString("pt-PT")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>

                    <div className="flex gap-4 mt-3 text-xs">
                      <span>Limpeza: {review.cleanliness}★</span>
                      <span>Papel: {review.paperSupply}★</span>
                      <span>Privacidade: {review.privacy}★</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {bathroom.reviews.length > 3 && (
              <Button variant="outline" className="w-full mt-4">
                Ver todas as {bathroom.reviewCount} avaliações
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md">
            <ReviewForm
              bathroomName={bathroom.name}
              onClose={() => setShowReviewForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
