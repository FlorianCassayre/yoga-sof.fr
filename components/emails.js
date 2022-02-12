export const EMAIL_TYPES = Object.fromEntries([
  {
    id: 'SESSION_CANCELED',
    title: 'Annulation de séance',
  },
  {
    id: 'OTHER',
    title: 'Autre',
  },
].map(obj => [obj.id, obj]));
