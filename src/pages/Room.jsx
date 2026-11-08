import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCoffee, FiDollarSign, FiClipboard, FiShoppingCart, FiPieChart, FiCopy, FiPhone, FiMapPin, FiUsers, FiLogOut, FiTrash2 } from 'react-icons/fi';
import { useRoom } from '../useRoom';
import { api, fmt, modal, toast } from '../lib';

export default function Room() {
  const { id, room, setRoom } = useRoom();
  const nav = useNavigate();
  const [st, setSt] = useState(null);
  const [cap, setCap] = useState('');

  useEffect(() => {
    Promise.all([api(`/rooms/${id}/summary`), api(`/rooms/${id}/spending`)])
      .then(([s, p]) => setSt({ meals: s.totalMeal, rate: s.rate, deposit: p.totalDeposit, balance: p.balance })).catch(() => {});
  }, [id]);
  useEffect(() => { if (room) setCap(room.capacity); }, [room?.capacity]);

  if (!room) return <p className="text-center mt-32 animate-pulse">Loading…</p>;

  const refresh = () => api(`/rooms/${id}`).then(setRoom);
  const full = room.members.length >= room.capacity;

  const save = async (body) => {
    try { const r = await api(`/rooms/${id}/settings`, 'PATCH', body); setRoom({ ...room, ...r }); toast('success', 'Saved'); }
    catch (e) { toast('error', e.message); }
  };

  // Click a member: everyone sees the profile, the manager can also promote
  const show = async (m) => {
    const canPromote = room.isManager && !m.isManager;
    const r = await modal({
      title: m.name, showCloseButton: true, showCancelButton: canPromote,
      confirmButtonText: canPromote ? '👑 Make manager' : 'Close', cancelButtonText: 'Close',
      html: `<p>${m.email}</p><p style="margin-top:8px"><b style="color:#fcd34d">${m.isManager ? '👑 Manager' : 'Member'}</b></p>`,
    });
    if (!(canPromote && r.isConfirmed)) return;
    const ok = await modal({
      icon: 'question', title: `Make ${m.name} the manager?`,
      text: 'You will become a regular member and lose the manager controls.',
      showCancelButton: true, confirmButtonText: 'Yes, promote',
    });
    if (!ok.isConfirmed) return;
    try { await api(`/rooms/${id}/manager`, 'PATCH', { uid: m.uid }); toast('success', `${m.name} is now the manager`); await refresh(); }
    catch (e) { toast('error', e.message); }
  };

  const leave = async () => {
    if (room.isManager) {
      return modal({
        icon: 'info',
        title: room.members.length > 1 ? 'Promote a new manager first' : 'You are the only member',
        text: room.members.length > 1
          ? 'Click a member’s profile above and choose “Make manager”. After that you can leave.'
          : 'Delete the room instead if you no longer need it.',
      });
    }
    const r = await modal({
      icon: 'warning', title: 'Leave this room?',
      text: 'Your meals and deposits for this month stay in the records. You can create or join another room afterwards.',
      showCancelButton: true, confirmButtonText: 'Leave room',
    });
    if (!r.isConfirmed) return;
    try { await api(`/rooms/${id}/leave`, 'POST'); toast('success', 'You left the room'); nav('/'); }
    catch (e) { toast('error', e.message); }
  };

  const remove = async () => {
    const r = await modal({
      icon: 'warning', title: 'Delete this room?',
      text: `This permanently deletes "${room.name}" with all meals, deposits, demands and expenses, for every member. Type the room name to confirm.`,
      input: 'text', inputPlaceholder: room.name, showCancelButton: true,
      confirmButtonText: 'Delete forever', confirmButtonColor: '#ef4444',
      inputValidator: (v) => (v.trim() === room.name ? null : 'Type the exact room name'),
    });
    if (!r.isConfirmed) return;
    try { await api(`/rooms/${id}`, 'DELETE'); toast('success', 'Room deleted'); nav('/'); }
    catch (e) { toast('error', e.message); }
  };

  const cards = [
    ['meals', FiCoffee, 'Meal Summary', 'Daily lunch & dinner', 'from-orange-400 to-pink-500'],
    ['deposits', FiDollarSign, 'Deposit', 'Money given to manager', 'from-emerald-400 to-teal-500'],
    ['demands', FiClipboard, 'Demands', 'Custom monthly list', 'from-sky-400 to-indigo-500'],
    ['spending', FiShoppingCart, 'Total Spending', 'Expenses & balance', 'from-fuchsia-400 to-purple-600'],
    ['summary', FiPieChart, 'Summary', 'Meal rate & dues', 'from-amber-300 to-orange-500'],
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-pop">
      <div className="glass p-6 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-extrabold">{room.name}</h1>
          <p className="text-white/70 flex flex-wrap gap-x-4 text-sm mt-1">
            <span className="flex items-center gap-1"><FiMapPin />{room.address}</span>
            <span className="flex items-center gap-1"><FiPhone />{room.phone}</span>
            <span>{room.mealPerDay} meals/day</span>
            <span className="flex items-center gap-1"><FiUsers />{room.members.length}/{room.capacity} members</span>
          </p>
          <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded-full text-slate-900 ${full ? 'bg-pink-400' : 'bg-emerald-400'}`}>
            {full ? '🔒 ROOM FULL — locked' : `${room.capacity - room.members.length} spot(s) open`}
          </span>
        </div>
        <button className="btn-ghost" onClick={() => { navigator.clipboard.writeText(room.roomId); toast('success', 'Room ID copied'); }}><FiCopy /> {room.roomId}</button>
      </div>

      {room.isManager && (
        <div className="glass p-5 grid sm:grid-cols-2 gap-5">
          <div>
            <p className="font-semibold">Members needed (capacity)</p>
            <p className="text-xs text-white/60 mb-2">Increase it to reopen a full room. It can’t go below {room.members.length}.</p>
            <div className="flex gap-2">
              <input type="number" className="input !w-28" min={room.members.length} max={100} value={cap} onChange={(e) => setCap(e.target.value)} />
              <button className="btn !py-2" onClick={() => save({ capacity: Number(cap) })}>Update</button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/10 self-start">
            <div>
              <p className="font-semibold text-sm">Show in Search</p>
              <p className="text-xs text-white/60">{room.listed ? 'People can find this room' : 'Hidden from Search'}</p>
            </div>
            <button onClick={() => save({ listed: !room.listed })}
              className={`relative w-12 h-7 shrink-0 rounded-full transition ${room.listed ? 'bg-emerald-400' : 'bg-white/25'}`}>
              <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${room.listed ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        </div>
      )}

      {st && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[['Total deposit', fmt(st.deposit), 'text-emerald-300'], ['Available balance', fmt(st.balance), st.balance < 0 ? 'text-red-400' : 'text-amber-300'],
            ['Total meals', st.meals, 'text-sky-300'], ['Meal rate', st.rate.toFixed(2), 'text-fuchsia-300']].map(([l, v, c]) => (
            <div key={l} className="glass card-hover p-4"><p className="text-xs text-white/60">{l}</p><p className={`font-display text-2xl font-extrabold ${c}`}>{v}</p></div>
          ))}
        </div>
      )}

      <section>
        <h2 className="font-display text-2xl font-bold mb-3">Members <span className="text-white/50 text-base">({room.members.length})</span></h2>
        <div className="flex flex-wrap gap-3">
          {room.members.map((m) => (
            <button key={m.uid} onClick={() => show(m)} className="glass card-hover !rounded-2xl flex items-center gap-3 px-4 py-3">
              <span className="w-10 h-10 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 font-bold">{m.name[0]?.toUpperCase()}</span>
              <span className="font-semibold">{m.name}{m.isManager && ' 👑'}</span>
            </button>
          ))}
        </div>
        {room.isManager && room.members.length > 1 && <p className="text-xs text-white/50 mt-2">Tip: click a member to make them the manager.</p>}
      </section>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(([p, I, t, d, g]) => (
          <Link key={p} to={`/rooms/${id}/${p}`} className="glass card-hover p-6 group">
            <span className={`inline-grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br ${g} text-2xl group-hover:rotate-12 transition`}><I /></span>
            <h3 className="font-display font-bold text-xl mt-4">{t}</h3><p className="text-white/60 text-sm">{d}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        <button onClick={leave} className="btn-ghost"><FiLogOut /> Leave room</button>
        {room.isManager && (
          <button onClick={remove} className="btn-ghost !border-red-400/60 text-red-300 hover:!bg-red-500/20"><FiTrash2 /> Delete room</button>
        )}
      </div>
    </div>
  );
}