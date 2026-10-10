import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, homeFor } from './AuthContext';
import Workspace from './components/Workspace';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenOverview from './pages/CitizenOverview';
import AddItem from './pages/AddItem';
import ItemAdvice from './pages/ItemAdvice';
import RequestPickup from './pages/RequestPickup';
import PickupTracking from './pages/PickupTracking';
import CollectorHome from './pages/CollectorHome';
import CollectorPickup from './pages/CollectorPickup';
import AdminDashboard from './pages/AdminDashboard';
import MyItems from './pages/MyItems';
import MyPickups from './pages/MyPickups';
import CitizenFacilities, { PublicFacilities } from './pages/Facilities';
import Soon from './pages/Soon';

function Guard({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return children;
}

const workspace = (role, index, extra = null) => (
  <Route path={`/${role.toLowerCase()}`} element={<Guard role={role}><Workspace /></Guard>}>
    <Route index element={index} />
    {extra}
    <Route path="*" element={<Soon />} />
  </Route>
);

const citizenRoutes = (
  <>
    <Route path="items" element={<MyItems />} />
    <Route path="pickups" element={<MyPickups />} />
    <Route path="facilities" element={<CitizenFacilities />} />
    <Route path="items/new" element={<AddItem />} />
    <Route path="items/:id" element={<ItemAdvice />} />
    <Route path="items/:id/pickup" element={<RequestPickup />} />
    <Route path="pickups/:id" element={<PickupTracking />} />
  </>
);

const collectorRoutes = (
  <>
    <Route path="assigned" element={<CollectorHome tab="assigned" />} />
    <Route path="completed" element={<CollectorHome tab="completed" />} />
    <Route path="pickups/:id" element={<CollectorPickup />} />
  </>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/facilities" element={<PublicFacilities />} />
      {workspace('CITIZEN', <CitizenOverview />, citizenRoutes)}
      {workspace('COLLECTOR', <CollectorHome tab="available" />, collectorRoutes)}
      {workspace('ADMIN', <AdminDashboard />)}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
