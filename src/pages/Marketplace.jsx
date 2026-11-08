import { useEffect, useState } from 'react';
import { FiPlus, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useGate } from '../useGate';
import { api, toast, CATS } from '../lib';
import PostCard from '../components/PostCard';
import PostModal from '../components/PostModal';
import NewPost from '../components/Newpost';

const Chip = ({ on, children, ...p }) => (
  <button {...p} className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${on ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400' : 'bg-white/10 hover:bg-white/20'}`}>{children}</button>
);

export default function Marketplace() {
  const { user, loading } = useAuth();
  const gate = useGate();
  const [posts, setPosts] = useState(null);
  const [type, setType] = useState('all');
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [composer, setComposer] = useState(false);
  const [open, setOpen] = useState(null);

  const load = () => {
    const p = new URLSearchParams();
    if (type !== 'all') p.set('type', type);
    if (cat !== 'All') p.set('category', cat);
    if (q.trim()) p.set('q', q.trim());
    api('/market/posts?' + p).then(setPosts).catch((e) => toast('error', e.message));
  };
  // wait for Firebase to finish checking the login so "hearted" is correct
  useEffect(() => { if (!loading) load(); }, [loading, user?.uid, type, cat]);

  const update = (np) => {
    setPosts((ps) => ps.map((p) => (p._id === np._id ? np : p)));
    setOpen((o) => (o && o._id === np._id ? np : o));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div>
        <h1 className="font-display text-4xl font-extrabold">Marketplace</h1>
        <p className="text-white/60">Buy and sell furniture, books and everything for a bachelor’s home.</p>
      </div>

      {!user && !loading && (
        <div className="glass p-4 text-sm text-white/80">
          You’re browsing as a guest. <Link to="/login" className="text-amber-300 underline">Login</Link> or{' '}
          <Link to="/register" className="text-amber-300 underline">register</Link> to post, heart, comment and message.
        </div>
      )}

      <button onClick={() => gate('create a post') && setComposer(true)}
        className="glass card-hover w-full flex items-center gap-3 p-4 text-left text-white/70">
        <span className="w-10 h-10 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-white"><FiPlus /></span>
        What are you selling or looking for?
      </button>

      <form onSubmit={(e) => { e.preventDefault(); load(); }} className="relative">
        <FiSearch className="absolute left-3 top-3.5 text-white/50" />
        <input className="input !pl-10" placeholder="Search posts…" value={q} onChange={(e) => setQ(e.target.value)} />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Chip on={type === 'all'} onClick={() => setType('all')}>All</Chip>
        <Chip on={type === 'sell'} onClick={() => setType('sell')}>Selling</Chip>
        <Chip on={type === 'buy'} onClick={() => setType('buy')}>Wanted</Chip>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['All', ...CATS].map((c) => <Chip key={c} on={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}
      </div>

      {!posts && <p className="text-center text-white/50 animate-pulse py-10">Loading posts…</p>}
      {posts && !posts.length && <p className="text-center text-white/50 py-10">No posts yet. Be the first to post something!</p>}
      {posts?.map((p) => (
        <PostCard key={p._id} post={p} onOpen={setOpen} onUpdate={update}
          onRemove={(id) => setPosts((ps) => ps.filter((x) => x._id !== id))} />
      ))}

      {open && <PostModal post={open} onClose={() => setOpen(null)} onUpdate={update} />}
      {composer && <NewPost onClose={() => setComposer(false)} onCreated={load} />}
    </div>
  );
}