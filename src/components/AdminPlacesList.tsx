import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Search, Filter } from 'lucide-react'
import { Place } from '@/data/places'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState, useMemo } from 'react'

interface Props {
  places: Place[]
  categories: string[]
  onEdit: (place: Place) => void
  onDelete: (id: string) => void
}

export function AdminPlacesList({ places, categories, onEdit, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Todas')

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      const matchName = p.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchCat = categoryFilter === 'Todas' || p.category === categoryFilter
      return matchName && matchCat
    })
  }, [places, searchTerm, categoryFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 bg-muted/30 p-4 rounded-xl border border-border/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="bg-background">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas as Categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[120px]">Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlaces.map((place) => (
              <TableRow key={place.id}>
                <TableCell>
                  <div className="w-20">
                    <AspectRatio
                      ratio={4 / 3}
                      className="bg-muted rounded-md overflow-hidden border border-border/50"
                    >
                      <img
                        src={place.coverImage}
                        alt={place.name}
                        className="object-cover w-full h-full"
                      />
                    </AspectRatio>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{place.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-medium bg-background">
                    {place.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{place.city}</TableCell>
                <TableCell>
                  {place.type === 'tour' ? (
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold">
                      Passeio
                    </Badge>
                  ) : (
                    <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none font-bold">
                      Local
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(place)}
                      className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(place.id)}
                      className="h-8 w-8 text-slate-500 hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredPlaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  Nenhum local encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
