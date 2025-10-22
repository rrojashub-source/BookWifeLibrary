import { useQuery } from "@tanstack/react-query";
import { ReadingGoal } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, BookOpen, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface GoalProgressCardProps {
  booksFinished: number;
  totalPagesRead: number;
  year: number;
}

export function GoalProgressCard({ booksFinished, totalPagesRead, year }: GoalProgressCardProps) {
  const { data: goal } = useQuery<ReadingGoal>({
    queryKey: [`/api/goals/year/${year}`],
    retry: false,
  });

  if (!goal) {
    return (
      <Card data-testid="card-no-goal">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Meta de Lectura {year}</CardTitle>
            </div>
          </div>
          <CardDescription>
            No has establecido una meta para este año
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/goals">
            <Button className="w-full" data-testid="button-create-goal">
              <Target className="h-4 w-4 mr-2" />
              Crear Meta de Lectura
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isBooks = goal.type === "books";
  const current = isBooks ? booksFinished : totalPagesRead;
  const target = goal.target;
  const progress = Math.min((current / target) * 100, 100);
  const remaining = Math.max(target - current, 0);
  const isComplete = current >= target;

  return (
    <Card data-testid="card-goal-progress">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle>Meta de Lectura {year}</CardTitle>
          </div>
          {isComplete && (
            <div className="flex items-center gap-1 text-sm font-semibold text-primary">
              <TrendingUp className="h-4 w-4" />
              ¡Completada!
            </div>
          )}
        </div>
        <CardDescription>
          {isBooks ? (
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {target} libros este año
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {target.toLocaleString()} páginas este año
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progreso</span>
            <span className="font-semibold" data-testid="text-progress-percentage">
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress value={progress} className="h-3" data-testid="progress-bar" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Completado</p>
            <p className="text-2xl font-bold" data-testid="text-current">
              {current.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {isComplete ? "Superado en" : "Restante"}
            </p>
            <p className="text-2xl font-bold text-muted-foreground" data-testid="text-remaining">
              {isComplete ? (current - target).toLocaleString() : remaining.toLocaleString()}
            </p>
          </div>
        </div>

        <Link href="/goals">
          <Button variant="outline" className="w-full" size="sm" data-testid="button-view-goals">
            Ver Todas las Metas
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
