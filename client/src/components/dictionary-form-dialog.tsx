import { useEffect } from "react";
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
      }
    }
  }, [open, entry]);

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
