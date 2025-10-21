import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  genreFilter: string;
  onGenreFilterChange: (value: string) => void;
  genres: string[];
}

export function Filters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  genreFilter,
  onGenreFilterChange,
  genres,
}: FiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título o autor..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          data-testid="input-search"
        />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
          <SelectValue placeholder="Todos los estados" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="por_leer">Por Leer</SelectItem>
          <SelectItem value="leyendo">Leyendo</SelectItem>
          <SelectItem value="terminado">Terminado</SelectItem>
        </SelectContent>
      </Select>
      {genres.length > 0 && (
        <Select value={genreFilter} onValueChange={onGenreFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-genre-filter">
            <SelectValue placeholder="Todos los géneros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los géneros</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre} value={genre}>
                {genre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
