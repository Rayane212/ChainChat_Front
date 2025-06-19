// components/settings/ProfileSettingsZod.tsx
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const profileSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  username: z.string().min(2, 'Nom d’utilisateur requis').max(32),
  bio: z.string().max(160).optional(),
  birthday: z.string().optional(),
  phone: z.string().regex(/^(\+?\d{6,})?$/, 'Numéro invalide').optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileSettings() {
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      username: '',
      bio: '',
      birthday: '',
      phone: ''
    }
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = form

  const onSubmit = (data: ProfileFormData) => {
    console.log('🔁 Soumission backend:', data)
    // TODO : appeler une mutation ici
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Modifier le profil</h1>
        <p className="text-sm text-muted-foreground">Mettez à jour vos informations personnelles</p>
      </div>

      <Separator />

      <div className="grid gap-4">
        <div className="grid gap-1">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" {...register('name')} />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="username">Nom d’utilisateur</Label>
          <Input id="username" {...register('username')} />
          {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" {...register('bio')} />
          {errors.bio && <p className="text-sm text-red-500">{errors.bio.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="birthday">Date d’anniversaire</Label>
          <Input id="birthday" type="date" {...register('birthday')} />
          {errors.birthday && <p className="text-sm text-red-500">{errors.birthday.message}</p>}
        </div>

        <div className="grid gap-1">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" {...register('phone')} placeholder="+33 6 12 34 56 78" />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sauvegarde...' : 'Enregistrer'}
      </Button>
    </form>
  )
}
