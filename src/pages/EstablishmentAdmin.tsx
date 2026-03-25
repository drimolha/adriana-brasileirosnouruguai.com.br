import { useState, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { usePlaces } from '@/context/PlacesContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Zap, Eye, MousePointerClick, Star, Download, FileText, LogOut, Store } from 'lucide-react'
import { toast } from 'sonner'
import { Review } from '@/components/PrivateReviews'

export default function EstablishmentAdmin() {
  const { currentUser, loginEstablishment, logout } = useAuth()
  const { places, createFlashOffer } = usePlaces()

  const [selectedPlace, setSelectedPlace] = useState('')
  const [password, setPassword] = useState('')

  const [percentage, setPercentage] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('24h')

  const reviews: Review[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('@uruguai:reviews') || '[]')
    } catch {
      return []
    }
  }, [])

  if (currentUser?.role !== 'establishment') {
    return (
      <div className="flex h-full min-h-[80vh] flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary shadow-inner">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Acesso Empresa</h1>
            <p className="text-slate-500 text-sm mt-2">
              Gerencie seu estabelecimento, crie ofertas e veja métricas.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedPlace) return toast.error('Selecione seu estabelecimento.')
              if (!password) return toast.error('Digite a senha.')
              loginEstablishment(selectedPlace, password)
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label>Selecione seu Estabelecimento</Label>
              <Select value={selectedPlace} onValueChange={setSelectedPlace}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Buscar local..." />
                </SelectTrigger>
                <SelectContent>
                  {places.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Senha de Acesso</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha de administrador"
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 text-base font-bold rounded-xl mt-2">
              Acessar Painel
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const myPlace = places.find((p) => p.id === currentUser.managedPlaceId)
  if (!myPlace) return <div className="p-8 text-center">Local não encontrado</div>

  const myReviews = reviews.filter((r) => r.placeId === myPlace.id)

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault()
    let hours = 24
    if (duration === '6h') hours = 6
    if (duration === '48h') hours = 48
    if (duration === '7 dias') hours = 7 * 24

    const offer = {
      percentage,
      description,
      durationLabel: duration,
      expiresAt: Date.now() + hours * 60 * 60 * 1000,
    }
    createFlashOffer(myPlace.id, offer)

    const title = `Oferta Relâmpago ⚡`
    const body = `Oferta Relâmpago: ${percentage}% de desconto no ${myPlace.name} para usar em ${duration}.`

    toast.message(title, {
      description: body,
      duration: 10000,
      style: { backgroundColor: '#ef4444', color: 'white', borderColor: '#dc2626' },
    })

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' })
    }

    setPercentage('')
    setDescription('')
    toast.success('Cupom Relâmpago criado com sucesso!', {
      description: 'Uma notificação foi enviada aos usuários.',
    })
  }

  const exportExcel = () => {
    let csv = 'Estabelecimento,Visualizacoes,Cliques\n'
    csv += `"${myPlace.name}",${myPlace.accessCount || 0},${myPlace.couponClickCount || 0}\n\n`
    csv += 'Data,Usuario,Nota,Comentario\n'
    myReviews.forEach((r) => {
      const cleanComment = r.comment ? r.comment.replace(/"/g, '""') : ''
      csv += `"${new Date(r.date).toLocaleDateString()}","${r.userEmail}",${r.rating},"${cleanComment}"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `relatorio_${myPlace.name.replace(/\s+/g, '_')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Relatório CSV/Excel gerado!')
  }

  const exportPDF = () => {
    window.print()
    toast.success('Preparando PDF para impressão...')
  }

  const clearFlashOffer = () => {
    createFlashOffer(myPlace.id, undefined)
    toast.success('Oferta Relâmpago removida e indisponível para novos usuários.')
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-100 shadow-sm">
            <img
              src={myPlace.coverImage}
              alt={myPlace.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">{myPlace.name}</h1>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              Painel do Estabelecimento
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="gap-2 rounded-xl h-10 w-full sm:w-auto"
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button variant="outline" onClick={exportPDF} className="gap-2 rounded-xl">
          <FileText className="h-4 w-4" /> Exportar Relatório (PDF)
        </Button>
        <Button onClick={exportExcel} className="gap-2 rounded-xl">
          <Download className="h-4 w-4" /> Baixar Dados de Avaliações (Excel)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm border-slate-100 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Visualizações no App
              </p>
              <p className="text-2xl font-black text-slate-900">{myPlace.accessCount || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-slate-100 rounded-2xl">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <MousePointerClick className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Cliques e Check-ins
              </p>
              <p className="text-2xl font-black text-slate-900">{myPlace.couponClickCount || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <Card className="shadow-sm border-slate-100 bg-red-50/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-red-100/50 bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-600 text-lg">
              <Zap className="h-5 w-5 fill-current" /> Criar Cupom Relâmpago
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {myPlace.flashOffer && myPlace.flashOffer.expiresAt > Date.now() ? (
              <div className="p-5 rounded-xl bg-white border border-red-200 shadow-sm text-center space-y-3">
                <div className="inline-block px-3 py-1 bg-red-100 text-red-600 text-xs font-bold uppercase tracking-widest rounded-full mb-1">
                  Oferta Ativa
                </div>
                <p className="font-black text-3xl text-red-600">
                  {myPlace.flashOffer.percentage}% OFF
                </p>
                <p className="text-sm text-slate-600 font-medium pb-2 border-b border-slate-100">
                  {myPlace.flashOffer.description}
                </p>
                <Button
                  variant="destructive"
                  onClick={clearFlashOffer}
                  className="w-full h-11 font-bold rounded-xl mt-2"
                >
                  Encerrar Oferta
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreateOffer} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Desconto (%)</Label>
                    <Input
                      required
                      placeholder="Ex: 50"
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      className="bg-white h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Duração</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-white h-11 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6h">6 horas</SelectItem>
                        <SelectItem value="24h">24 horas</SelectItem>
                        <SelectItem value="48h">48 horas</SelectItem>
                        <SelectItem value="7 dias">7 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Descrição / Regras</Label>
                  <Textarea
                    required
                    placeholder="Válido apenas para consumo no local..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-white rounded-xl resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-xl mt-2 shadow-md hover:shadow-lg transition-all"
                >
                  <Zap className="h-4 w-4 mr-2 fill-current" /> Ativar Oferta e Notificar Usuários
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 rounded-2xl flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg">Avaliações Privadas ({myReviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex-1 overflow-y-auto max-h-[420px] pr-2 custom-scrollbar">
            {myReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Star className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium text-sm">
                  Nenhuma avaliação recebida ainda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myReviews.map((r) => (
                  <div key={r.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-sm text-slate-800 leading-tight">
                        {r.userEmail}
                      </span>
                      <span className="flex text-brand-yellow font-bold text-xs items-center bg-brand-yellow/10 px-2 py-0.5 rounded-full shrink-0">
                        <Star className="h-3 w-3 fill-current mr-1" /> {r.rating}.0
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                      {r.comment || (
                        <em className="text-slate-400 font-normal">Sem comentário em texto</em>
                      )}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 pt-2 border-t border-slate-200/60">
                      {new Date(r.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
