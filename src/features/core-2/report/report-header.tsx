/** §2 — heading. Sem ação de reanálise: diferente do Core 1, cada vaga é uma análise própria. */
export function ReportHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Relatório de Aderência à Vaga</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Análise da correspondência entre seu perfil e os requisitos desta vaga.
      </p>
    </div>
  );
}
