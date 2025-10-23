import { Book } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookCardProps {
  book: Book;
  onClick: () => void;
}

const statusConfig = {
  por_leer: { label: "Por Leer", variant: "default" as const, color: "bg-chart-3" },
  leyendo: { label: "Leyendo", variant: "secondary" as const, color: "bg-chart-2" },
  terminado: { label: "Terminado", variant: "outline" as const, color: "bg-chart-1" },
};

export function BookCard({ book, onClick }: BookCardProps) {
  const statusInfo = statusConfig[book.status as keyof typeof statusConfig] ?? statusConfig.por_leer;

  return (
    <Card
      className="hover-elevate cursor-pointer overflow-hidden transition-all duration-200"
      onClick={onClick}
      data-testid={`card-book-${book.id}`}
    >
      <CardHeader className="p-0">
        <div className="aspect-[2/3] relative bg-muted overflow-hidden">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/30">
              <BookOpen className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={statusInfo.color} variant={statusInfo.variant}>
              {statusInfo.label}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-serif font-semibold text-base line-clamp-2 leading-tight">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
        {book.genre && (
          <Badge variant="outline" className="text-xs">
            {book.genre}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2">
        {book.rating && book.status === "terminado" && (
          <div className="flex items-center gap-1" data-testid={`rating-${book.id}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < (book.rating || 0)
                    ? "fill-chart-2 text-chart-2"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        )}
        {book.pages && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <span>{book.pages} pág.</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
