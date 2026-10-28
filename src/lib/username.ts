/** Private, admin-provisioned Supabase Auth accounts. No public sign-up. */
export const PLAYER_NAMES = ['lucas', 'luiz', 'guilherme', 'julio'] as const;
export type PlayerName = typeof PLAYER_NAMES[number];

/** Reserved example.com domain: no outbound email delivery or self-service reset. */
export function playerInternalEmail(username: string): string {
  const normalized = username.trim().toLowerCase();
  if (!PLAYER_NAMES.some((name) => name === normalized)) {
    throw new Error('Usuário não cadastrado. Confira o nome informado.');
  }
  return `${normalized}.combolab@example.com`;
}

export function displayPlayerName(email?: string): string {
  return email?.split('.')[0]?.toUpperCase() || 'PLAYER';
}
