import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTestId?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionTestId,
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6">
        <div className="rounded-full bg-muted p-6 mb-4">
          {icon}
        </div>
        <h3 className="font-serif text-xl font-semibold mb-2 text-center">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md text-center">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} data-testid={actionTestId}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
