import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Book, InsertBook } from "@shared/schema";
import { BookCard } from "@/components/book-card";
import { BookFormDialog } from "@/components/book-form-dialog";
import { BookDetailDialog } from "@/components/book-detail-dialog";
import { Button } from "@/components/ui/button";
import { Plus, Heart, Loader2, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";

export default function WishlistPage() {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: books = [], isLoading, isError, error } = useQuery<Book[]>({
    queryKey: ["/api/wishlist"],
  });

  // Show error toast when query fails
  useEffect(() => {
    if (isError) {
      toast({
        title: "Error al cargar lista de deseos",
        description: error instanceof Error ? error.message : "No se pudo cargar la lista",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertBook) => {
      // Ensure isWishlist is set to 1 for wishlist items
      return await apiRequest("POST", "/api/books", { ...data, isWishlist: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      setIsFormOpen(false);
      setEditingBook(undefined);
      toast({
        title: "Libro agregado",
        description: "El libro se ha agregado a tu lista de deseos",
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
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      setSelectedBook(null);
      toast({
        title: "Libro eliminado",
        description: "El libro se ha eliminado de tu lista de deseos",
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

  const moveToLibraryMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/books/${id}/move-to-library`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      queryClient.invalidateQueries({ queryKey: ["/api/books"] });
      setSelectedBook(null);
      toast({
        title: "¡Libro adquirido!",
        description: "El libro se ha movido a tu biblioteca",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo mover el libro",
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
      if (window.confirm("¿Estás segura de que quieres eliminar este libro de tu lista de deseos?")) {
        deleteMutation.mutate(selectedBook.id);
      }
    }
  };

  const handleMoveToLibrary = () => {
    if (selectedBook) {
      if (window.confirm("¿Ya adquiriste este libro? Se moverá a tu biblioteca.")) {
        moveToLibraryMutation.mutate(selectedBook.id);
      }
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold flex items-center gap-2" data-testid="heading-wishlist">
              <Heart className="h-8 w-8 text-primary" />
              Lista de Deseos
            </h1>
            <p className="text-muted-foreground">
              {books.length} {books.length === 1 ? "libro" : "libros"} que deseas leer
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingBook(undefined);
              setIsFormOpen(true);
            }}
            data-testid="button-add-wishlist-book"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar a Lista
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título o autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-destructive/10 p-6 mb-4">
              <ShoppingBag className="h-12 w-12 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Error al cargar</h3>
            <p className="text-muted-foreground">No se pudo cargar tu lista de deseos</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-primary/10 p-6 mb-4">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "No se encontraron libros" : "Tu lista de deseos está vacía"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm
                ? "Intenta con otros términos de búsqueda"
                : "Agrega libros que te gustaría leer en el futuro"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsFormOpen(true)} data-testid="button-add-first-wishlist">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Libro
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmit}
          book={editingBook}
          isPending={createMutation.isPending || updateMutation.isPending}
        />

        {selectedBook && (
          <BookDetailDialog
            book={selectedBook}
            open={!!selectedBook}
            onOpenChange={(open) => !open && setSelectedBook(null)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMoveToLibrary={handleMoveToLibrary}
            isDeleting={deleteMutation.isPending}
            isMoving={moveToLibraryMutation.isPending}
            showMoveToLibrary={true}
          />
        )}
      </div>
    </div>
  );
}
