import { FiCoffee, FiHome, FiStar, FiHeart } from 'react-icons/fi';
// Floating background decor
export default function Blobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-32 -left-24 w-96 h-96 rounded-full bg-fuchsia-600/40 blur-3xl animate-float-slow" />
      <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-indigo-600/40 blur-3xl animate-float" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-amber-400/25 blur-3xl animate-float-slow" />
      <FiCoffee className="absolute top-28 left-[8%] text-4xl text-amber-300/40 animate-float" />
      <FiHome className="absolute top-1/2 right-[10%] text-5xl text-fuchsia-300/30 animate-float-slow" />
      <FiStar className="absolute bottom-24 left-[15%] text-3xl text-white/25 animate-float" />
      <FiHeart className="absolute bottom-1/3 right-[25%] text-3xl text-pink-300/30 animate-float-slow" />
    </div>
  );
}
