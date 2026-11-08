import { useNavigate } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiSend, FiTrash2, FiCheckCircle, FiImage } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../AuthContext';
import { useGate } from '../useGate';
import { api, fmt, modal, timeAgo, toast } from '../lib';

export default function PostCard({ post, onOpen, onUpdate, onRemove }) {
  const { user } = useAuth();
  const gate = useGate();
  const nav = useNavigate();
  const mine = user?.uid === post.authorUid;
  const sold = post.status === 'sold';
  const price = post.price > 0 ? (post.type === 'buy' ? 'Budget ' : '') + fmt(post.price) : post.type === 'sell' ? 'Free' : 'Any price';

  const heart = async () => {
    if (!gate('heart posts')) return;
    try {
      const r = await api(`/market/posts/${post._id}/heart`, 'POST');
      onUpdate({ ...post, hearted: r.hearted, hearts: r.count });
    } catch (e) { toast('error', e.message); }
  };
  const message = () => {
    if (!gate('message people')) return;
    nav(`/inbox/${post.authorUid}`, { state: { post: { id: post._id, title: post.title } } });
  };
  const toggleSold = async () => {
    try { const r = await api(`/market/posts/${post._id}/sold`, 'PATCH'); onUpdate({ ...post, status: r.status }); }
    catch (e) { toast('error', e.message); }
  };
  const del = async () => {
    const r = await modal({ title: 'Delete this post?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Delete' });
    if (!r.isConfirmed) return;
    try { await api(`/market/posts/${post._id}`, 'DELETE'); onRemove(post._id); toast('success', 'Post deleted'); }
    catch (e) { toast('error', e.message); }
  };

  return (
    <article className="glass card-hover overflow-hidden animate-pop">
      <div className="flex items-center gap-3 p-4">
        <span className="w-10 h-10 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 font-bold">{post.authorName?.[0]?.toUpperCase()}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{post.authorName}</p>
          <p className="text-xs text-white/50">{timeAgo(post.createdAt)} · {post.category}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-slate-900 ${post.type === 'sell' ? 'bg-emerald-400' : 'bg-sky-400'}`}>
          {post.type === 'sell' ? 'SELLING' : 'WANTED'}
        </span>
      </div>

      <div className="px-4 pb-3 cursor-pointer" onClick={() => onOpen(post)}>
        <h3 className={`font-display text-xl font-bold ${sold ? 'line-through text-white/50' : ''}`}>{post.title}</h3>
        <p className="text-amber-300 font-bold text-lg">{price}</p>
        <div className="flex gap-2 my-2 text-xs">
          <span className="px-2 py-0.5 rounded-full bg-white/15 capitalize">{post.condition}</span>
          {sold && <span className="px-2 py-0.5 rounded-full bg-pink-500 font-bold">SOLD</span>}
        </div>
        {post.description && <p className="text-white/70 text-sm line-clamp-3">{post.description}</p>}
      </div>

      <div className="relative cursor-pointer" onClick={() => onOpen(post)}>
        {post.images?.[0]
          ? <img src={post.images[0]} alt={post.title} className={`w-full h-64 object-cover ${sold ? 'opacity-50' : ''}`} />
          : <div className="h-28 grid place-items-center bg-white/5 text-white/30 text-3xl"><FiImage /></div>}
        {post.imageCount > 1 && <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded-full bg-black/60">+{post.imageCount - 1} more</span>}
      </div>

      <div className="flex items-center gap-1 p-2 border-t border-white/10 text-sm">
        <button onClick={heart} className={`flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition ${post.hearted ? 'text-pink-400' : ''}`}>
          {post.hearted ? <FaHeart className="text-lg" /> : <FiHeart className="text-lg" />} {post.hearts}
        </button>
        <button onClick={() => onOpen(post)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
          <FiMessageCircle className="text-lg" /> {post.commentCount || 0}
        </button>
        <div className="flex-1" />
        {mine ? (
          <>
            <button onClick={toggleSold} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition">
              <FiCheckCircle /> {sold ? 'Mark available' : 'Mark sold'}
            </button>
            <button onClick={del} className="p-2 rounded-xl text-pink-300 hover:bg-white/10 transition"><FiTrash2 /></button>
          </>
        ) : (
          <button onClick={message} className="btn !py-2 !px-4 text-sm"><FiSend /> Message</button>
        )}
      </div>
    </article>
  );
}