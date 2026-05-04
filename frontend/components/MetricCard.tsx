interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  status?: "success" | "warning" | "error" | "info";
}

export default function MetricCard({
  title,
  value,
  unit,
  change,
  icon,
  trend = "neutral",
  status = "info",
}: MetricCardProps) {
  const statusColors = {
    success: "text-success border-success/30 bg-success/5",
    warning: "text-warning border-warning/30 bg-warning/5",
    error: "text-error border-error/30 bg-error/5",
    info: "text-primary border-primary/30 bg-primary/5",
  };

  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-gray-400",
  };

  return (
    <div className="glass rounded-xl p-6 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-50">{value}</span>
            {unit && <span className="text-sm text-gray-500">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${statusColors[status]}`}
          >
            {icon}
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${trendColors[trend]}`}>
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"}
            {Math.abs(change)}%
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}

// Made with Bob
