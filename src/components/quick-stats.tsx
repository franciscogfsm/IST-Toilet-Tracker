import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Star, MapPin, Users, Clock, Award } from "lucide-react";

interface QuickStatsProps {
  totalBathrooms: number;
  topRating: number;
  cleanestCount: number;
  accessibleCount: number;
  totalReviews: number;
  averageRating: number;
}

export function QuickStats({
  totalBathrooms,
  topRating,
  cleanestCount,
  accessibleCount,
  totalReviews,
  averageRating,
}: QuickStatsProps) {
  const stats = [
    {
      icon: MapPin,
      label: "Locais no campus",
      value: totalBathrooms,
      color: "from-blue-500 to-cyan-500",
      bgColor:
        "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    },
    {
      icon: Star,
      label: "Melhor avaliação",
      value: `${topRating}★`,
      color: "from-yellow-500 to-orange-500",
      bgColor:
        "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
    },
    {
      icon: Award,
      label: "Sempre limpos",
      value: cleanestCount,
      color: "from-green-500 to-emerald-500",
      bgColor:
        "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
    },
    {
      icon: Users,
      label: "Acessíveis",
      value: accessibleCount,
      color: "from-purple-500 to-pink-500",
      bgColor:
        "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-br ${stat.bgColor} backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
          >
            <CardContent className="p-4 text-center">
              <div
                className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-md`}
              >
                <Icon className="h-5 w-5 text-white" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {stat.label}
              </p>
              <p className="text-lg font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
