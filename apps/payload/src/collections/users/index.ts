import type { CollectionConfig } from 'payload'

import { usersAccess } from './access'

export const Users: CollectionConfig = {
  access: usersAccess,
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      defaultValue: ['editor'],
      hasMany: true,
      name: 'roles',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      required: true,
      saveToJWT: true,
      type: 'select',
    },
  ],
  slug: 'users',
}
