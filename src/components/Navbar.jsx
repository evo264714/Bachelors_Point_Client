import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiMenu,
  FiX,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiKey,
  FiSearch,
  FiShoppingBag,
  FiMessageCircle,
} from "react-icons/fi";
import { useAuth } from "../AuthContext";
import { api, toast } from "../lib";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [prof, setProf] = useState(false);
  const [me, setMe] = useState(null);
  const [unread, setUnread] = useState(0);
  const nav = useNavigate();
  const box = useRef();

  useEffect(() => {
    if (!user) {
      setMe(null);
      setUnread(0);
      return;
    }
    api("/me")
      .then(setMe)
      .catch(() => {});
    const tick = () =>
      api("/inbox/unread-count")
        .then((r) => setUnread(r.count))
        .catch(() => {});
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, [user?.uid]);

  useEffect(() => {
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setProf(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleDm = async () => {
    try {
      const r = await api("/me/dm", "PATCH", { dmOn: !me.dmOn });
      setMe({ ...me, dmOn: r.dmOn });
      toast("success", r.dmOn ? "DMs are ON" : "DMs are OFF");
    } catch (e) {
      toast("error", e.message);
    }
  };

  const name = me?.name || user?.displayName || user?.email || "";
  const link =
    "flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/15 transition";
  const close = () => setOpen(false);

  const items = (
    <>
      <NavLink to="/rooms" onClick={close} className={link}>
        <FiKey /> Join Room
      </NavLink>
      <NavLink to="/marketplace" onClick={close} className={link}>
        <FiShoppingBag /> Marketplace
      </NavLink>
      <NavLink to="/search" onClick={close} className={link}>
        <FiSearch /> Search
      </NavLink>

      {user ? (
        <>
          <NavLink to="/inbox" onClick={close} className={link}>
            <span className="relative">
              <FiMessageCircle className="text-xl" />
              {unread > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-pink-500 text-[10px] font-bold">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
            Inbox
          </NavLink>

          <div className="relative" ref={box}>
            <button
              onClick={() => setProf(!prof)}
              className="w-10 h-10 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 font-bold hover:scale-110 transition"
              title="Profile"
            >
              {name[0]?.toUpperCase()}
            </button>
            {prof && (
              <div className="absolute right-0 mt-3 w-72 z-50 glass !bg-slate-900/95 p-5 animate-pop">
                <div className="flex items-center gap-3">
                  <span className="w-14 h-14 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-2xl font-bold">
                    {name[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-lg truncate">
                      {name}
                    </p>
                    <p className="text-xs text-white/60 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5 p-3 rounded-2xl bg-white/10">
                  <div>
                    <p className="font-semibold text-sm">Direct messages</p>
                    <p className="text-xs text-white/60">
                      {me?.dmOn === false
                        ? "Nobody can message you"
                        : "Anyone can message you"}
                    </p>
                  </div>
                  <button
                    onClick={toggleDm}
                    disabled={!me}
                    className={`relative w-12 h-7 rounded-full transition ${me?.dmOn === false ? "bg-white/25" : "bg-emerald-400"}`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${me?.dmOn === false ? "left-1" : "left-6"}`}
                    />
                  </button>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setProf(false);
                    toast("success", "Logged out");
                    nav("/");
                  }}
                  className="btn-ghost w-full justify-center mt-4"
                >
                  <FiLogOut /> Logout
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <Link to="/login" onClick={close} className="btn-ghost">
            <FiLogIn /> Login
          </Link>
          <Link to="/register" onClick={close} className="btn">
            <FiUserPlus /> Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 glass !rounded-none border-x-0 border-t-0">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-display font-extrabold text-xl hover:scale-105 transition"
        >
          <span className="p-2 rounded-xl bg-gradient-to-br from-fuchsia-500 to-amber-400">
            <FiHome />
          </span>{" "}
          Bachelor's Point
        </Link>
        <nav className="hidden md:flex items-center gap-2">{items}</nav>
        <button className="md:hidden text-2xl" onClick={() => setOpen(!open)}>
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>
      {open && (
        <nav className="md:hidden flex flex-col items-start gap-2 px-4 pb-4 animate-pop">
          {items}
        </nav>
      )}
    </header>
  );
}
