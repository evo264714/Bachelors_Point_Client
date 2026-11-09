import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiPhone,
  FiUsers,
  FiCoffee,
  FiDollarSign,
  FiShoppingCart,
  FiPieChart,
  FiClipboard,
  FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "../AuthContext";
import { api, fmt } from "../lib";
import RoomCard from "../components/RoomCard";

const feats = [
  [FiUsers, "Room members", "Everyone in one place"],
  [FiCoffee, "Meal tracking", "Lunch & dinner, daily"],
  [FiDollarSign, "Deposits & spending", "Always know the balance"],
  [FiPieChart, "Auto summary", "Meal rate calculated for you"],
];

export default function Home() {
  const { user, loading } = useAuth();
  const [mine, setMine] = useState(undefined); // undefined = checking, null = not in a room
  const [avail, setAvail] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setMine(null);
      return;
    }
    api("/rooms")
      .then((r) => setMine(r[0] || null))
      .catch(() => setMine(null));
  }, [loading, user?.uid]);

  useEffect(() => {
    if (loading || mine === undefined || mine) return;
    api("/search/rooms?vacancy=1")
      .then((r) => setAvail(r.slice(0, 6)))
      .catch(() => setAvail([]));
  }, [loading, mine]);

  if (loading || mine === undefined)
    return <p className="text-center mt-32 animate-pulse">Loading…</p>;
  if (user && mine) return <MyRoom room={mine} user={user} />;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-14 pb-24">
      <div className="text-center">
        <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-tight animate-pop">
          Run your flat{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 to-amber-300 bg-clip-text text-transparent">
            without the drama
          </span>
        </h1>
        <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">
          Meals, deposits, bazar expenses and the monthly hisab — one tidy
          dashboard for every bachelor mess.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            to={user ? "/rooms" : "/register"}
            className="btn !px-8 !py-3 text-lg"
          >
            {user ? "Create a room" : "Get started free"}
          </Link>
          <Link to="/search" className="btn-ghost !px-8 !py-3 text-lg">
            Search by area
          </Link>
        </div>
      </div>

      <div className="flex items-end justify-between mt-16 mb-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold">
            Available rooms
          </h2>
          <p className="text-white/60 text-sm">
            Rooms that still have free spots
          </p>
        </div>
        <Link
          to="/search"
          className="flex items-center gap-1 text-amber-300 hover:underline"
        >
          See all <FiArrowRight />
        </Link>
      </div>
      {!avail && (
        <p className="text-center text-white/50 animate-pulse py-10">
          Loading rooms…
        </p>
      )}
      {avail && !avail.length && (
        <p className="glass p-6 text-center text-white/60">
          No open rooms right now. Create your own and invite your mates!
        </p>
      )}
      <div className="grid md:grid-cols-2 gap-5">
        {avail?.map((r) => (
          <RoomCard key={r.roomId} r={r} hasRoom={false} />
        ))}
      </div>

      {!user && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-16">
          {feats.map(([I, t, d]) => (
            <div key={t} className="glass card-hover p-6 text-center">
              <I className="text-3xl text-amber-300 mx-auto" />
              <h3 className="font-display font-bold text-lg mt-3">{t}</h3>
              <p className="text-white/60 text-sm">{d}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyRoom({ room, user }) {
  const [d, setD] = useState(null);
  const [st, setSt] = useState(null);
  useEffect(() => {
    api(`/rooms/${room.roomId}`)
      .then(setD)
      .catch(() => {});
    Promise.all([
      api(`/rooms/${room.roomId}/summary`),
      api(`/rooms/${room.roomId}/spending`),
    ])
      .then(([s, p]) =>
        setSt({
          meals: s.totalMeal,
          rate: s.rate,
          deposit: p.totalDeposit,
          balance: p.balance,
        }),
      )
      .catch(() => {});
  }, [room.roomId]);

  const mgr = d?.members.find((m) => m.isManager);
  const count = d?.members.length ?? room.members.length;
  const cap = room.capacity ?? count;
  const full = count >= cap;
  const links = [
    ["meals", FiCoffee, "Meals"],
    ["deposits", FiDollarSign, "Deposit"],
    ["demands", FiClipboard, "Demands"],
    ["spending", FiShoppingCart, "Spending"],
    ["summary", FiPieChart, "Summary"],
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 animate-pop">
      <div>
        <p className="text-amber-300 font-semibold">
          Welcome back, {user?.displayName || user?.email}
        </p>
        <h1 className="font-display text-4xl font-extrabold">Your room</h1>
      </div>

      <div className="glass p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-extrabold">
              {room.name}
            </h2>
            <p className="flex items-center gap-1 text-white/70 mt-1">
              <FiMapPin /> {room.address}
            </p>
            <p className="flex items-center gap-1 text-white/70">
              <FiPhone /> {room.phone}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full ${room.isManager ? "bg-amber-400 text-slate-900" : "bg-white/20"}`}
            >
              {room.isManager ? "👑 You are the manager" : "Member"}
            </span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full text-slate-900 ${full ? "bg-pink-400" : "bg-emerald-400"}`}
            >
              {full ? "🔒 Full" : `${cap - count} spot(s) open`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-white/70">
          <span className="flex items-center gap-1">
            <FiUsers /> {count}/{cap} members
          </span>
          <span className="flex items-center gap-1">
            <FiCoffee /> {room.mealPerDay} meals/day
          </span>
          {mgr && (
            <span>
              Manager: <b>{mgr.name}</b>
            </span>
          )}
          <span>
            Room ID: <b>{room.roomId}</b>
          </span>
        </div>

        {st && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Total deposit", fmt(st.deposit), "text-emerald-300"],
              [
                "Available balance",
                fmt(st.balance),
                st.balance < 0 ? "text-red-400" : "text-amber-300",
              ],
              ["Total meals", st.meals, "text-sky-300"],
              ["Meal rate", st.rate.toFixed(2), "text-fuchsia-300"],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-2xl bg-white/10 p-3">
                <p className="text-xs text-white/60">{l}</p>
                <p className={`font-display text-xl font-extrabold ${c}`}>
                  {v}
                </p>
              </div>
            ))}
          </div>
        )}

        <Link to={`/rooms/${room.roomId}`} className="btn w-full sm:w-auto">
          Open room <FiArrowRight />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {links.map(([p, I, t]) => (
          <Link
            key={p}
            to={`/rooms/${room.roomId}/${p}`}
            className="glass card-hover p-4 text-center"
          >
            <I className="text-2xl text-amber-300 mx-auto" />
            <p className="font-semibold text-sm mt-2">{t}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
