import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { useRoom } from '../useRoom';
import Shell, { Table } from '../components/Shell';
import { api, toast } from '../lib';
export default function Meals() {
  const { id, room, setRoom } = useRoom();
  const [meals, setMeals] = useState([]);
  const [me, setMe] = useState({ lunch: 0, dinner: 0 });
  const load = () => api(`/rooms/${id}/meals`).then(setMeals);
  useEffect(() => { load(); }, [id]);
  if (!room) return <Shell />;
  const get = (uid, date) => meals.find((x) => x.uid === uid && x.date === date);
  const total = (uid) => meals.filter((x) => x.uid === uid).reduce((s, x) => s + x.lunch + x.dinner, 0);
  const toggle = async () => {
    try { const r = await api(`/rooms/${id}/meal-toggle`, 'PATCH', { open: !room.mealOpen }); setRoom({ ...room, mealOpen: r.mealOpen }); toast('success', r.mealOpen ? 'Meal form is ON' : 'Meal form is OFF'); }
    catch (e) { toast('error', e.message); }
  };
  const save = async () => {
    try { await api(`/rooms/${id}/meals`, 'PUT', me); toast('success', 'Meals saved'); load(); } catch (e) { toast('error', e.message); }
  };
  const days = Array.from({ length: room.daysInMonth }, (_, i) => `${room.month}-${String(i + 1).padStart(2, '0')}`);
  return (
    <Shell room={room} title="Meal Summary" right={room.isManager && (
      <button onClick={toggle} className={`btn ${room.mealOpen ? '' : '!from-slate-500 !to-slate-600'}`}>Meal confirmation: {room.mealOpen ? 'ON' : 'OFF'}</button>)}>
      <Me room={room} setMe={setMe} />
      <Table>
        <thead><tr><th className="th">Date</th>{room.members.map((m) => <th key={m.uid} className="th">{m.name}</th>)}</tr></thead>
        <tbody>
          {days.map((d) => (
            <tr key={d} className={d === room.today ? 'bg-amber-300/10' : ''}>
              <td className="td font-semibold">{d.slice(8)}{d === room.today && <span className="ml-2 text-[10px] bg-amber-400 text-slate-900 rounded px-1">TODAY</span>}</td>
              {room.members.map((m) => {
                const x = get(m.uid, d);
                const mine = m.uid === room.me && d === room.today;
                return <td key={m.uid} className="td">{mine ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">L</span><input type="number" min="0" disabled={!room.mealOpen} className="input !w-16 !py-1" value={me.lunch} onChange={(e) => setMe({ ...me, lunch: e.target.value })} />
                    <span className="text-xs">D</span><input type="number" min="0" disabled={!room.mealOpen} className="input !w-16 !py-1" value={me.dinner} onChange={(e) => setMe({ ...me, dinner: e.target.value })} />
                    <button disabled={!room.mealOpen} onClick={save} className="btn !p-2"><FiSave /></button>
                  </div>) : x ? <span>L {x.lunch} · D {x.dinner}</span> : <span className="text-white/30">—</span>}</td>;
              })}
            </tr>
          ))}
          <tr className="bg-white/10 font-bold"><td className="td">Total meals</td>{room.members.map((m) => <td key={m.uid} className="td text-amber-300">{total(m.uid)}</td>)}</tr>
        </tbody>
      </Table>
    </Shell>
  );
}
// preload the current user's own values for today into the inputs
function Me({ room, setMe }) {
  useEffect(() => {
    api(`/rooms/${room.roomId}/meals`).then((all) => {
      const x = all.find((v) => v.uid === room.me && v.date === room.today);
      if (x) setMe({ lunch: x.lunch, dinner: x.dinner });
    });
  }, []);
  return null;
}
