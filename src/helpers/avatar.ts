export function getAvatarUrl(avatarUrl?: string | null) {
  if (!avatarUrl) return '/default-avatar.png';
  if (
    avatarUrl.startsWith('/uploads/') ||
    avatarUrl.startsWith('/storage/')
  ) {
    return `https://blogger-wph-api-production.up.railway.app${avatarUrl}`;
  }
  if (avatarUrl.startsWith('/')) {
    return avatarUrl;
  }
  
  return avatarUrl;
}