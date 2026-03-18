import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Button } from '@/components/ui/button'
import { Upload, Link as LinkIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { cropImageTo4by3 } from '@/lib/imageUtils'
import { toast } from 'sonner'

interface Props {
  coverImage: string
  galleryImages: string[]
  onChangeCover: (val: string) => void
  onChangeGallery: (idx: number, val: string) => void
}

export function AdminImageFields({
  coverImage,
  galleryImages,
  onChangeCover,
  onChangeGallery,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | 'cover' | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Formato inválido', { description: 'Apenas imagens JPG ou PNG são aceitas.' })
      return
    }

    try {
      const dataUrl = await cropImageTo4by3(file)
      if (activeUploadIndex === 'cover') {
        onChangeCover(dataUrl)
      } else if (typeof activeUploadIndex === 'number') {
        onChangeGallery(activeUploadIndex, dataUrl)
      }
      toast.success('Imagem processada e recortada (4:3) com sucesso.')
    } catch (err) {
      toast.error('Erro ao processar imagem')
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
    setActiveUploadIndex(null)
  }

  const triggerUpload = (target: number | 'cover') => {
    setActiveUploadIndex(target)
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6 pt-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png"
        className="hidden"
      />

      <div className="space-y-3">
        <Label className="text-base">Imagem de Capa (4:3)</Label>
        <div className="flex gap-2">
          <Input
            value={coverImage}
            onChange={(e) => onChangeCover(e.target.value)}
            placeholder="URL da Imagem..."
            className="flex-1"
            required
          />
          <Button type="button" variant="outline" onClick={() => triggerUpload('cover')}>
            <Upload className="h-4 w-4 mr-2" /> Upload
          </Button>
        </div>
        {coverImage && (
          <div className="w-48 mt-2">
            <AspectRatio ratio={4 / 3} className="bg-muted rounded-xl overflow-hidden border">
              <img src={coverImage} alt="Capa" className="object-cover w-full h-full" />
            </AspectRatio>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-base">Imagens da Galeria</Label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2 flex flex-col">
              <div className="flex gap-1">
                <Input
                  value={galleryImages[i] || ''}
                  onChange={(e) => onChangeGallery(i, e.target.value)}
                  placeholder={`Img ${i + 1}`}
                  className="text-xs px-2 h-8"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => triggerUpload(i)}
                >
                  <Upload className="h-3 w-3" />
                </Button>
              </div>
              {galleryImages[i] && (
                <AspectRatio ratio={4 / 3} className="bg-muted rounded-xl overflow-hidden border">
                  <img
                    src={galleryImages[i]}
                    alt={`Galeria ${i + 1}`}
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
