/**
 * Lista fixa de e-mails com acesso ao painel administrativo (/app/admin/*).
 * Não há role de admin no banco ainda — para um único operador, um allowlist
 * em código é suficiente e evita depender de uma migration + env var extra
 * em produção. Promover para uma coluna/tabela de role só quando houver mais
 * de um admin.
 */
const ADMIN_EMAILS = ["cjaniel@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
