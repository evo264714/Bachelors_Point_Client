import { useEffect, useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { useRoom } from '../useRoom';
import Shell, { Table } from '../components/Shell';
import { api, fmt, modal, toast } from '../lib';
export default function Spending() {
  const { id, room } = useRoom();
  const [s, setS] = useState({ totalDeposit: 0, balance: 0, totalExpense: 0, expenses: [] });
  const [f, setF] = useState({ name: '', date: new Date().toLocaleDateString('en-CA'), amount: '' });
  const load = () => api(`/rooms/${id}/spending`).then(setS);
  useEffect(() => { load(); }, [id]);
  const add = async (e) => {
    e.preventDefault();
    try { await api(`/rooms/${id}/expenses`, 'POST', f); toast('success', 'Expense added'); setF({ ...f, name: '', amount: '' }); load(); }
    catch (err) { toast('error', err.message); }
  };
  const del = async (eid) => {
    const r = await modal({ title: 'Delete this expense?', icon: 'warning', showCancelButton: true });
    if (r.isConfirmed) { await api(`/rooms/${id}/expenses/${eid}`, 'DELETE'); toast('success', 'Deleted'); load(); }
  };
  const stat = (l, v, c) => <div className="glass px-5 py-3 text-right"><p className="text-xs text-white/60">{l}</p><p className={`font-display text-2xl font-extrabold ${c}`}>{fmt(v)}</p></div>;
  return (
    <Shell room={room} title="Total Spending" right={<div className="flex gap-3 ml-auto">{stat('Total Deposit', s.totalDeposit, 'text-emerald-300')}{stat('Available Balance', s.balance, s.balance < 0 ? 'text-red-400' : 'text-amber-300')}</div>}>
      {room && <>
        <h2 className="font-display text-2xl font-bold mb-3">Expense</h2>
        {room.isManager && (
          <form onSubmit={add} className="glass p-4 mb-4 grid sm:grid-cols-4 gap-3">
            <input className="input" required placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input className="input" required type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
            <input className="input" required type="number" min="1" step="any" placeholder="Amount" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
            <button className="btn"><FiPlus /> Add</button>
          </form>)}
        <Table>
          <thead><tr><th className="th">Name</th><th className="th">Date</th><th className="th">Amount</th>{room.isManager && <th className="th" />}</tr></thead>
          <tbody>
            {s.expenses.map((x) => (<tr key={x._id}><td className="td">{x.name}</td><td className="td">{x.date}</td><td className="td">{fmt(x.amount)}</td>
              {room.isManager && <td className="td"><button onClick={() => del(x._id)} className="text-pink-300 hover:scale-125 transition"><FiTrash2 /></button></td>}</tr>))}
            {!s.expenses.length && <tr><td className="td text-white/40" colSpan={4}>No expenses yet.</td></tr>}
            <tr className="bg-white/10 font-bold"><td className="td" colSpan={2}>Total spent</td><td className="td">{fmt(s.totalExpense)}</td>{room.isManager && <td className="td" />}</tr>
          </tbody>
        </Table>
      </>}
    </Shell>
  );
}
