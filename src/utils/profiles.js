// graphene sends JSONField as a JSON string.
export const suggestedRoleIds = (profile) => {
  let ids = profile?.suggestedRoleIds ?? [];
  if (typeof ids === 'string') {
    try { ids = JSON.parse(ids); } catch (e) { ids = []; }
  }
  return Array.isArray(ids) ? ids.map(Number).filter(Number.isInteger) : [];
};

export const titleLabel = (profile) => (profile?.code ? `${profile.name} (${profile.code})` : profile?.name);
