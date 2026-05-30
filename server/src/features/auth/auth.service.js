import { getUserByUsername } from './users.dao.js';
import { verifyPassword } from './password.js';

export function mapSessionUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    name: user.name,
  };
}

export async function verifyCredentials(username, password) {
  const user = await getUserByUsername(username);
  if (!user) return null;

  const passwordMatches = await verifyPassword(password, user.salt, user.password_hash);
  if (!passwordMatches) return null;

  return user;
}
