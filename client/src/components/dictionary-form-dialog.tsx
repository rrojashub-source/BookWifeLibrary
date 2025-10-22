import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDictionaryEntrySchema, type DictionaryEntry, type InsertDictionaryEntry, type Book } from "@shared/schema";
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DictionaryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: InsertDictionaryEntry) => void;
  entry?: DictionaryEntry;
  books: Book[];
  isPending?: boolean;
}

export function DictionaryFormDialog({
  open,
  onOpenChange,
  onSubmit,
  entry,
  books,
  isPending,
}: DictionaryFormDialogProps) {
  const { toast } = useToast();
  const [searchWord, setSearchWord] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<InsertDictionaryEntry>({
    resolver: zodResolver(insertDictionaryEntrySchema),
    defaultValues: entry
      ? {
          word: entry.word,
          definition: entry.definition,
          bookId: entry.bookId || "",
          notes: entry.notes || "",
        }
      : {
          word: "",
          definition: "",
          bookId: "",
          notes: "",
        },
  });

  // Reset form when entry changes or dialog opens
  useEffect(() => {
    if (open) {
      if (entry) {
        form.reset({
          word: entry.word,
          definition: entry.definition,
          bookId: entry.bookId || "",
          notes: entry.notes || "",
        });
      } else {
        form.reset({
          word: "",
          definition: "",
          bookId: "",
          notes: "",
        });
        setSearchWord("");
      }
    }
  }, [open, entry]);

  const searchDictionaryAPI = async () => {
    if (!searchWord.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una palabra para buscar",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/es/${searchWord.trim()}`
      );

      if (!response.ok) {
        throw new Error("Word not found");
      }

      const data = await response.json();
      const firstMeaning = data[0]?.meanings[0]?.definitions[0]?.definition;

      if (firstMeaning) {
        form.setValue("word", searchWord.trim());
        form.setValue("definition", firstMeaning);
        toast({
          title: "Definición encontrada",
          description: "La definición se agregó automáticamente",
        });
      } else {
        toast({
          title: "No encontrada",
          description: "No se encontró definición para esta palabra",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Palabra no encontrada",
        description: "La palabra no está en el diccionario automático. Agrega tu propia definición abajo. 📝",
      });
      form.setValue("word", searchWord.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (data: InsertDictionaryEntry) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="dialog-title-entry">
            {entry ? "Editar Entrada" : "Nueva Palabra"}
          </DialogTitle>
        </DialogHeader>

        {!entry && (
          <div className="space-y-4 border-b pb-4">
            <div className="space-y-1">
              <Label>Buscar Definición Automática (Opcional)</Label>
              <p className="text-xs text-muted-foreground">
                El vocabulario es limitado. Si no encuentra tu palabra, agrégala manualmente abajo.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Ej: casa, libro, paz..."
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchDictionaryAPI()}
                data-testid="input-search-word"
              />
              <Button
                type="button"
                onClick={searchDictionaryAPI}
                disabled={isSearching}
                data-testid="button-search-api"
              >
                {isSearching ? (
                  "Buscando..."
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="word"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Palabra *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Beatitud" data-testid="input-word" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Definición *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Escribe la definición aquí..."
                      rows={4}
                      data-testid="input-definition"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bookId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Libro de Referencia (Opcional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="select-book">
                        <SelectValue placeholder="Selecciona un libro" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Agrega contexto o reflexiones personales..."
                      rows={3}
                      data-testid="input-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                data-testid="button-submit-entry"
              >
                {isPending ? "Guardando..." : entry ? "Actualizar" : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
