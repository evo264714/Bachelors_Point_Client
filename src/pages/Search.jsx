import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { api, toast } from '../lib';
import RoomCard from '../components/RoomCard';

export default function Search() {
  const { user, loading } = useAuth();
  const [q, setQ] = useState('');
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [rooms, setRooms] = useState(null);
  const [hasRoom, setHasRoom] = useState(false);

  const run = (query = q) => {
    const p = new URLSearchParams({ q: query.trim(), vacancy: onlyOpen ? '1' : '0' });
    api('/search/rooms?' + p).then(setRooms).catch((e) => toast('error', e.message));
  };
  useEffect(() => { if (!loading) run(); }, [loading, user?.uid, onlyOpen]);
  useEffect(() => {
    if (loading) return;
    if (user) api('/rooms').then((r) => setHasRoom(r.length > 0)).catch(() => {});
    else setHasRoom(false);
  }, [loading, user?.uid]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Find a bachelor’s home</h1>
        <p className="text-white/60">Search by area, like <b>Badda</b>, <b>Mirpur</b> or a street name.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); run(); }} className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-3.5 text-white/50" />
          <input className="input !pl-10" placeholder="Search area or room name…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn">Search</button>
      </form>

      <label className="flex items-center gap-2 text-sm text-white/80 cursor-pointer w-fit">
        <input type="checkbox" className="accent-fuchsia-500 w-4 h-4" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
        Only show rooms with free spots
      </label>

      {!user && !loading && (
        <div className="glass p-4 text-sm text-white/80">
          <Link to="/login" className="text-amber-300 underline">Login</Link> or{' '}
          <Link to="/register" className="text-amber-300 underline">register</Link> to see phone numbers and contact the manager.
        </div>
      )}
      {hasRoom && (
        <div className="glass p-4 text-sm text-white/80">You’re already in a room, so joining is turned off. Leave your room first to join another.</div>
      )}

      {!rooms && <p className="text-center text-white/50 animate-pulse py-10">Searching…</p>}
      {rooms && !rooms.length && <p className="text-center text-white/50 py-10">No rooms found. Try a different area name.</p>}
      {rooms?.map((r) => <RoomCard key={r.roomId} r={r} hasRoom={hasRoom} />)}
    </div>
  );
}