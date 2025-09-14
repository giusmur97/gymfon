"use client";

import { useState } from "react";

type Measure = { id: string; date: string; weight?: number; height?: number; waist?: number; bodyFat?: number; muscle?: number; water?: number };

export default function MeasurementsMonitor() {
  const [rows, setRows] = useState<Measure[]>([]);

  const [newRow, setNewRow] = useState<Measure>({ id: "", date: "", weight: undefined, height: undefined, waist: undefined, bodyFat: undefined, muscle: undefined, water: undefined });

  async function addRow() {
    if (!newRow.date) return;
    try {
      const clientId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/clients/${clientId}/measurements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          date: newRow.date,
          weight: newRow.weight,
          height: newRow.height,
          bodyFat: newRow.bodyFat,
          muscleMass: newRow.muscle,
          bodyWater: newRow.water,
          circumferences: newRow.waist ? { waist: newRow.waist } : undefined,
        }),
      });
      if (!res.ok) throw new Error('Errore salvataggio');
      setRows((r) => [...r, { ...newRow, id: String(Date.now()) }]);
      setNewRow({ id: "", date: "", weight: undefined, height: undefined, waist: undefined, bodyFat: undefined, muscle: undefined, water: undefined });
    } catch (e) {
      console.error(e);
      alert('Errore nel salvataggio della misurazione');
    }
  }

  async function loadRows() {
    try {
      const clientId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/clients/${clientId}/measurements`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Errore caricamento');
      const data = await res.json();
      const mapped: Measure[] = (data.measurements || []).map((m: any) => ({
        id: m.id || m.createdAt || m.date,
        date: m.date,
        weight: m.weight ?? undefined,
        height: m.height ?? undefined,
        waist: m.circumferences?.waist ?? undefined,
        bodyFat: m.bodyFat ?? undefined,
        muscle: m.muscleMass ?? undefined,
        water: m.bodyWater ?? undefined,
      }));
      setRows(mapped);
    } catch (e) {
      console.error(e);
    }
  }

  // Load on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { loadRows(); }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Monitor Misurazioni</h3>
        <button className="btn btn-outline btn-sm">Upload foto confronto</button>
      </div>

      <div className="rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted text-foreground/90">
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Peso (kg)</th>
              <th className="text-left p-3">Altezza (cm)</th>
              <th className="text-left p-3">Vita (cm)</th>
              <th className="text-left p-3">Massa Grassa (%)</th>
              <th className="text-left p-3">Massa Magra (kg)</th>
              <th className="text-left p-3">Acqua Corporea (%)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3">{r.date}</td>
                <td className="p-3">{r.weight ?? "—"}</td>
                <td className="p-3">{r.height ?? "—"}</td>
                <td className="p-3">{r.waist ?? "—"}</td>
                <td className="p-3">{r.bodyFat ?? "—"}</td>
                <td className="p-3">{r.muscle ?? "—"}</td>
                <td className="p-3">{r.water ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-7 gap-2">
        <input className="input" placeholder="Data" value={newRow.date} onChange={(e) => setNewRow({ ...newRow, date: e.target.value })} />
        <input className="input" placeholder="Peso" value={newRow.weight ?? ""} onChange={(e) => setNewRow({ ...newRow, weight: Number(e.target.value) || undefined })} />
        <input className="input" placeholder="Altezza" value={newRow.height ?? ""} onChange={(e) => setNewRow({ ...newRow, height: Number(e.target.value) || undefined })} />
        <input className="input" placeholder="Vita" value={newRow.waist ?? ""} onChange={(e) => setNewRow({ ...newRow, waist: Number(e.target.value) || undefined })} />
        <input className="input" placeholder="Grassa %" value={newRow.bodyFat ?? ""} onChange={(e) => setNewRow({ ...newRow, bodyFat: Number(e.target.value) || undefined })} />
        <input className="input" placeholder="Magra kg" value={newRow.muscle ?? ""} onChange={(e) => setNewRow({ ...newRow, muscle: Number(e.target.value) || undefined })} />
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Acqua %" value={newRow.water ?? ""} onChange={(e) => setNewRow({ ...newRow, water: Number(e.target.value) || undefined })} />
          <button onClick={addRow} className="btn btn-primary">Aggiungi</button>
        </div>
      </div>
    </section>
  );
}


