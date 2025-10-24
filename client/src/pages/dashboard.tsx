import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats, dashboardStatsSchema } from "@shared/schema";
import { StatsCard } from "@/components/stats-card";
import { MonthlyBooksChart, MonthlyPagesChart, YearlyComparisonChart } from "@/components/charts";
import { GoalProgressCard } from "@/components/goal-progress-card";
import { ReadingHistory } from "@/components/reading-history";
import { BookOpen, BookCheck, Clock, FileText, TrendingUp, AlertCircle, RefreshCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { EmptyState } from "@/components/empty-state";
import { queryClient } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const { toast } = useToast();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  
  const { data: rawStats, isLoading, isError, error, refetch } = useQuery<DashboardStats>({
    queryKey: ["/api/stats", selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/stats?year=${selectedYear}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
  });

  // Validate stats with Zod for defensive programming (use safeParse to avoid crashes)
  const validationResult = rawStats ? dashboardStatsSchema.safeParse(rawStats) : null;
  const stats = validationResult?.success ? validationResult.data : null;

  // Show error toast only once when query fails
  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error al cargar estadísticas",
        description: error instanceof Error ? error.message : "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  // Handle retry
  const handleRetry = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/stats", selectedYear] });
    refetch();
  };

  // Generate list of years for selector
  const getAvailableYears = () => {
    const years = [];
    const startYear = 2020; // Or you could make this dynamic based on first book entry
    for (let year = currentYear; year >= startYear; year--) {
      years.push(year);
    }
    return years;
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="rounded-full bg-destructive/10 p-6 mb-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="font-serif text-2xl font-semibold mb-2">
          Error al cargar estadísticas
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          No se pudieron cargar las estadísticas. Por favor intenta nuevamente.
        </p>
        <Button
          onClick={handleRetry}
          variant="outline"
          data-testid="button-retry-stats"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
        title="Sin datos disponibles"
        description="No hay estadísticas para mostrar en este momento."
        actionLabel="Agregar tu primer libro"
        onAction={() => window.location.href = "/library"}
        actionTestId="button-add-first-book"
      />
    );
  }

  // Calculate deltas for trends
  const booksDelta = stats.previousMonthStats 
    ? stats.currentMonthStats.booksRead - stats.previousMonthStats.booksRead 
    : null;
  const pagesDelta = stats.previousMonthStats 
    ? stats.currentMonthStats.pagesRead - stats.previousMonthStats.pagesRead 
    : null;
  const yearlyBooksDelta = stats.previousYearStats 
    ? stats.currentYearStats.booksRead - stats.previousYearStats.booksRead 
    : null;

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen de tu progreso de lectura en {selectedYear}
            </p>
          </div>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]" data-testid="select-year">
              <SelectValue placeholder="Seleccionar año" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableYears().map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Libros"
            value={stats.totalBooks}
            icon={BookOpen}
            description="En tu colección"
          />
          <StatsCard
            title="Libros Terminados"
            value={stats.booksFinished}
            icon={BookCheck}
            description={`En ${selectedYear}`}
            trend={yearlyBooksDelta !== null ? yearlyBooksDelta : undefined}
          />
          <StatsCard
            title="Leyendo Ahora"
            value={stats.booksReading}
            icon={Clock}
            description="En progreso"
          />
          <StatsCard
            title="Páginas Leídas"
            value={stats.totalPagesRead.toLocaleString()}
            icon={FileText}
            description={`En ${selectedYear}`}
          />
        </div>

        {selectedYear === currentYear && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatsCard
              title="Este Mes - Libros"
              value={stats.currentMonthStats.booksRead}
              icon={TrendingUp}
              description={new Date().toLocaleDateString("es", { month: "long", year: "numeric" })}
              trend={booksDelta !== null ? booksDelta : undefined}
            />
            <StatsCard
              title="Este Mes - Páginas"
              value={stats.currentMonthStats.pagesRead.toLocaleString()}
              icon={TrendingUp}
              description={new Date().toLocaleDateString("es", { month: "long", year: "numeric" })}
              trend={pagesDelta !== null ? pagesDelta : undefined}
            />
          </div>
        )}

        <GoalProgressCard
          booksFinished={stats.currentYearStats.booksRead}
          totalPagesRead={stats.currentYearStats.pagesRead}
          year={selectedYear}
        />

        <Tabs defaultValue="books" className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="books" data-testid="tab-books">
              Libros Leídos
            </TabsTrigger>
            <TabsTrigger value="pages" data-testid="tab-pages">
              Páginas Leídas
            </TabsTrigger>
            <TabsTrigger value="comparison" data-testid="tab-comparison">
              Comparación
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="mt-6 space-y-6">
            {stats.currentYearStats.monthlyBreakdown.length > 0 ? (
              <MonthlyBooksChart
                data={stats.currentYearStats.monthlyBreakdown}
                title="Libros Leídos por Mes"
                description={`Progreso mensual en ${selectedYear}`}
              />
            ) : (
              <EmptyState
                icon={<BookOpen className="h-8 w-8 text-muted-foreground" />}
                title="Sin datos de libros"
                description={`No has terminado ningún libro en ${selectedYear}. ¡Comienza a leer!`}
                actionLabel="Ir a la biblioteca"
                onAction={() => window.location.href = "/library"}
                actionTestId="button-goto-library"
              />
            )}
          </TabsContent>

          <TabsContent value="pages" className="mt-6 space-y-6">
            {stats.currentYearStats.monthlyBreakdown.length > 0 ? (
              <MonthlyPagesChart
                data={stats.currentYearStats.monthlyBreakdown}
                title="Páginas Leídas por Mes"
                description={`Tendencia de páginas en ${selectedYear}`}
              />
            ) : (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                title="Sin datos de páginas"
                description={`No hay registro de páginas leídas en ${selectedYear}.`}
              />
            )}
          </TabsContent>

          <TabsContent value="comparison" className="mt-6 space-y-6">
            <YearlyComparisonChart data={stats.currentYearStats.monthlyBreakdown} />
          </TabsContent>

          <TabsContent value="history" className="mt-6 space-y-6">
            <ReadingHistory year={selectedYear} />
          </TabsContent>
        </Tabs>

        {stats.booksFinished === 0 && (
          <div className="text-center py-8 bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">
              Comienza a leer y marca tus libros como "Terminado" para ver estadísticas detalladas
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
