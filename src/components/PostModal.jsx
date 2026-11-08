import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSend, FiTrash2 } from 'react-icons/fi';
import Modal from './Modal';
import { useAuth } from '../AuthContext';
import { useGate } from '../useGate';
import { api, fmt, timeAgo, toast } from '../lib';

export default function PostModal({ post, onClose, onUpdate }) {
  const { user } = useAuth();
  const gate = useGate();
  const nav = useNavigate();
  const [full, setFull] = useState(post);
  const [comments, setComments] = useState([]);
  const [img, setImg] = useState(0);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/market/posts/${post._id}`).then(setFull).catch(() => {});
    api(`/market/posts/${post._id}/comments`).then(setComments).catch(() => {});
  }, [post._id]);

  const images = full.images?.length ? full.images : post.images || [];
  const mine = user?.uid === post.authorUid;

  const send = async (e) => {
    e.preventDefault();
    if (!gate('comment') || !text.trim()) return;
    setBusy(true);
    try {
      const c = await api(`/market/posts/${post._id}/comments`, 'POST', { text });
      setComments([...comments, c]); setText('');
      onUpdate({ ...post, commentCount: comments.length + 1 });
    } catch (err) { toast('error', err.message); }
    setBusy(false);
  };
  const del = async (c) => {
    try {
      await api(`/market/comments/${c._id}`, 'DELETE');
      setComments(comments.filter((x) => x._id !== c._id));
      onUpdate({ ...post, commentCount: Math.max(0, comments.length - 1) });
    } catch (err) { toast('error', err.message); }
  };
  const message = () => {
    if (!gate('message people')) return;
    onClose();
    nav(`/inbox/${post.authorUid}`, { state: { post: { id: post._id, title: post.title } } });
  };

  return (
    <Modal title={post.title} onClose={onClose} wide>
      {images.length > 0 && (
        <div className="mb-4">
          <img src={images[img]} alt="" className="w-full max-h-[420px] object-contain rounded-2xl bg-black/30" />
          {images.length > 1 && (
            <div className="flex gap-2 mt-2">
              {images.map((s, i) => (
                <img key={i} src={s} onClick={() => setImg(i)} alt=""
                  className={`w-16 h-16 object-cover rounded-xl cursor-pointer border-2 transition ${i === img ? 'border-amber-300' : 'border-transparent opacity-60 hover:opacity-100'}`} />
              ))}
            </div>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-amber-300 font-bold text-xl">
          {post.price > 0 ? (post.type === 'buy' ? 'Budget ' : '') + fmt(post.price) : post.type === 'sell' ? 'Free' : 'Any price'}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/15 capitalize">{post.condition}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-white/15">{post.category}</span>
        {post.status === 'sold' && <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500 font-bold">SOLD</span>}
      </div>
      <p className="text-sm text-white/60 mb-2">Posted by <b>{post.authorName}</b> · {timeAgo(post.createdAt)}</p>
      {post.description && <p className="text-white/80 whitespace-pre-wrap mb-4">{post.description}</p>}
      {!mine && <button onClick={message} className="btn mb-5"><FiSend /> Message {post.authorName}</button>}

      <h4 className="font-display font-bold mb-2">Comments ({comments.length})</h4>
      <div className="space-y-2 mb-3">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-2 items-start p-3 rounded-2xl bg-white/10">
            <span className="w-8 h-8 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 text-sm font-bold">{c.name?.[0]?.toUpperCase()}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm"><b>{c.name}</b> <span className="text-xs text-white/50">{timeAgo(c.createdAt)}</span></p>
              <p className="text-sm text-white/80 break-words">{c.text}</p>
            </div>
            {(user?.uid === c.uid || mine) && (
              <button onClick={() => del(c)} className="text-pink-300 hover:scale-125 transition"><FiTrash2 /></button>
            )}
          </div>
        ))}
        {!comments.length && <p className="text-white/40 text-sm">No comments yet.</p>}
      </div>

      {user ? (
        <form onSubmit={send} className="flex gap-2">
          <input className="input" placeholder="Write a comment…" maxLength={500} value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn" disabled={busy}><FiSend /></button>
        </form>
      ) : (
        <button onClick={() => gate('comment')} className="btn-ghost w-full justify-center">Login to comment</button>
      )}
    </Modal>
  );
}