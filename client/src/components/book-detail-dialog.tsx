import { Book } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, Calendar, Edit, Trash2, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookDetailDialogProps {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToLibrary?: () => void;
  isDeleting?: boolean;
  isMoving?: boolean;
  showMoveToLibrary?: boolean;
}

const statusConfig = {
  por_leer: { label: "Por Leer", color: "bg-chart-3" },
  leyendo: { label: "Leyendo", color: "bg-chart-2" },
  terminado: { label: "Terminado", color: "bg-chart-1" },
};

export function BookDetailDialog({
  book,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onMoveToLibrary,
  isDeleting = false,
  isMoving = false,
  showMoveToLibrary = false,
}: BookDetailDialogProps) {
  if (!book) return null;

  const statusInfo = statusConfig[book.status as keyof typeof statusConfig];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{book.title}</DialogTitle>
          <DialogDescription className="sr-only">Detalles del libro</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="aspect-[2/3] relative bg-muted rounded-lg overflow-hidden">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/30">
                  <BookOpen className="h-24 w-24 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2">{book.title}</h2>
              <p className="text-xl text-muted-foreground mb-3">{book.author}</p>
              <div className="flex flex-wrap gap-2">
                <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                {book.genre && <Badge variant="outline">{book.genre}</Badge>}
                {book.pages && <Badge variant="secondary">{book.pages} páginas</Badge>}
              </div>
            </div>

            {book.rating && book.status === "terminado" && (
              <div>
                <h3 className="font-semibold mb-2">Calificación</h3>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < (book.rating || 0)
                          ? "fill-chart-2 text-chart-2"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {book.rating}/5
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {book.isbn && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">ISBN</h3>
                  <p className="font-mono text-sm">{book.isbn}</p>
                </div>
              )}

              {book.startDate && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    Fecha de Inicio
                  </h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="text-sm">
                      {format(new Date(book.startDate), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              )}

              {book.finishDate && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                    Fecha de Finalización
                  </h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <p className="text-sm">
                      {format(new Date(book.finishDate), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                  Agregado a la Colección
                </h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm">
                    {format(new Date(book.dateAdded), "d 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {book.review && (
              <div>
                <h3 className="font-semibold mb-2">Reseña Personal</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {book.review}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t flex-wrap">
              {showMoveToLibrary && onMoveToLibrary && (
                <Button
                  className="flex-1 min-w-[200px]"
                  onClick={onMoveToLibrary}
                  disabled={isMoving}
                  data-testid="button-move-to-library"
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  {isMoving ? "Moviendo..." : "Mover a Biblioteca"}
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={onEdit}
                data-testid="button-edit-book"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={onDelete}
                disabled={isDeleting}
                data-testid="button-delete-book"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
