import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { modal } from './lib';

// gate('heart posts') -> true if logged in, otherwise shows a "Login to heart posts" popup
export function useGate() {
  const { user } = useAuth();
  const nav = useNavigate();
  return (what) => {
    if (user) return true;
    modal({
      icon: 'info', title: `Login to ${what}`,
      text: 'Anyone can browse the marketplace. Hearting, commenting and messaging need an account.',
      showCancelButton: true, confirmButtonText: 'Login',
    }).then((r) => r.isConfirmed && nav('/login'));
    return false;
  };
}