/** Public site settings. Leave a value empty to hide the related link. */
export const site = {
  name: 'HireSmart AI',
  url: typeof window !== 'undefined' ? window.location.origin : '',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL ?? '',
  githubUrl: import.meta.env.VITE_GITHUB_URL ?? '',
};
