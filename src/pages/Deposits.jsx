import { useEffect, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { useRoom } from '../useRoom';
import Shell, { Table } from '../components/Shell';
import { api, fmt, toast } from '../lib';
export default function Deposits() {
  const { id, room } = useRoom();
  const [amt, setAmt] = useState({});
  useEffect(() => { api(`/rooms/${id}/deposits`).then(setAmt); }, [id]);
  const total = Object.values(amt).reduce((s, v) => s + (Number(v) || 0), 0);
  const save = async () => { try { await api(`/rooms/${id}/deposits`, 'PUT', { amounts: amt }); toast('success', 'Deposits saved'); } catch (e) { toast('error', e.message); } };
  return (
    <Shell room={room} title="Deposit" right={room?.isManager && <button className="btn" onClick={save}><FiSave /> Save</button>}>
      {room && <>
        <Table>
          <thead><tr><th className="th">Member</th><th className="th">Deposited amount</th></tr></thead>
          <tbody>{room.members.map((m) => (
            <tr key={m.uid}><td className="td font-semibold">{m.name}</td>
              <td className="td">{room.isManager
                ? <input type="number" min="0" className="input !w-40 !py-1" value={amt[m.uid] ?? ''} onChange={(e) => setAmt({ ...amt, [m.uid]: e.target.value })} />
                : fmt(amt[m.uid])}</td></tr>))}
            <tr className="bg-white/10 font-bold"><td className="td">Total deposit</td><td className="td text-emerald-300 text-lg">{fmt(total)}</td></tr>
          </tbody>
        </Table>
        {!room.isManager && <p className="text-white/50 text-sm mt-3">Only the manager can edit deposits.</p>}
      </>}
    </Shell>
  );
}
