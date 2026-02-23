export default function AdminPage() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-3xl font-bold">Admin / Integrácie</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className="kpi-card">
          <h2 className="text-xl">Bolt Connectors</h2>
          <p className="mt-2 text-slate-300">TODO: Formulár pre BOLT_CLIENT_ID/BOLT_CLIENT_SECRET uložené server-side.</p>
        </section>
        <section className="kpi-card">
          <h2 className="text-xl">Mapovanie polí</h2>
          <p className="mt-2 text-slate-300">TODO: UI mapovania source fields → normalized schema.</p>
        </section>
      </div>
    </main>
  );
}
