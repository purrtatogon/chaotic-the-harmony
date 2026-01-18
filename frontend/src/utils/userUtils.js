/**
 * Generates a ui-avatars.com URL for a given name.
 * 
 * @param {string} name - The user's full name.
 * @returns {string} The avatar URL.
 */
export const getAvatarUrl = (name) => {
  if (!name) return 'https://ui-avatars.com/api/?name=User&background=random&color=fff';
  
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
};
