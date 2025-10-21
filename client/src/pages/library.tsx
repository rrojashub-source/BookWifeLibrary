import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Book, InsertBook } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { BookFormDialog } from "@/components/book-form-dialog";
import { BookDetailDialog } from "@/components/book-detail-dialog";
import { Filters } from "@/components/filters";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Library() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");

  const { data: books = [], isLoading, isError, error } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  // Show error toast when query fails
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error al cargar libros",
        description: error instanceof Error ? error.message : "No se pudieron cargar los libros",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertBook) => {
      return await apiRequest("POST", "/api/books", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setIsFormOpen(false);
      setEditingBook(undefined);
      toast({
        title: "Libro agregado",
        description: "El libro se ha agregado a tu colección",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo agregar el libro",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: InsertBook }) => {
      return await apiRequest("PATCH", `/api/books/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setIsFormOpen(false);
      setEditingBook(undefined);
      setSelectedBook(null);
      toast({
        title: "Libro actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el libro",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/books/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setSelectedBook(null);
      toast({
        title: "Libro eliminado",
        description: "El libro se ha eliminado de tu colección",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el libro",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertBook) => {
    if (editingBook) {
      updateMutation.mutate({ id: editingBook.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = () => {
    if (selectedBook) {
      setEditingBook(selectedBook);
      setIsFormOpen(true);
    }
  };

  const handleDelete = () => {
    if (selectedBook) {
      if (window.confirm("¿Estás segura de que quieres eliminar este libro?")) {
        deleteMutation.mutate(selectedBook.id);
      }
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    const matchesGenre = genreFilter === "all" || book.genre === genreFilter;
    return matchesSearch && matchesStatus && matchesGenre;
  });

  const uniqueGenres = Array.from(new Set(books.map((b) => b.genre).filter(Boolean))) as string[];

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold">Mi Biblioteca</h1>
            <p className="text-muted-foreground">
              {books.length} {books.length === 1 ? "libro" : "libros"} en tu colección
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingBook(undefined);
              setIsFormOpen(true);
            }}
            data-testid="button-add-book"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Libro
          </Button>
        </div>

        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          genreFilter={genreFilter}
          onGenreFilterChange={setGenreFilter}
          genres={uniqueGenres}
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-destructive/10 p-6 mb-4">
              <BookOpen className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="font-serif text-2xl font-semibold mb-2">
              Error al cargar la biblioteca
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              No se pudieron cargar los libros. Por favor intenta recargar la página.
            </p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              data-testid="button-reload"
            >
              Recargar Página
            </Button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-2xl font-semibold mb-2">
              {books.length === 0 ? "No hay libros en tu biblioteca" : "No se encontraron libros"}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {books.length === 0
                ? "Comienza a construir tu colección agregando tu primer libro"
                : "Intenta ajustar los filtros de búsqueda"}
            </p>
            {books.length === 0 && (
              <Button
                onClick={() => {
                  setEditingBook(undefined);
                  setIsFormOpen(true);
                }}
                data-testid="button-add-first-book"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Libro
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => setSelectedBook(book)}
              />
            ))}
          </div>
        )}

        <BookFormDialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingBook(undefined);
          }}
          onSubmit={handleSubmit}
          book={editingBook}
          isPending={createMutation.isPending || updateMutation.isPending}
        />

        <BookDetailDialog
          book={selectedBook}
          open={!!selectedBook}
          onOpenChange={(open) => !open && setSelectedBook(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
