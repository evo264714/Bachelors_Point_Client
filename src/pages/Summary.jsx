import { useEffect, useState } from "react";
import { useRoom } from "../useRoom";
import Shell, { Table } from "../components/Shell";
import { api, fmt } from "../lib";
export default function Summary() {
  const { id, room } = useRoom();
  const [s, setS] = useState(null);
  useEffect(() => {
    api(`/rooms/${id}/summary`).then(setS);
  }, [id]);
  const stat = (l, v) => (
    <div className="glass card-hover p-5 text-center">
      <p className="text-xs text-white/60">{l}</p>
      <p className="font-display text-3xl font-extrabold text-amber-300">{v}</p>
    </div>
  );
  return (
    <Shell room={room} title="Summary">
      {s && (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            {stat("Total Meal", s.totalMeal)}
            {stat("Total Deposit", fmt(s.totalDeposit))}
            {stat("Meal Rate", s.rate.toFixed(2))}
          </div>
          <p className="text-white/50 text-sm mb-3">
            Meal rate = Total deposit ÷ Total meal
          </p>
          <Table>
            <thead>
              <tr>
                <th className="th">Member</th>
                <th className="th">Total meal</th>
                <th className="th">Meal cost</th>
                <th className="th">Deposit</th>
                <th className="th">Balance (Deposit − Cost)</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r.uid} className="hover:bg-white/5 transition">
                  <td className="td font-semibold">
                    {r.name}
                    {r.left && (
                      <span className="ml-2 text-[10px] bg-white/20 rounded px-1.5">
                        left
                      </span>
                    )}
                  </td>
                  <td className="td">{r.meals}</td>
                  <td className="td">{fmt(r.cost)}</td>
                  <td className="td">{fmt(r.deposit)}</td>
                  <td
                    className={`td font-bold ${r.balance < 0 ? "text-red-400" : "text-emerald-400"}`}
                  >
                    {fmt(r.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Shell>
  );
}
