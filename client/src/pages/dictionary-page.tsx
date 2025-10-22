import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DictionaryEntry, Book, InsertDictionaryEntry } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DictionaryFormDialog } from "@/components/dictionary-form-dialog";

export default function DictionaryPage() {
  const [editingEntry, setEditingEntry] = useState<DictionaryEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<DictionaryEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all dictionary entries
  const { data: entries = [], isLoading } = useQuery<DictionaryEntry[]>({
    queryKey: ["/api/dictionary"],
  });

  // Fetch all books for the book selector
  const { data: books = [] } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertDictionaryEntry) => {
      return await apiRequest("POST", "/api/dictionary", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dictionary"] });
      setIsDialogOpen(false);
      toast({
        title: "Entrada guardada",
        description: "La palabra se agregó al diccionario exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la entrada",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertDictionaryEntry }) => {
      return await apiRequest("PATCH", `/api/dictionary/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dictionary"] });
      setIsDialogOpen(false);
      setEditingEntry(null);
      toast({
        title: "Entrada actualizada",
        description: "Los cambios se guardaron exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la entrada",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/dictionary/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dictionary"] });
      setDeletingEntry(null);
      toast({
        title: "Entrada eliminada",
        description: "La palabra se eliminó del diccionario",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la entrada",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertDictionaryEntry) => {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (entry: DictionaryEntry) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleNewEntry = () => {
    setEditingEntry(null);
    setIsDialogOpen(true);
  };

  const getBookTitle = (bookId: string | null) => {
    if (!bookId) return null;
    const book = books.find((b) => b.id === bookId);
    return book?.title;
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="heading-dictionary">
            Diccionario Personal
          </h1>
          <p className="text-muted-foreground mt-1">
            Guarda palabras y sus definiciones de tus lecturas
          </p>
        </div>
        <Button onClick={handleNewEntry} data-testid="button-add-entry">
          <Plus className="w-4 h-4 mr-2" />
          Agregar Palabra
        </Button>
      </div>

      <DictionaryFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        entry={editingEntry || undefined}
        books={books}
        isPending={isPending}
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <Card className="text-center p-12">
          <CardContent className="space-y-4">
            <BookOpen className="w-16 h-16 mx-auto text-muted-foreground" />
            <div>
              <CardTitle className="text-xl mb-2">No hay entradas aún</CardTitle>
              <CardDescription>
                Comienza a construir tu diccionario personal agregando palabras de tus lecturas
              </CardDescription>
            </div>
            <Button onClick={handleNewEntry} data-testid="button-add-first-entry">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Primera Palabra
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="hover-elevate" data-testid={`card-entry-${entry.id}`}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1">
                  <CardTitle className="text-lg" data-testid={`text-word-${entry.id}`}>
                    {entry.word}
                  </CardTitle>
                  {entry.bookId && (
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <BookOpen className="w-3 h-3" />
                      <span className="text-xs" data-testid={`text-book-${entry.id}`}>
                        {getBookTitle(entry.bookId)}
                      </span>
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(entry)}
                    data-testid={`button-edit-${entry.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeletingEntry(entry)}
                    data-testid={`button-delete-${entry.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm" data-testid={`text-definition-${entry.id}`}>
                  {entry.definition}
                </p>
                {entry.notes && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-primary pl-2" data-testid={`text-notes-${entry.id}`}>
                    {entry.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingEntry} onOpenChange={() => setDeletingEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar entrada?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La palabra "{deletingEntry?.word}" será eliminada permanentemente de tu diccionario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEntry && deleteMutation.mutate(deletingEntry.id)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
