import { useEffect, useState } from 'react';
import { FiPlus, FiSave, FiTrash2 } from 'react-icons/fi';
import { useRoom } from '../useRoom';
import Shell, { Table } from '../components/Shell';
import { api, modal, toast } from '../lib';
export default function Demands() {
  const { id, room } = useRoom();
  const [d, setD] = useState({ fields: [], values: {} });
  useEffect(() => { api(`/rooms/${id}/demands`).then(setD); }, [id]);
  const addField = async () => {
    const { value } = await modal({ title: 'New field', input: 'text', inputPlaceholder: 'e.g. Rice, Oil, Internet', showCancelButton: true });
    if (value?.trim() && !d.fields.includes(value.trim())) setD({ ...d, fields: [...d.fields, value.trim()] });
  };
  const rmField = (f) => setD({ ...d, fields: d.fields.filter((x) => x !== f) });
  const setVal = (uid, f, v) => setD({ ...d, values: { ...d.values, [uid]: { ...d.values[uid], [f]: v } } });
  const save = async () => { try { await api(`/rooms/${id}/demands`, 'PUT', d); toast('success', 'Demands saved'); } catch (e) { toast('error', e.message); } };
  return (
    <Shell room={room} title="Demands" right={room?.isManager && (
      <div className="flex gap-2"><button className="btn-ghost" onClick={addField}><FiPlus /> Add field</button><button className="btn" onClick={save}><FiSave /> Save</button></div>)}>
      {room && (!d.fields.length
        ? <div className="glass p-10 text-center text-white/60">{room.isManager ? 'Nothing here yet — add a custom field to start.' : 'The manager has not created this page yet.'}</div>
        : <Table>
          <thead><tr><th className="th">Member</th>{d.fields.map((f) => (
            <th key={f} className="th">{f}{room.isManager && <button onClick={() => rmField(f)} className="ml-2 text-pink-300 hover:text-pink-200"><FiTrash2 className="inline" /></button>}</th>))}</tr></thead>
          <tbody>{room.members.map((m) => (
            <tr key={m.uid}><td className="td font-semibold">{m.name}</td>
              {d.fields.map((f) => <td key={f} className="td">{room.isManager
                ? <input className="input !w-32 !py-1" value={d.values[m.uid]?.[f] ?? ''} onChange={(e) => setVal(m.uid, f, e.target.value)} />
                : d.values[m.uid]?.[f] || <span className="text-white/30">—</span>}</td>)}</tr>))}</tbody>
        </Table>)}
    </Shell>
  );
}
