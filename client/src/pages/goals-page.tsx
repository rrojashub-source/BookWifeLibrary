import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReadingGoalSchema, type InsertReadingGoal, type ReadingGoal } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Target, BookOpen, FileText, Trash2, Edit, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function GoalsPage() {
  const { toast } = useToast();
  const [editingGoal, setEditingGoal] = useState<ReadingGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<ReadingGoal | null>(null);
  const currentYear = new Date().getFullYear();

  const { data: goals = [], isLoading } = useQuery<ReadingGoal[]>({
    queryKey: ["/api/goals"],
  });

  const form = useForm<InsertReadingGoal>({
    resolver: zodResolver(insertReadingGoalSchema.omit({ userId: true })),
    defaultValues: {
      year: currentYear,
      type: "books",
      target: 12,
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: Omit<InsertReadingGoal, "userId">) => {
      return await apiRequest("/api/goals", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta Creada",
        description: "Tu meta de lectura ha sido creada exitosamente",
      });
      form.reset({
        year: currentYear + 1,
        type: "books",
        target: 12,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la meta",
        variant: "destructive",
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Omit<InsertReadingGoal, "userId"> }) => {
      return await apiRequest(`/api/goals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta Actualizada",
        description: "Tu meta de lectura ha sido actualizada exitosamente",
      });
      setEditingGoal(null);
      form.reset({
        year: currentYear + 1,
        type: "books",
        target: 12,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la meta",
        variant: "destructive",
      });
    },
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/goals/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Meta Eliminada",
        description: "Tu meta de lectura ha sido eliminada",
      });
      setDeletingGoal(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la meta",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: Omit<InsertReadingGoal, "userId">) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleEdit = (goal: ReadingGoal) => {
    setEditingGoal(goal);
    form.reset({
      year: goal.year,
      type: goal.type as "books" | "pages",
      target: goal.target,
    });
  };

  const handleCancelEdit = () => {
    setEditingGoal(null);
    form.reset({
      year: currentYear + 1,
      type: "books",
      target: 12,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-bold text-primary flex items-center gap-3">
          <Target className="h-8 w-8" />
          Metas de Lectura
        </h1>
        <p className="text-muted-foreground text-lg">
          Establece y monitorea tus objetivos anuales de lectura
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingGoal ? "Editar Meta" : "Nueva Meta"}
            </CardTitle>
            <CardDescription>
              {editingGoal
                ? "Modifica los detalles de tu meta"
                : "Define un objetivo anual de lectura"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={2000}
                          max={2100}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-year"
                        />
                      </FormControl>
                      <FormDescription>
                        Año para el cual deseas establecer la meta
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Meta</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-type">
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="books" data-testid="type-books">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span>Libros</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="pages" data-testid="type-pages">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Páginas</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Elige si quieres medir por cantidad de libros o páginas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="target"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Objetivo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          placeholder="Ej: 12 libros o 5000 páginas"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-target"
                        />
                      </FormControl>
                      <FormDescription>
                        {form.watch("type") === "books"
                          ? "Cantidad de libros que deseas leer"
                          : "Cantidad de páginas que deseas leer"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 justify-end">
                  {editingGoal && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      data-testid="button-cancel"
                    >
                      Cancelar
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                    data-testid="button-submit-goal"
                  >
                    {editingGoal ? "Actualizar Meta" : "Crear Meta"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Goals List Section */}
        <Card>
          <CardHeader>
            <CardTitle>Mis Metas</CardTitle>
            <CardDescription>
              Todas tus metas de lectura organizadas por año
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">
                Cargando metas...
              </p>
            ) : goals.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No tienes metas de lectura. ¡Crea tu primera meta!
              </p>
            ) : (
              <div className="space-y-4">
                {goals
                  .sort((a, b) => b.year - a.year)
                  .map((goal) => (
                    <Card key={goal.id} className="hover-elevate" data-testid={`goal-${goal.year}`}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-xl">{goal.year}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {goal.type === "books" ? (
                                <BookOpen className="h-4 w-4" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              <span>
                                {goal.target} {goal.type === "books" ? "libros" : "páginas"}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(goal)}
                              data-testid={`button-edit-${goal.year}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingGoal(goal)}
                              data-testid={`button-delete-${goal.year}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGoal} onOpenChange={() => setDeletingGoal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar meta?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la meta del año {deletingGoal?.year}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingGoal && deleteGoalMutation.mutate(deletingGoal.id)}
              data-testid="button-confirm-delete"
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
