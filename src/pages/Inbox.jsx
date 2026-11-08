import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSend, FiMessageCircle, FiPackage, FiX } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { api, timeAgo, toast } from '../lib';

export default function Inbox() {
  const { uid } = useParams();
  const [convs, setConvs] = useState(null);
  const load = () => api('/inbox').then(setConvs).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 8000); return () => clearInterval(t); }, [uid]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-6rem)]">
      <aside className={`glass overflow-y-auto ${uid ? 'hidden md:block' : ''}`}>
        <h2 className="font-display text-xl font-bold p-4">Inbox</h2>
        {convs && !convs.length && <p className="px-4 pb-4 text-sm text-white/50">No conversations yet. Open a post in the Marketplace and tap Message.</p>}
        {convs?.map((c) => (
          <Link key={c.key} to={`/inbox/${c.other.uid}`}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition ${c.other.uid === uid ? 'bg-white/10' : ''}`}>
            <span className="w-11 h-11 shrink-0 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 font-bold">{c.other.name?.[0]?.toUpperCase()}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{c.other.name}</p>
              <p className={`text-sm truncate ${c.unread ? 'text-white font-semibold' : 'text-white/50'}`}>{c.lastMessage}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40">{timeAgo(c.lastAt)}</p>
              {c.unread > 0 && <span className="inline-block mt-1 min-w-[20px] px-1.5 rounded-full bg-pink-500 text-xs font-bold">{c.unread}</span>}
            </div>
          </Link>
        ))}
      </aside>

      <section className={`glass flex flex-col min-h-0 ${uid ? '' : 'hidden md:flex'}`}>
        {uid ? <Chat key={uid} otherUid={uid} onSent={load} /> : (
          <div className="flex-1 grid place-items-center text-center text-white/40 p-6">
            <div><FiMessageCircle className="text-5xl mx-auto mb-3" />Select a conversation</div>
          </div>
        )}
      </section>
    </div>
  );
}

function Chat({ otherUid, onSent }) {
  const { state } = useLocation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [text, setText] = useState('');
  const [post, setPost] = useState(state?.post || null); // the item being discussed
  const end = useRef();

  const load = (silent) => api(`/inbox/${otherUid}`).then(setData).catch((e) => { if (!silent) toast('error', e.message); });
  useEffect(() => { load(); const t = setInterval(() => load(true), 4000); return () => clearInterval(t); }, [otherUid]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [data?.messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api('/inbox/send', 'POST', { toUid: otherUid, text, postId: post?.id });
      setText(''); setPost(null);
      await load(true); onSent();
    } catch (err) { toast('error', err.message); }
  };

  if (!data) return <p className="m-auto text-white/50 animate-pulse">Loading…</p>;
  const off = !data.other.dmOn;

  return (
    <>
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Link to="/inbox" className="md:hidden p-2 rounded-full hover:bg-white/15"><FiArrowLeft /></Link>
        <span className="w-10 h-10 grid place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-amber-400 font-bold">{data.other.name[0]?.toUpperCase()}</span>
        <div><p className="font-semibold">{data.other.name}</p>{off && <p className="text-xs text-pink-300">DMs are turned off</p>}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!data.messages.length && <p className="text-center text-white/40 text-sm mt-6">Say hi to {data.other.name} 👋</p>}
        {data.messages.map((m) => {
          const mine = m.from === user?.uid;
          return (
            <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${mine ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400 rounded-br-sm' : 'bg-white/15 rounded-bl-sm'}`}>
                {m.post && <p className="flex items-center gap-1 text-xs opacity-80 mb-1"><FiPackage /> About: {m.post.title}</p>}
                <p className="break-words whitespace-pre-wrap">{m.text}</p>
                <p className="text-[10px] opacity-60 text-right mt-1">{timeAgo(m.createdAt)}</p>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      {off ? (
        <p className="p-4 text-center text-sm text-white/50 border-t border-white/10">{data.other.name} isn’t accepting messages right now.</p>
      ) : (
        <form onSubmit={send} className="p-3 border-t border-white/10">
          {post && (
            <div className="flex items-center gap-2 text-xs mb-2 px-3 py-1.5 rounded-xl bg-white/10">
              <FiPackage /> About: <b className="truncate">{post.title}</b>
              <button type="button" onClick={() => setPost(null)} className="ml-auto"><FiX /></button>
            </div>
          )}
          <div className="flex gap-2">
            <input className="input" placeholder="Type a message…" maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
            <button className="btn"><FiSend /></button>
          </div>
        </form>
      )}
    </>
  );
}