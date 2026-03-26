import { useAuth } from '@/context/AuthContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserCircle, Mail, Phone, MapPin, CalendarDays, LogOut } from 'lucide-react'

export default function UserProfile() {
  const { currentUser, logout } = useAuth()

  if (!currentUser) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 animate-in fade-in duration-500 flex-1">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900 flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" /> Meu Perfil
          </h1>
          <p className="text-slate-500 mt-2">Visualize seus dados de cadastro.</p>
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
        >
          <LogOut className="h-4 w-4 mr-2" /> Sair
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
          <CardTitle className="text-xl text-slate-800">Informações Pessoais</CardTitle>
          <CardDescription>Estes são os dados informados durante o seu cadastro.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-500 flex items-center gap-2">
                <UserCircle className="h-4 w-4" /> Nome Completo
              </Label>
              <Input
                readOnly
                value={currentUser.name || 'Não informado'}
                className="bg-slate-50 border-slate-200 font-medium h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 flex items-center gap-2">
                <Mail className="h-4 w-4" /> E-mail
              </Label>
              <Input
                readOnly
                value={currentUser.email}
                className="bg-slate-50 border-slate-200 font-medium h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> CPF
              </Label>
              <Input
                readOnly
                value={currentUser.cpf || 'Não informado'}
                className="bg-slate-50 border-slate-200 font-medium h-11"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Telefone
              </Label>
              <Input
                readOnly
                value={currentUser.phone || 'Não informado'}
                className="bg-slate-50 border-slate-200 font-medium h-11"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-slate-500 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Período da Viagem
              </Label>
              <Input
                readOnly
                value={currentUser.travelPeriod || 'Não informado'}
                className="bg-slate-50 border-slate-200 font-medium h-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
