import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
  valueColor?: string;
  showProgressBar?: boolean;
  progressValue?: number;
  showStatusDots?: boolean;
  statusDots?: Array<{ color: string; animated?: boolean }>;
  showPulsingDot?: boolean;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  valueColor = "#F9F9F9",
  showProgressBar = false,
  progressValue = 0,
  showStatusDots = false,
  statusDots = [],
  showPulsingDot = false,
}: StatsCardProps) {
  return (
    <Card
      className="transition-all duration-200 hover:scale-105 border-2"
      style={{
        backgroundColor: "#111111",
        borderColor: "#777777",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle
            className="text-sm font-medium uppercase tracking-wide"
            style={{ color: "#748AA1" }}
          >
            {title}
          </CardTitle>
          <Icon className="h-5 w-5 \" style={{ color: "#777777" }} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-bold" style={{ color: valueColor }}>
          {value}
        </div>

        {showStatusDots && statusDots.length > 0 && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {statusDots.map((dot, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    dot.animated ? "animate-pulse" : ""
                  }`}
                  style={{ backgroundColor: dot.color }}
                />
              ))}
            </div>
            {subtitle && (
              <p className="text-sm" style={{ color: "#748AA1" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {showPulsingDot && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            {subtitle && (
              <p className="text-sm" style={{ color: "#748AA1" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {showProgressBar && (
          <div className="space-y-1">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            {subtitle && (
              <p className="text-sm" style={{ color: "#748AA1" }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {!showStatusDots && !showPulsingDot && !showProgressBar && subtitle && (
          <p className="text-sm" style={{ color: "#748AA1" }}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
