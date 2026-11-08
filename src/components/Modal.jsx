import { FiX } from 'react-icons/fi';

export default function Modal({ title, onClose, wide, children }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-3 bg-black/70 backdrop-blur-sm animate-pop" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className={`glass !bg-slate-900/95 w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[92vh] overflow-y-auto p-5`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/15 transition"><FiX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}