import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiPlusCircle, FiLogIn, FiChevronRight } from 'react-icons/fi';
import { api, modal, toast } from '../lib';

export default function Rooms() {
  const nav = useNavigate();
  const { state } = useLocation(); // the Search page sends the Room ID here
  const [mine, setMine] = useState(null); // null = still loading
  const [c, setC] = useState({ name: '', address: '', mealPerDay: 2, phone: '', capacity: 4, password: '', listed: true });
  const [j, setJ] = useState({ roomId: state?.roomId || '', password: '' });

  useEffect(() => { api('/rooms').then(setMine).catch((e) => { toast('error', e.message); setMine([]); }); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const { roomId } = await api('/rooms', 'POST', c);
      await modal({ icon: 'success', title: 'Room created!', html: `Share this Room ID with your mates:<br/><b style="font-size:28px;color:#fcd34d">${roomId}</b><br/>You are now the <b>manager</b>.` });
      nav(`/rooms/${roomId}`);
    } catch (err) { toast('error', err.message); }
  };
  const join = async (e) => {
    e.preventDefault();
    try { const { roomId } = await api('/rooms/join', 'POST', j); toast('success', 'Joined!'); nav(`/rooms/${roomId}`); }
    catch (err) { toast('error', err.message); }
  };
  const box = (k, p, o = {}) => (
    <input className="input" required placeholder={p} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} {...o} />
  );

  if (!mine) return <p className="text-center mt-32 animate-pulse">Loading…</p>;

  // Already in a room: no create / join forms
  if (mine[0]) {
    const r = mine[0];
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5 animate-pop">
        <h1 className="font-display text-4xl font-extrabold">Your room</h1>
        <Link to={`/rooms/${r.roomId}`} className="glass card-hover p-5 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-xl">{r.name}</h3>
            <p className="text-white/60 text-sm">{r.roomId} · {r.members.length}/{r.capacity ?? '?'} members</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${r.isManager ? 'bg-amber-400 text-slate-900' : 'bg-white/20'}`}>{r.isManager ? 'Manager' : 'Member'}</span>
          </div>
          <FiChevronRight className="text-2xl" />
        </Link>
        <p className="glass p-4 text-sm text-white/70">
          You can only be in one room at a time. To create or join a different room, open this room and choose <b>Leave room</b> first.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8 animate-pop">
      <h1 className="font-display text-4xl font-extrabold">Create or join a room</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        <form onSubmit={create} className="glass p-6 space-y-3">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2"><FiPlusCircle className="text-amber-300" /> Create room / flat</h2>
          {box('name', 'Room / flat name')}
          {box('address', 'Address / area (e.g. Badda, Dhaka)')}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-white/60">Meals per day{box('mealPerDay', 'Meals per day', { type: 'number', min: 1 })}</label>
            <label className="text-xs text-white/60">Members needed (total, including you){box('capacity', 'Members needed', { type: 'number', min: 2, max: 100 })}</label>
          </div>
          {box('phone', 'Phone number', { type: 'tel' })}
          {box('password', 'Room password (min 4)', { type: 'password', minLength: 4 })}
          <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
            <input type="checkbox" className="accent-fuchsia-500 w-4 h-4" checked={c.listed} onChange={(e) => setC({ ...c, listed: e.target.checked })} />
            Show this room in Search so people can find it
          </label>
          <button className="btn w-full">Create & become manager</button>
        </form>

        <form onSubmit={join} className="glass p-6 space-y-3 self-start">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2"><FiLogIn className="text-amber-300" /> Join a room</h2>
          <input className="input uppercase" required placeholder="Room ID (e.g. BP-1A2B3C)" value={j.roomId} onChange={(e) => setJ({ ...j, roomId: e.target.value })} />
          <input className="input" type="password" required placeholder="Room password (ask the manager)" value={j.password} onChange={(e) => setJ({ ...j, password: e.target.value })} />
          <button className="btn w-full">Join room</button>
        </form>
      </div>
    </div>
  );
}