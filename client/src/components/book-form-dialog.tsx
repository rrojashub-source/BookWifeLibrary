import { useState } from "react";
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
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    const isbn = form.getValues("isbn");
    if (!isbn) {
      toast({
        title: "ISBN requerido",
        description: "Por favor ingresa un ISBN para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      // Intento 1: Open Library
      const openLibraryResponse = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );
      const openLibraryData = await openLibraryResponse.json();
      const bookData = openLibraryData[`ISBN:${isbn}`];

      if (bookData) {
        form.setValue("title", bookData.title || "");
        if (bookData.authors && bookData.authors.length > 0) {
          form.setValue("author", bookData.authors[0].name || "");
        }
        if (bookData.number_of_pages) {
          form.setValue("pages", bookData.number_of_pages);
        }
        if (bookData.cover && bookData.cover.large) {
          form.setValue("coverUrl", bookData.cover.large);
        }
        if (bookData.subjects && bookData.subjects.length > 0) {
          form.setValue("genre", bookData.subjects[0].name || "");
        }

        toast({
          title: "Libro encontrado",
          description: "Datos cargados desde Open Library",
        });
        return;
      }

      // Intento 2: Google Books API
      const googleBooksResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
      );
      const googleBooksData = await googleBooksResponse.json();

      if (googleBooksData.totalItems > 0) {
        const volumeInfo = googleBooksData.items[0].volumeInfo;
        
        form.setValue("title", volumeInfo.title || "");
        if (volumeInfo.authors && volumeInfo.authors.length > 0) {
          form.setValue("author", volumeInfo.authors.join(", "));
        }
        if (volumeInfo.pageCount) {
          form.setValue("pages", volumeInfo.pageCount);
        }
        if (volumeInfo.imageLinks?.thumbnail) {
          form.setValue("coverUrl", volumeInfo.imageLinks.thumbnail.replace("http:", "https:"));
        }
        if (volumeInfo.categories && volumeInfo.categories.length > 0) {
          form.setValue("genre", volumeInfo.categories[0]);
        }

        toast({
          title: "Libro encontrado",
          description: "Datos cargados desde Google Books",
        });
        return;
      }

      // Intento 3: Firecrawl (Amazon scraping)
      const firecrawlResponse = await fetch(`/api/books/search-isbn/${isbn}`);
      const firecrawlData = await firecrawlResponse.json();

      if (firecrawlResponse.ok && firecrawlData.title) {
        form.setValue("title", firecrawlData.title || "");
        if (firecrawlData.author) {
          form.setValue("author", firecrawlData.author);
        }
        if (firecrawlData.pages) {
          form.setValue("pages", firecrawlData.pages);
        }
        if (firecrawlData.coverUrl) {
          form.setValue("coverUrl", firecrawlData.coverUrl);
        }
        if (firecrawlData.genre) {
          form.setValue("genre", firecrawlData.genre);
        }

        toast({
          title: "Libro encontrado",
          description: "Datos cargados desde Amazon (Firecrawl)",
        });
        return;
      }

      // No se encontró en ninguna API
      toast({
        title: "No encontrado",
        description: "No se encontró información para este ISBN en ninguna fuente. Puedes completar los datos manualmente.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo buscar el libro. Verifica el ISBN",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
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
