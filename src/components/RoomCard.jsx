import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMessageSquare, FiSend, FiUsers, FiCoffee } from 'react-icons/fi';
import { useGate } from '../useGate';

// One available-room card, used on the Home page and the Search page
export default function RoomCard({ r, hasRoom }) {
  const gate = useGate();
  const nav = useNavigate();
  const join = () => gate('join a room') && nav('/rooms', { state: { roomId: r.roomId } });
  const dm = () => gate('message people') && nav(`/inbox/${r.managerUid}`);

  return (
    <article className="glass card-hover p-5 animate-pop">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-2xl font-bold truncate">{r.name}</h3>
          <p className="flex items-center gap-1 text-white/70"><FiMapPin className="shrink-0" /> {r.address}</p>
        </div>
        <span className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full text-slate-900 ${r.full ? 'bg-pink-400' : 'bg-emerald-400'}`}>
          {r.full ? 'FULL' : `${r.spotsLeft} SPOT${r.spotsLeft > 1 ? 'S' : ''} LEFT`}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/70 mt-3">
        <span className="flex items-center gap-1"><FiUsers /> {r.members}/{r.capacity} members</span>
        <span className="flex items-center gap-1"><FiCoffee /> {r.mealPerDay} meals/day</span>
        <span>Manager: <b>{r.managerName}</b></span>
      </div>
      <div className="h-2 rounded-full bg-white/10 mt-3 overflow-hidden">
        <div className={`h-full rounded-full ${r.full ? 'bg-pink-400' : 'bg-gradient-to-r from-fuchsia-500 to-amber-400'}`}
          style={{ width: `${Math.min(100, (r.members / r.capacity) * 100)}%` }} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {r.phone ? (
          <>
            <a href={`tel:${r.phone}`} className="btn !py-2 text-sm"><FiPhone /> Call {r.phone}</a>
            <a href={`sms:${r.phone}`} className="btn-ghost text-sm"><FiMessageSquare /> Text</a>
          </>
        ) : (
          <button onClick={() => gate('see contact details')} className="btn-ghost text-sm"><FiPhone /> Login to see phone</button>
        )}
        {!r.joined && <button onClick={dm} className="btn-ghost text-sm"><FiSend /> Message</button>}
        <div className="flex-1" />
        {r.joined ? (
          <Link to={`/rooms/${r.roomId}`} className="btn !py-2 text-sm">Open room</Link>
        ) : (
          <button onClick={join} disabled={r.full || hasRoom} className="btn !py-2 text-sm">
            {hasRoom ? 'You’re in a room' : r.full ? 'Room is full' : 'Join'}
          </button>
        )}
      </div>
    </article>
  );
}