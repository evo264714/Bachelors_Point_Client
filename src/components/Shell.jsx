import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
export default function Shell({ room, title, right, children }) {
  if (!room) return <p className="text-center mt-32 animate-pulse">Loading…</p>;
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pop">
      <Link to={`/rooms/${room.roomId}`} className="btn-ghost !px-3 !py-1.5 text-sm"><FiArrowLeft /> {room.name}</Link>
      <div className="flex flex-wrap items-end justify-between gap-3 my-5">
        <div><h1 className="font-display text-3xl md:text-4xl font-extrabold">{title}</h1><p className="text-amber-300 font-semibold">{room.monthLabel}</p></div>
        {right}
      </div>
      {children}
    </div>
  );
}
export const Table = ({ children }) => <div className="glass overflow-x-auto"><table className="w-full text-sm">{children}</table></div>;
