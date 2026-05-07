import { Routes, Route } from 'react-router-dom';
import GlassLayout from './components/GlassLayout';
import Dashboard from './pages/Dashboard';
import BrandPage from './pages/Brand';
import CarPage from './pages/Car';
import CarConfigPage from './pages/CarConfig';
import CarMediaPage from './pages/CarMedia';
import CarColorPage from './pages/CarColor';
import CarRivalPage from './pages/CarRival';
import PersonaPage from './pages/Persona';
import PersonaCarPage from './pages/PersonaCar';
import BannerPage from './pages/Banner';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<GlassLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="brand" element={<BrandPage />} />
        <Route path="car" element={<CarPage />} />
        <Route path="car-config" element={<CarConfigPage />} />
        <Route path="car-media" element={<CarMediaPage />} />
        <Route path="car-color" element={<CarColorPage />} />
        <Route path="car-rival" element={<CarRivalPage />} />
        <Route path="persona" element={<PersonaPage />} />
        <Route path="persona-car" element={<PersonaCarPage />} />
        <Route path="banner" element={<BannerPage />} />
      </Route>
    </Routes>
  );
}
