import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Star, BookMarked, Heart, TrendingUp, User } from "lucide-react";

interface GenreRecommendation {
  genre: string;
  count: number;
  avgRating: number;
}

interface AuthorRecommendation {
  author: string;
  count: number;
  avgRating: number;
}

interface Book {
  id: string;
  title: string;
  author: string;
  genre?: string;
  coverUrl?: string;
  pages?: number;
}

interface Recommendations {
  topGenres: GenreRecommendation[];
  topAuthors: AuthorRecommendation[];
  wishlistSuggestions: Book[];
  otherWishlistBooks: Book[];
  hasFinishedBooks: boolean;
  hasRatedBooks: boolean;
  hasWishlist: boolean;
}

export default function RecommendationsPage() {
  const { data: recommendations, isLoading } = useQuery<Recommendations>({
    queryKey: ["/api/recommendations"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando recomendaciones...</p>
        </div>
      </div>
    );
  }

  if (!recommendations) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se pudieron cargar las recomendaciones</p>
        </div>
      </div>
    );
  }

  const { topGenres, topAuthors, wishlistSuggestions, otherWishlistBooks, hasFinishedBooks, hasRatedBooks } = recommendations;

  // Show empty state if no finished books
  if (!hasFinishedBooks) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-recommendations">
              <Lightbulb className="h-8 w-8 text-primary" />
              Recomendaciones
            </h1>
            <p className="text-muted-foreground mt-2">
              Sugerencias personalizadas basadas en tus lecturas
            </p>
          </div>
        </div>

        <Card className="border-dashed" data-testid="card-empty-state">
          <CardContent className="py-12 text-center">
            <BookMarked className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aún no hay datos suficientes</h3>
            <p className="text-muted-foreground mb-4">
              Termina y califica algunos libros para recibir recomendaciones personalizadas
            </p>
            <p className="text-sm text-muted-foreground">
              Las recomendaciones se generan analizando tus géneros favoritos, autores mejor calificados y preferencias de lectura.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="heading-recommendations">
            <Lightbulb className="h-8 w-8 text-primary" />
            Recomendaciones
          </h1>
          <p className="text-muted-foreground mt-2">
            Sugerencias personalizadas basadas en tus lecturas
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Top Genres Section */}
        {topGenres.length > 0 && (
          <div data-testid="section-genres">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                Tus Géneros Favoritos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Los géneros que más disfrutas según tus lecturas y calificaciones
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {topGenres.map((genreData, index) => (
                <Card key={index} data-testid={`card-genre-${index}`} className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{genreData.genre}</span>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {genreData.avgRating.toFixed(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {genreData.count} {genreData.count === 1 ? "libro leído" : "libros leídos"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Top Authors Section */}
        {topAuthors.length > 0 && (
          <div data-testid="section-authors">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Autores Recomendados
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Autores que has disfrutado y podrías explorar más
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topAuthors.map((authorData, index) => (
                <Card key={index} data-testid={`card-author-${index}`} className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base">{authorData.author}</span>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {authorData.avgRating.toFixed(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {authorData.count} {authorData.count === 1 ? "libro" : "libros"} en tu biblioteca
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Busca más obras de este autor en tu librería o lista de deseos
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Wishlist Suggestions Section */}
        {wishlistSuggestions.length > 0 && (
          <div data-testid="section-wishlist-suggestions">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" />
                De tu Lista de Deseos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Libros de tu wishlist que coinciden con tus preferencias
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {wishlistSuggestions.map((book, index) => (
                <Card key={book.id} data-testid={`card-wishlist-suggestion-${index}`} className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {book.genre && (
                        <Badge variant="outline" className="text-xs">
                          {book.genre}
                        </Badge>
                      )}
                      {book.pages && (
                        <Badge variant="outline" className="text-xs">
                          {book.pages} págs
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-primary">
                      ✨ Recomendado por tus preferencias
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Other Wishlist Books */}
        {otherWishlistBooks.length > 0 && (
          <div data-testid="section-other-wishlist">
            <div className="mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <BookMarked className="h-6 w-6 text-primary" />
                Otros de tu Wishlist
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Descubre más libros de tu lista de deseos
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {otherWishlistBooks.map((book, index) => (
                <Card key={book.id} data-testid={`card-other-wishlist-${index}`} className="hover-elevate">
                  <CardHeader>
                    <CardTitle className="text-base line-clamp-2">{book.title}</CardTitle>
                    <CardDescription>{book.author}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {book.genre && (
                        <Badge variant="outline" className="text-xs">
                          {book.genre}
                        </Badge>
                      )}
                      {book.pages && (
                        <Badge variant="outline" className="text-xs">
                          {book.pages} págs
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
              <div>
                <p className="mb-2">
                  <strong>¿Cómo funcionan las recomendaciones?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Analizamos los géneros que más lees y mejor calificas</li>
                  <li>Identificamos tus autores favoritos basados en tus calificaciones</li>
                  <li>Sugerimos libros de tu wishlist que coinciden con tus preferencias</li>
                  <li>Las recomendaciones mejoran mientras más libros termines y califiques</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
