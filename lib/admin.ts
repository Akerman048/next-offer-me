export function isAdminEmail(email: string | null | undefined) {
  const adminEmail = process.env.ADMIN_EMAIL;

  return Boolean(email && adminEmail && email === adminEmail);
}
