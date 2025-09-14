"use client";

import { useState, useEffect } from "react";

type Meal = { id: string; time: string; label: string; notes?: string };

export default function FoodDiary() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const [newMeal, setNewMeal] = useState({ time: "", label: "", notes: "" });

  function addMeal() {
    if (!newMeal.time || !newMeal.label) return;
    setMeals((m) => [...m, { id: String(Date.now()), ...newMeal }]);
    setNewMeal({ time: "", label: "", notes: "" });
  }

  async function resetTemplate() {
    const template = [
      { time: "07:30", label: "Colazione" },
      { time: "10:30", label: "Spuntino" },
      { time: "13:00", label: "Pranzo" },
      { time: "16:30", label: "Spuntino" },
      { time: "20:00", label: "Cena" },
    ];
    setMeals(template.map((t, idx) => ({ id: String(idx+1), ...t })) as any);
    await saveDiary(template as any);
  }

  async function saveDiary(entries: Meal[]) {
    try {
      const clientId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/clients/${clientId}/profile/nutritionDiary`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          dietType: 'other',
          mealsPerDay: entries.length,
          skippedMeals: entries.filter(e => (e.notes || '').toLowerCase().includes('salt')).map(e => e.label),
          dailyMealDescription: entries.map(e => `${e.time} ${e.label}${e.notes ? ` - ${e.notes}` : ''}`).join('; '),
          foodPreferences: [],
          foodDislikes: [],
        }),
      });
      if (!res.ok) throw new Error('Errore salvataggio diario');
    } catch (e) {
      console.error(e);
    }
  }

  async function loadDiary() {
    try {
      const clientId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') as string).id : '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/clients/${clientId}/profile`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Errore caricamento profilo');
      const data = await res.json();
      const desc: string | undefined = data?.client?.profile?.nutritionDiary?.dailyMealDescription;
      if (desc) {
        const parsed: Meal[] = desc.split('; ').map((line: string, idx: number) => {
          const [time, rest] = line.split(' ');
          const [label, note] = rest.split(' - ');
          return { id: String(idx+1), time, label, notes: note };
        });
        setMeals(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => { loadDiary(); }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Diario Alimentare</h3>
        <div className="flex gap-2">
          <button onClick={resetTemplate} className="btn btn-secondary btn-sm">Reset pasto tipo</button>
          <button className="btn btn-outline btn-sm">Upload ricette</button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        {meals.map((m) => (
          <div key={m.id} className="grid grid-cols-3 gap-3 items-center">
            <input className="input" value={m.time} onChange={(e) => setMeals((prev) => prev.map((x) => x.id === m.id ? { ...x, time: e.target.value } : x))} />
            <input className="input" value={m.label} onChange={(e) => setMeals((prev) => prev.map((x) => x.id === m.id ? { ...x, label: e.target.value } : x))} />
            <input className="input" placeholder="Note" value={m.notes || ""} onChange={(e) => setMeals((prev) => prev.map((x) => x.id === m.id ? { ...x, notes: e.target.value } : x))} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input className="input" placeholder="Ora" value={newMeal.time} onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })} />
        <input className="input" placeholder="Pasto" value={newMeal.label} onChange={(e) => setNewMeal({ ...newMeal, label: e.target.value })} />
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="Note" value={newMeal.notes} onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })} />
          <button onClick={async () => { await addMeal(); await saveDiary([...meals, { id: 'temp', ...newMeal } as any]); }} className="btn btn-primary">Aggiungi</button>
        </div>
      </div>
    </section>
  );
}


