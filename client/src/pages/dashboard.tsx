import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@shared/schema";
import { StatsCard } from "@/components/stats-card";
import { MonthlyBooksChart, MonthlyPagesChart, YearlyComparisonChart } from "@/components/charts";
import { BookOpen, BookCheck, Clock, FileText, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();
  const { data: stats, isLoading, isError, error } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  // Show error toast when query fails
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error al cargar estadísticas",
        description: error instanceof Error ? error.message : "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
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
          No se pudieron cargar las estadísticas. Por favor intenta recargar la página.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          data-testid="button-reload-stats"
        >
          Recargar Página
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de tu progreso de lectura en {currentYear}
          </p>
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
            description={`En ${currentYear}`}
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
            description={`En ${currentYear}`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatsCard
            title="Este Mes - Libros"
            value={stats.currentMonthStats.booksRead}
            icon={TrendingUp}
            description={new Date().toLocaleDateString("es", { month: "long", year: "numeric" })}
          />
          <StatsCard
            title="Este Mes - Páginas"
            value={stats.currentMonthStats.pagesRead.toLocaleString()}
            icon={TrendingUp}
            description={new Date().toLocaleDateString("es", { month: "long", year: "numeric" })}
          />
        </div>

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
          </TabsList>

          <TabsContent value="books" className="mt-6 space-y-6">
            <MonthlyBooksChart
              data={stats.currentYearStats.monthlyBreakdown}
              title="Libros Leídos por Mes"
              description={`Progreso mensual en ${currentYear}`}
            />
          </TabsContent>

          <TabsContent value="pages" className="mt-6 space-y-6">
            <MonthlyPagesChart
              data={stats.currentYearStats.monthlyBreakdown}
              title="Páginas Leídas por Mes"
              description={`Tendencia de páginas en ${currentYear}`}
            />
          </TabsContent>

          <TabsContent value="comparison" className="mt-6 space-y-6">
            <YearlyComparisonChart data={stats.currentYearStats.monthlyBreakdown} />
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
