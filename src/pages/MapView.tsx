import { MapPin, Filter, Navigation, Plus, Minus } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { usePlaces } from '@/context/PlacesContext'
import { useGeo } from '@/context/GeoContext'
import { useAccess } from '@/context/AccessContext'
import { Link } from 'react-router-dom'
import { isPlaceOpen, cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

const TILE_SIZE = 256

function latLngToPx(lat: number, lng: number, z: number) {
  const latRad = (lat * Math.PI) / 180
  const n = Math.pow(2, z)
  const x = ((lng + 180) / 360) * n * TILE_SIZE
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * TILE_SIZE
  return { x, y }
}

function pxToLatLng(x: number, y: number, z: number) {
  const n = Math.pow(2, z)
  const lng = (x / (TILE_SIZE * n)) * 360 - 180
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / (TILE_SIZE * n))))
  const lat = (latRad * 180) / Math.PI
  return { lat, lng }
}

export default function MapView() {
  const { places, categories } = usePlaces()
  const { location } = useGeo()
  const { getPlaceStatus } = useAccess()
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null)

  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [openNow, setOpenNow] = useState(false)

  const [centerLat, setCenterLat] = useState(-34.91)
  const [centerLng, setCenterLng] = useState(-56.151)
  const [zoom, setZoom] = useState(14)

  const activePointers = useRef(new Map<number, { x: number; y: number }>())

  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      if (p.type === 'tour' || p.category.toLowerCase() === 'passeios') return false
      if (categoryFilter !== 'Todas' && p.category !== categoryFilter) return false
      if (openNow && !isPlaceOpen(p.operatingHours)) return false
      return true
    })
  }, [places, categoryFilter, openNow])

  const mapZoom = Math.floor(zoom)
  const scale = Math.pow(2, zoom - mapZoom)

  const centerPx = latLngToPx(centerLat, centerLng, mapZoom)

  const [dims, setDims] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 800,
    h: typeof window !== 'undefined' ? window.innerHeight : 600,
  })

  useEffect(() => {
    const onResize = () => setDims({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const screenLeftPx = centerPx.x - dims.w / 2 / scale
  const screenTopPx = centerPx.y - dims.h / 2 / scale

  const startCol = Math.floor(screenLeftPx / TILE_SIZE)
  const startRow = Math.floor(screenTopPx / TILE_SIZE)
  const endCol = Math.floor((screenLeftPx + dims.w / scale) / TILE_SIZE)
  const endRow = Math.floor((screenTopPx + dims.h / scale) / TILE_SIZE)

  const tiles = []
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      tiles.push({
        url: `https://tile.openstreetmap.org/${mapZoom}/${col}/${row}.png`,
        left: col * TILE_SIZE - screenLeftPx,
        top: row * TILE_SIZE - screenTopPx,
        key: `${mapZoom}-${col}-${row}`,
      })
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest('.no-drag')) return
    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointers.current.has(e.pointerId)) return

    const oldPos = activePointers.current.get(e.pointerId)!
    const oldPointers = Array.from(activePointers.current.values())

    activePointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const newPointers = Array.from(activePointers.current.values())

    if (activePointers.current.size === 1) {
      const dx = e.clientX - oldPos.x
      const dy = e.clientY - oldPos.y

      const newCenterX = centerPx.x - dx / scale
      const newCenterY = centerPx.y - dy / scale

      const newCenter = pxToLatLng(newCenterX, newCenterY, mapZoom)
      setCenterLng(newCenter.lng)
      setCenterLat(newCenter.lat)
    } else if (activePointers.current.size === 2) {
      const prevDist = Math.hypot(
        oldPointers[0].x - oldPointers[1].x,
        oldPointers[0].y - oldPointers[1].y,
      )
      const newDist = Math.hypot(
        newPointers[0].x - newPointers[1].x,
        newPointers[0].y - newPointers[1].y,
      )
      if (prevDist > 0 && newDist > 0) {
        setZoom((prev) => Math.max(2, Math.min(prev + Math.log2(newDist / prevDist), 19)))
      }
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointers.current.delete(e.pointerId)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if ((e.target as Element).closest('.no-drag')) return
    setZoom((prev) => Math.max(2, Math.min(prev + (e.deltaY > 0 ? -0.5 : 0.5), 19)))
  }

  return (
    <div
      className="animate-fade-in relative flex-1 w-full min-h-[calc(100vh-140px)] overflow-hidden bg-[#eef0f2] touch-none cursor-grab active:cursor-grabbing"
      onClick={() => setSelectedPlace(null)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute inset-0 origin-top-left will-change-transform"
        style={{ transform: `scale(${scale})` }}
      >
        {tiles.map((t) => (
          <img
            key={t.key}
            src={t.url}
            className="absolute pointer-events-none select-none"
            style={{ left: t.left, top: t.top, width: TILE_SIZE, height: TILE_SIZE }}
            alt=""
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>

      <div className="no-drag absolute left-1/2 top-4 z-40 flex w-[90%] max-w-sm -translate-x-1/2 flex-row gap-2 rounded-xl border border-white/50 bg-white/95 p-2 shadow-lg backdrop-blur-md items-center justify-between cursor-auto">
        <div className="w-[140px] sm:w-[180px]">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 bg-white text-xs">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <SelectValue placeholder="Categoria" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todas">Todas as Categorias</SelectItem>
              {categories
                .filter((c) => c.toLowerCase() !== 'passeios')
                .map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex h-8 items-center gap-2 rounded-lg bg-white px-3 border border-slate-100">
          <Label
            htmlFor="map-open-now"
            className="cursor-pointer whitespace-nowrap text-[11px] font-bold text-slate-700"
          >
            Aberto
          </Label>
          <Switch
            id="map-open-now"
            className="scale-75 origin-right"
            checked={openNow}
            onCheckedChange={setOpenNow}
          />
        </div>
      </div>

      <div className="no-drag absolute right-4 bottom-24 z-40 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(z + 1, 19))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(2, z - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {filteredPlaces.map((place) => {
          const markerPx = latLngToPx(place.coordinates.lat, place.coordinates.lng, mapZoom)
          const left = (markerPx.x - screenLeftPx) * scale
          const top = (markerPx.y - screenTopPx) * scale

          if (left < -50 || left > dims.w + 50 || top < -50 || top > dims.h + 50) return null

          const status = getPlaceStatus(place.id)
          let markerColor = 'bg-[#003399] border-[#002266] text-white'
          let iconColor = 'fill-white/20 text-white'

          if (status === 'active') {
            markerColor = 'bg-[#FFD700] border-[#E6C200] text-black'
            iconColor = 'fill-black/20 text-black'
          } else if (status === 'expired') {
            markerColor = 'bg-slate-400 border-slate-500 text-white'
            iconColor = 'fill-white/20 text-white'
          }

          return (
            <div
              key={place.id}
              className={cn(
                'absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-all',
                selectedPlace === place.id ? 'z-50' : 'z-20',
              )}
              style={{ top, left }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPlace(place.id)}
                className={cn(
                  'no-drag flex h-10 w-10 items-center justify-center rounded-full border-2 shadow-lg transition-transform duration-200',
                  selectedPlace === place.id
                    ? 'scale-125 ring-4 ring-primary/30'
                    : 'hover:scale-110',
                  markerColor,
                )}
              >
                <MapPin className={cn('h-5 w-5', iconColor)} />
              </button>

              {selectedPlace !== place.id && (
                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-slate-800 shadow-sm border border-slate-200 pointer-events-none transition-opacity">
                  {place.name}
                </div>
              )}

              {selectedPlace === place.id && (
                <div className="no-drag animate-in fade-in slide-in-from-bottom-2 absolute bottom-full left-1/2 mb-3 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-2xl cursor-auto">
                  <div className="p-3 text-center">
                    <h3 className="mb-1 truncate font-bold leading-tight text-slate-900">
                      {place.name}
                    </h3>
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {place.category}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {isPlaceOpen(place.operatingHours) ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                    <Link
                      to={`/place/${place.id}`}
                      className="flex w-full items-center justify-center rounded-lg bg-secondary py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/90"
                    >
                      Ver Detalhes
                    </Link>
                  </div>
                  <div className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-[6px] border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          )
        })}

        {location && (
          <div
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500"
            style={{
              left: (latLngToPx(location.lat, location.lng, mapZoom).x - screenLeftPx) * scale,
              top: (latLngToPx(location.lat, location.lng, mapZoom).y - screenTopPx) * scale,
            }}
          >
            <div className="relative flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center">
                <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-blue-500 shadow-md">
                  <Navigation className="h-3 w-3 rotate-45 fill-white text-white" />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
