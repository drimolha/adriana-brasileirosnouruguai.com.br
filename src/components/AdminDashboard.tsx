import { usePlaces } from '@/context/PlacesContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, MousePointerClick, Eye, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function AdminDashboard() {
  const { places } = usePlaces()

  const toursByAccess = [...places]
    .filter((p) => p.type === 'tour')
    .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
    .slice(0, 10)

  const topCoupons = [...places]
    .filter((p) => p.discountBadge)
    .sort((a, b) => (b.couponClickCount || 0) - (a.couponClickCount || 0))
    .slice(0, 10)

  const totalAccesses = places.reduce((sum, p) => sum + (p.accessCount || 0), 0)
  const totalClicks = places.reduce((sum, p) => sum + (p.couponClickCount || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20 shadow-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Total de Visualizações
              </p>
              <p className="text-3xl font-black text-primary">{totalAccesses.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-secondary/5 border-secondary/20 shadow-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
              <MousePointerClick className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                Cliques em Cupons/Reservas
              </p>
              <p className="text-3xl font-black text-secondary">{totalClicks.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-500" /> Passeios Mais Acessados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y">
              {toursByAccess.map((tour, i) => (
                <div
                  key={tour.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-bold w-4">{i + 1}.</span>
                    <div>
                      <p className="font-bold text-sm leading-tight text-foreground">{tour.name}</p>
                      <p className="text-xs text-muted-foreground">{tour.city}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    <Eye className="h-3 w-3 mr-1" /> {tour.accessCount || 0}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-lg flex items-center gap-2">
              <Ticket className="h-5 w-5 text-slate-500" /> Cupons Mais Utilizados (Cliques)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="divide-y">
              {topCoupons.map((place, i) => (
                <div
                  key={place.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-bold w-4">{i + 1}.</span>
                    <div>
                      <p className="font-bold text-sm leading-tight text-foreground">
                        {place.name}
                      </p>
                      <p className="text-xs text-brand-yellow font-bold">{place.discountBadge}</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none font-mono">
                    <MousePointerClick className="h-3 w-3 mr-1" /> {place.couponClickCount || 0}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
