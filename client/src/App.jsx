import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Readings from './pages/Readings';
import Register from './pages/Register';
import Reports from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/readings" element={<Readings />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/readings" replace />} />
      <Route path="*" element={<Navigate to="/readings" replace />} />
    </Routes>
  );
}
