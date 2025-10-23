import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertBookSchema, type InsertBook, type Book } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { normalizeISBN, validateISBN, getISBNVariants, formatISBN } from "@/lib/utils/isbn";
import { validateImageUrl, getBestQualityImageUrl } from "@/lib/utils/image-validator";
import { Progress } from "@/components/ui/progress";

interface BookFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertBook) => void;
  book?: Book;
  isPending?: boolean;
}

export function BookFormDialog({
  open,
  onOpenChange,
  onSubmit,
  book,
  isPending,
}: BookFormDialogProps) {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState("");

  const form = useForm<InsertBook>({
    resolver: zodResolver(insertBookSchema),
    defaultValues: book
      ? {
          title: book.title,
          author: book.author,
          isbn: book.isbn || "",
          pages: book.pages || undefined,
          coverUrl: book.coverUrl || "",
          genre: book.genre || "",
          language: book.language || "",
          edition: book.edition || "",
          synopsis: book.synopsis || "",
          series: book.series || "",
          seriesNumber: book.seriesNumber || undefined,
          publisher: book.publisher || "",
          publishedDate: book.publishedDate || "",
          status: book.status as "por_leer" | "leyendo" | "terminado",
          rating: book.rating || undefined,
          review: book.review || "",
          startDate: book.startDate || "",
          finishDate: book.finishDate || "",
          isWishlist: book.isWishlist || 0,
        }
      : {
          title: "",
          author: "",
          isbn: "",
          status: "por_leer",
          isWishlist: 0,
        },
  });

  const searchByISBN = async () => {
    const rawIsbn = form.getValues("isbn");
    if (!rawIsbn) {
      toast({
        title: "ISBN requerido",
        description: "Por favor ingresa un ISBN para buscar",
        variant: "destructive",
      });
      return;
    }

    // Normalizar ISBN
    setSearchProgress(5);
    setSearchStatus("Normalizando ISBN...");
    const normalizedIsbn = normalizeISBN(rawIsbn);
    
    // Validar ISBN
    const validation = validateISBN(normalizedIsbn);
    if (!validation.valid) {
      toast({
        title: "ISBN inválido",
        description: validation.error || "El ISBN ingresado no es válido. Verifica el número e intenta nuevamente.",
        variant: "destructive",
      });
      return;
    }

    // Actualizar el campo con el ISBN normalizado
    form.setValue("isbn", formatISBN(normalizedIsbn));
    
    setIsSearching(true);
    setSearchProgress(10);
    
    // Limpiar todos los campos antes de buscar
    form.setValue("title", "");
    form.setValue("author", "");
    form.setValue("pages", undefined);
    form.setValue("coverUrl", "");
    form.setValue("genre", "");
    form.setValue("language", "");
    form.setValue("edition", "");
    form.setValue("synopsis", "");
    form.setValue("series", "");
    form.setValue("seriesNumber", undefined);
    form.setValue("publisher", "");
    form.setValue("publishedDate", "");
    
    try {
      // Paso 1: Verificar cache
      setSearchStatus("Verificando cache...");
      setSearchProgress(15);
      
      const cacheResponse = await fetch(`/api/books/isbn-cache/${normalizedIsbn}`);
      if (cacheResponse.ok) {
        const cachedData = await cacheResponse.json();
        if (cachedData) {
          setSearchProgress(90);
          setSearchStatus("Datos encontrados en cache");
          
          // Cargar datos del cache
          if (cachedData.title) form.setValue("title", cachedData.title);
          if (cachedData.author) form.setValue("author", cachedData.author);
          if (cachedData.pages) form.setValue("pages", cachedData.pages);
          if (cachedData.coverUrl) form.setValue("coverUrl", cachedData.coverUrl);
          if (cachedData.genre) form.setValue("genre", cachedData.genre);
          if (cachedData.language) form.setValue("language", cachedData.language);
          if (cachedData.edition) form.setValue("edition", cachedData.edition);
          if (cachedData.synopsis) form.setValue("synopsis", cachedData.synopsis);
          if (cachedData.series) form.setValue("series", cachedData.series);
          if (cachedData.seriesNumber) form.setValue("seriesNumber", cachedData.seriesNumber);
          if (cachedData.publisher) form.setValue("publisher", cachedData.publisher);
          if (cachedData.publishedDate) form.setValue("publishedDate", cachedData.publishedDate);
          
          setSearchProgress(100);
          toast({
            title: "✅ Libro encontrado (cache)",
            description: `Datos previos de: ${cachedData.sources}`,
            duration: 4000,
          });
          
          setIsSearching(false);
          return;
        }
      }
      
      // Objeto para combinar información de todas las fuentes
      const combinedData: {
        title?: string;
        author?: string;
        pages?: number;
        coverUrl?: string;
        genre?: string;
        language?: string;
        edition?: string;
        synopsis?: string;
        series?: string;
        seriesNumber?: number;
        publisher?: string;
        publishedDate?: string;
        sources: string[];
      } = { sources: [] };

      // Intento 1: Open Library
      setSearchStatus("Consultando Open Library...");
      setSearchProgress(30);
      try {
        const openLibraryResponse = await fetch(
          `https://openlibrary.org/api/books?bibkeys=ISBN:${normalizedIsbn}&format=json&jscmd=data`
        );
        const openLibraryData = await openLibraryResponse.json();
        const bookData = openLibraryData[`ISBN:${normalizedIsbn}`];

        if (bookData) {
          combinedData.sources.push("Open Library");
          if (bookData.title) combinedData.title = bookData.title;
          if (bookData.authors && bookData.authors.length > 0) {
            combinedData.author = bookData.authors.map((a: any) => a.name).join(", ");
          }
          if (bookData.number_of_pages) combinedData.pages = bookData.number_of_pages;
          if (bookData.cover?.large) combinedData.coverUrl = bookData.cover.large;
          if (bookData.subjects && bookData.subjects.length > 0) {
            combinedData.genre = bookData.subjects[0].name;
          }
          if (bookData.publishers && bookData.publishers.length > 0) {
            combinedData.publisher = bookData.publishers[0].name;
          }
          if (bookData.publish_date) combinedData.publishedDate = bookData.publish_date;
        }
      } catch (error) {
        console.log("Open Library no disponible");
      }

      // Intento 2: Google Books API
      setSearchStatus("Consultando Google Books...");
      setSearchProgress(50);
      try {
        const googleBooksResponse = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=isbn:${normalizedIsbn}`
        );
        const googleBooksData = await googleBooksResponse.json();

        if (googleBooksData.totalItems > 0) {
          const volumeInfo = googleBooksData.items[0].volumeInfo;
          combinedData.sources.push("Google Books");
          
          if (!combinedData.title && volumeInfo.title) {
            combinedData.title = volumeInfo.title;
          }
          if (!combinedData.author && volumeInfo.authors && volumeInfo.authors.length > 0) {
            combinedData.author = volumeInfo.authors.join(", ");
          }
          if (!combinedData.pages && volumeInfo.pageCount) {
            combinedData.pages = volumeInfo.pageCount;
          }
          if (!combinedData.coverUrl && volumeInfo.imageLinks?.thumbnail) {
            combinedData.coverUrl = volumeInfo.imageLinks.thumbnail.replace("http:", "https:");
          }
          if (!combinedData.genre && volumeInfo.categories && volumeInfo.categories.length > 0) {
            combinedData.genre = volumeInfo.categories[0];
          }
          if (!combinedData.language && volumeInfo.language) {
            combinedData.language = volumeInfo.language === 'es' ? 'Español' : volumeInfo.language === 'en' ? 'Inglés' : volumeInfo.language;
          }
          if (!combinedData.synopsis && volumeInfo.description) {
            combinedData.synopsis = volumeInfo.description;
          }
          if (!combinedData.publisher && volumeInfo.publisher) {
            combinedData.publisher = volumeInfo.publisher;
          }
          if (!combinedData.publishedDate && volumeInfo.publishedDate) {
            combinedData.publishedDate = volumeInfo.publishedDate;
          }
        }
      } catch (error) {
        console.log("Google Books no disponible");
      }

      // Intento 3: Firecrawl (Amazon scraping)
      setSearchStatus("Consultando Amazon (Firecrawl)...");
      setSearchProgress(70);
      try {
        const firecrawlResponse = await fetch(`/api/books/search-isbn/${normalizedIsbn}`);
        const firecrawlData = await firecrawlResponse.json();

        if (firecrawlResponse.ok && firecrawlData.title) {
          combinedData.sources.push("Amazon (Firecrawl)");
          
          if (!combinedData.title) combinedData.title = firecrawlData.title;
          if (!combinedData.author && firecrawlData.author) {
            combinedData.author = firecrawlData.author;
          }
          if (!combinedData.pages && firecrawlData.pages) {
            combinedData.pages = firecrawlData.pages;
          }
          if (!combinedData.coverUrl && firecrawlData.coverUrl) {
            combinedData.coverUrl = firecrawlData.coverUrl;
          }
          if (!combinedData.genre && firecrawlData.genre) {
            combinedData.genre = firecrawlData.genre;
          }
          if (!combinedData.publisher && firecrawlData.publisher) {
            combinedData.publisher = firecrawlData.publisher;
          }
          if (!combinedData.synopsis && firecrawlData.synopsis) {
            combinedData.synopsis = firecrawlData.synopsis;
          }
        }
      } catch (error) {
        console.log("Firecrawl no disponible");
      }

      // Verificar si encontramos algo
      if (combinedData.sources.length === 0) {
        setSearchProgress(100);
        toast({
          title: "No encontrado",
          description: "No se encontró información para este ISBN en ninguna fuente. Puedes completar los datos manualmente.",
          variant: "destructive",
        });
        return;
      }

      // Validar imagen de portada
      setSearchStatus("Verificando calidad de portada...");
      setSearchProgress(85);
      if (combinedData.coverUrl) {
        const isValidImage = await validateImageUrl(combinedData.coverUrl);
        if (!isValidImage) {
          combinedData.coverUrl = undefined;
        }
      }

      // Cargar los datos combinados en el formulario
      if (combinedData.title) form.setValue("title", combinedData.title);
      if (combinedData.author) form.setValue("author", combinedData.author);
      if (combinedData.pages) form.setValue("pages", combinedData.pages);
      if (combinedData.coverUrl) form.setValue("coverUrl", combinedData.coverUrl);
      if (combinedData.genre) form.setValue("genre", combinedData.genre);
      if (combinedData.language) form.setValue("language", combinedData.language);
      if (combinedData.edition) form.setValue("edition", combinedData.edition);
      if (combinedData.synopsis) form.setValue("synopsis", combinedData.synopsis);
      if (combinedData.series) form.setValue("series", combinedData.series);
      if (combinedData.seriesNumber) form.setValue("seriesNumber", combinedData.seriesNumber);
      if (combinedData.publisher) form.setValue("publisher", combinedData.publisher);
      if (combinedData.publishedDate) form.setValue("publishedDate", combinedData.publishedDate);

      // Guardar en cache
      setSearchStatus("Guardando en cache...");
      setSearchProgress(95);
      try {
        await fetch('/api/books/isbn-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isbn: normalizedIsbn,
            ...combinedData,
            sources: combinedData.sources.join(", "),
          }),
        });
      } catch (error) {
        console.log("No se pudo guardar en cache");
      }

      // Mensaje de éxito con fuentes utilizadas
      setSearchProgress(100);
      setSearchStatus("Completado");
      const hasCover = combinedData.coverUrl && combinedData.coverUrl.trim() !== "";
      const sourcesText = combinedData.sources.join(", ");
      
      if (hasCover) {
        toast({
          title: "✅ Libro encontrado",
          description: `Datos combinados de: ${sourcesText}`,
          duration: 5000,
        });
      } else {
        toast({
          title: "⚠️ Libro encontrado (portada faltante)",
          description: `Datos de: ${sourcesText}. Para la portada: busca el libro en Amazon, clic derecho en la imagen → 'Copiar dirección de imagen' → pégala en 'URL de Portada'`,
          duration: 8000,
        });
      }
    } catch (error) {
      setSearchProgress(100);
      toast({
        title: "Error",
        description: "No se pudo buscar el libro. Verifica el ISBN",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
      setTimeout(() => {
        setSearchProgress(0);
        setSearchStatus("");
      }, 2000);
    }
  };

  const handleSubmit = (data: InsertBook) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {book ? "Editar Libro" : "Agregar Libro"}
          </DialogTitle>
          <DialogDescription>
            {book
              ? "Modifica la información del libro"
              : "Ingresa el ISBN para buscar automáticamente o completa manualmente"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isbn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ISBN (Opcional)</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="978-3-16-148410-0"
                          {...field}
                          data-testid="input-isbn"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={searchByISBN}
                        disabled={isSearching}
                        data-testid="button-search-isbn"
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4" />
                        )}
                        <span className="ml-2">Buscar</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSearching && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{searchStatus || "Buscando..."}</span>
                  </div>
                  <Progress value={searchProgress} className="h-2" data-testid="progress-search" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="El nombre del viento"
                          {...field}
                          data-testid="input-title"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Autor *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Patrick Rothfuss"
                          {...field}
                          data-testid="input-author"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="pages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Páginas</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="662"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                          value={field.value || ""}
                          data-testid="input-pages"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Género</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Fantasía"
                          {...field}
                          data-testid="input-genre"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        data-testid="select-status"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="por_leer">Por Leer</SelectItem>
                          <SelectItem value="leyendo">Leyendo</SelectItem>
                          <SelectItem value="terminado">Terminado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de Portada</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        {...field}
                        data-testid="input-cover-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Español"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-language"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="edition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Edición</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Primera edición"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-edition"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Editorial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Editorial Planeta"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-publisher"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publishedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Publicación</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="2024"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-published-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="series"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serie</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Crónica del Asesino de Reyes"
                          {...field}
                          value={field.value || ""}
                          data-testid="input-series"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seriesNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número en la Serie</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value ? parseInt(e.target.value) : undefined)
                          }
                          value={field.value || ""}
                          data-testid="input-series-number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="synopsis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sinopsis</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Resumen del libro..."
                        className="resize-none min-h-24"
                        {...field}
                        value={field.value || ""}
                        data-testid="textarea-synopsis"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("status") === "leyendo" && (
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Inicio</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid="input-start-date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {form.watch("status") === "terminado" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Inicio</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-start-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="finishDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Finalización</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              data-testid="input-finish-date"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calificación (1-5 estrellas)</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                          data-testid="select-rating"
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona calificación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">⭐ 1 estrella</SelectItem>
                            <SelectItem value="2">⭐⭐ 2 estrellas</SelectItem>
                            <SelectItem value="3">⭐⭐⭐ 3 estrellas</SelectItem>
                            <SelectItem value="4">⭐⭐⭐⭐ 4 estrellas</SelectItem>
                            <SelectItem value="5">⭐⭐⭐⭐⭐ 5 estrellas</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="review"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reseña Personal</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="¿Qué te pareció este libro?"
                            className="resize-none min-h-24"
                            {...field}
                            data-testid="textarea-review"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            {!book && (
              <FormField
                control={form.control}
                name="isWishlist"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value === 1}
                        onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                        data-testid="checkbox-wishlist"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Añadir a Lista de Deseos
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Este libro se guardará en tu lista de deseos en lugar de tu biblioteca
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="button-submit-book">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : book ? (
                  "Actualizar"
                ) : (
                  "Agregar Libro"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
