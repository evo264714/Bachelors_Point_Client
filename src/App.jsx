// import { Navigate, Route, Routes } from 'react-router-dom';
// import { useAuth } from './AuthContext';
// import Navbar from './components/Navbar';
// import Blobs from './components/Blobs';
// import Home from './pages/Home';
// import Auth from './pages/Auth';
// import Rooms from './pages/Rooms';
// import Room from './pages/Room';
// import Meals from './pages/Meals';
// import Deposits from './pages/Deposits';
// import Demands from './pages/Demands';
// import Spending from './pages/Spending';
// import Summary from './pages/Summary';

// function Private({ children }) {
//   const { user, loading } = useAuth();
//   if (loading) return <p className="text-center mt-32 animate-pulse">Loading…</p>;
//   return user ? children : <Navigate to="/login" />;
// }
// export default function App() {
//   const p = (el) => <Private>{el}</Private>;
//   return (
//     <>
//       <Blobs /><Navbar />
//       <main className="relative z-10">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Auth mode="login" />} />
//           <Route path="/register" element={<Auth mode="register" />} />
//           <Route path="/rooms" element={p(<Rooms />)} />
//           <Route path="/rooms/:id" element={p(<Room />)} />
//           <Route path="/rooms/:id/meals" element={p(<Meals />)} />
//           <Route path="/rooms/:id/deposits" element={p(<Deposits />)} />
//           <Route path="/rooms/:id/demands" element={p(<Demands />)} />
//           <Route path="/rooms/:id/spending" element={p(<Spending />)} />
//           <Route path="/rooms/:id/summary" element={p(<Summary />)} />
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </main>
//     </>
//   );
// }




import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';
import Blobs from './components/Blobs';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Rooms from './pages/Rooms';
import Room from './pages/Room';
import Meals from './pages/Meals';
import Deposits from './pages/Deposits';
import Demands from './pages/Demands';
import Spending from './pages/Spending';
import Summary from './pages/Summary';
import Marketplace from './pages/Marketplace';
import Inbox from './pages/Inbox';
import Search from './pages/Search';

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center mt-32 animate-pulse">Loading…</p>;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  const p = (el) => <Private>{el}</Private>;
  return (
    <>
      <Blobs /><Navbar />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/search" element={<Search />} />
          <Route path="/inbox" element={p(<Inbox />)} />
          <Route path="/inbox/:uid" element={p(<Inbox />)} />
          <Route path="/rooms" element={p(<Rooms />)} />
          <Route path="/rooms/:id" element={p(<Room />)} />
          <Route path="/rooms/:id/meals" element={p(<Meals />)} />
          <Route path="/rooms/:id/deposits" element={p(<Deposits />)} />
          <Route path="/rooms/:id/demands" element={p(<Demands />)} />
          <Route path="/rooms/:id/spending" element={p(<Spending />)} />
          <Route path="/rooms/:id/summary" element={p(<Summary />)} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}