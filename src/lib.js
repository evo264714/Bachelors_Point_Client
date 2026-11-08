import Swal from 'sweetalert2';
import { auth } from './firebase';

export const CUR = '৳';
export const fmt = (n) => `${CUR}${Number(n || 0).toFixed(2)}`;
export const CATS = ['Furniture', 'Books', 'Electronics', 'Kitchen', 'Bedding', 'Clothing', 'Other'];

const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

// Works logged-in or logged-out (token is only sent if there is one)
export async function api(path, method = 'GET', body) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const timeAgo = (d) => {
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(d).toLocaleDateString();
};

const theme = { background: '#1e1b4b', color: '#fff' };
export const toast = (icon, title) => Swal.mixin({
  toast: true, position: 'top-end', showConfirmButton: false, timer: 2600, timerProgressBar: true, ...theme,
}).fire({ icon, title });
export const modal = (opts) => Swal.fire({ ...theme, confirmButtonColor: '#d946ef', ...opts });