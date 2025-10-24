import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { BookOpen, Calendar, FileText, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ReadingHistoryProps {
  year: number;
}

export function ReadingHistory({ year }: ReadingHistoryProps) {
  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["/api/books/finished", year],
    queryFn: async () => {
      const response = await fetch(`/api/books/finished/${year}`);
      if (!response.ok) {
        throw new Error("Failed to fetch books");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-20 w-14 flex-shrink-0 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12 text-muted-foreground" />}
        title={`Sin libros terminados en ${year}`}
        description="No has registrado ningún libro terminado en este año."
      />
    );
  }

  const totalPages = books.reduce((sum, book) => sum + (book.pages || 0), 0);
  const averageRating = books.filter(b => b.rating).length > 0
    ? books.reduce((sum, book) => sum + (book.rating || 0), 0) / books.filter(b => b.rating).length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif">Libros Terminados en {year}</CardTitle>
        <CardDescription>
          {books.length} {books.length === 1 ? 'libro' : 'libros'} • {totalPages.toLocaleString()} páginas
          {averageRating > 0 && ` • Promedio: ${averageRating.toFixed(1)}★`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="flex gap-4 p-3 rounded-lg hover-elevate"
              data-testid={`book-history-${book.id}`}
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="h-20 w-14 object-cover rounded flex-shrink-0"
                />
              ) : (
                <div className="h-20 w-14 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-serif font-semibold line-clamp-2" data-testid="text-book-title">
                  {book.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-1" data-testid="text-book-author">
                  {book.author}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {book.finishDate && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(book.finishDate).toLocaleDateString("es", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                  {book.pages && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      {book.pages} págs
                    </div>
                  )}
                  {book.rating && (
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-primary text-primary" />
                      {book.rating}/5
                    </div>
                  )}
                  {book.genre && (
                    <Badge variant="secondary" className="text-xs">
                      {book.genre}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
