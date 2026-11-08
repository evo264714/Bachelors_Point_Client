import { useState } from 'react';
import { FiImage, FiX } from 'react-icons/fi';
import Modal from './Modal';
import { api, CATS, toast } from '../lib';
import { compressImage } from '../utils/image';

export default function NewPost({ onClose, onCreated }) {
  const [f, setF] = useState({ type: 'sell', title: '', category: 'Furniture', condition: 'used', price: '', description: '' });
  const [imgs, setImgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const pick = async (e) => {
    const files = [...e.target.files].slice(0, 3 - imgs.length);
    try { setImgs([...imgs, ...(await Promise.all(files.map((x) => compressImage(x))))]); }
    catch (err) { toast('error', err.message); }
    e.target.value = '';
  };
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/market/posts', 'POST', { ...f, images: imgs });
      toast('success', 'Posted!');
      onCreated(); onClose();
    } catch (err) { toast('error', err.message); setBusy(false); }
  };

  const tab = (v, label) => (
    <button type="button" onClick={() => setF({ ...f, type: v })}
      className={`flex-1 py-2 rounded-xl font-semibold transition ${f.type === v ? 'bg-gradient-to-r from-fuchsia-500 to-amber-400' : 'bg-white/10 hover:bg-white/20'}`}>{label}</button>
  );

  return (
    <Modal title="Create a post" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-2">{tab('sell', 'I’m selling')}{tab('buy', 'I want to buy')}</div>
        <input className="input" required maxLength={100} placeholder="Title (e.g. Study table, almost new)" value={f.title} onChange={set('title')} />
        <div className="grid grid-cols-2 gap-3">
          <select className="input [&>option]:text-slate-900" value={f.category} onChange={set('category')}>
            {CATS.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input [&>option]:text-slate-900" value={f.condition} onChange={set('condition')}>
            <option value="used">Used</option><option value="new">New</option>
          </select>
        </div>
        <input className="input" type="number" min="0" step="any" placeholder={f.type === 'sell' ? 'Price (0 = free)' : 'Your budget (optional)'} value={f.price} onChange={set('price')} />
        <textarea className="input" rows={4} maxLength={1000} placeholder="Describe it: size, age, why you’re selling, pickup area…" value={f.description} onChange={set('description')} />
        <div className="flex gap-2 flex-wrap">
          {imgs.map((s, i) => (
            <div key={i} className="relative">
              <img src={s} alt="" className="w-20 h-20 object-cover rounded-xl" />
              <button type="button" onClick={() => setImgs(imgs.filter((_, j) => j !== i))}
                className="absolute -top-2 -right-2 w-6 h-6 grid place-items-center rounded-full bg-pink-500"><FiX className="text-xs" /></button>
            </div>
          ))}
          {imgs.length < 3 && (
            <label className="w-20 h-20 grid place-items-center rounded-xl border-2 border-dashed border-white/30 text-white/60 cursor-pointer hover:bg-white/10 transition">
              <FiImage className="text-2xl" />
              <input type="file" accept="image/*" multiple hidden onChange={pick} />
            </label>
          )}
        </div>
        <button className="btn w-full" disabled={busy}>{busy ? 'Posting…' : 'Post'}</button>
      </form>
    </Modal>
  );
}