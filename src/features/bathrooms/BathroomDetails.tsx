import { Bathroom } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  MapPin,
  Clock,
  CheckCircle,
  X,
  Paperclip,
  Shield,
  Users,
} from "lucide-react";

interface BathroomDetailsProps {
  bathroom: Bathroom;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmit: (bathroomId: string, reviewData: any) => void;
}

export function BathroomDetails({
  bathroom,
  isOpen,
  onClose,
  onReviewSubmit,
}: BathroomDetailsProps) {
  if (!isOpen) return null;

  const handleReviewSubmit = (reviewData: any) => {
    onReviewSubmit(bathroom.id, reviewData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">{bathroom.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {bathroom.building} • Piso {bathroom.floor}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{bathroom.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {bathroom.review_count} reviews
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-lg">{bathroom.distance}m</span>
              </div>
              <p className="text-xs text-muted-foreground">Distância</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-green-500" />
                <span className="font-bold text-sm">
                  {bathroom.last_cleaned}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Última limpeza</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-bold text-lg">
                  {bathroom.has_accessible ? "Sim" : "Não"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Acessível</p>
            </div>
          </div>

          <Separator />

          {/* Quality Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Qualidade</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Limpeza</p>
                  <p className="text-sm text-muted-foreground">
                    {bathroom.cleanliness}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Paperclip className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Papel</p>
                  <p className="text-sm text-muted-foreground">
                    {bathroom.paper_supply}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Privacidade</p>
                  <p className="text-sm text-muted-foreground">
                    {bathroom.privacy}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Facilities */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Instalações</h3>
            <div className="flex flex-wrap gap-2">
              {bathroom.facilities.map((facility, index) => (
                <Badge key={index} variant="secondary">
                  {facility}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Avaliações Recentes</h3>
            {bathroom.reviews.length > 0 ? (
              <div className="space-y-3">
                {bathroom.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.user_name}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {review.comment}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.date}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhuma avaliação ainda.</p>
            )}
          </div>

          {/* Review Button */}
          <div className="pt-4">
            <Button
              className="w-full"
              onClick={() => {
                // This would trigger the review form modal
                console.log("Open review form for", bathroom.name);
              }}
            >
              <Star className="h-4 w-4 mr-2" />
              Avaliar esta casa de banho
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
