import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, toast } from './lib';
export function useRoom() {
  const { id } = useParams();
  const nav = useNavigate();
  const [room, setRoom] = useState(null);
  useEffect(() => { api(`/rooms/${id}`).then(setRoom).catch((e) => { toast('error', e.message); nav('/rooms'); }); }, [id]);
  return { id, room, setRoom };
}
