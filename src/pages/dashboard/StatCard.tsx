import React, { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  label: string;
  icon?: ReactNode;
  valueClassName?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  label,
  icon,
  valueClassName = '',
  className = '',
}) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className={`mt-2 flex items-baseline`}>
              <p className={`text-2xl font-semibold ${valueClassName}`}>
                {value}
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
