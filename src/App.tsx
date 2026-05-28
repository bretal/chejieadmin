import { Routes, Route } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import useGlassTheme from './glassTheme';
import AuthGuard from './components/AuthGuard';
import GlassLayout from './components/GlassLayout';
import ShowcasePage from './pages/Showcase';
import LoginPage from './pages/Login';
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
import RAGPage from './pages/RAG';
import RAGPublicPage from './pages/RAGPublic';
import MicroHost from './pages/MicroHost';

export default function App() {
  const glassConfig = useGlassTheme();

  return (
    <ConfigProvider {...glassConfig} locale={zhCN}>
      <AntdApp>
        <Routes>
          <Route path="/" element={<ShowcasePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/rag-public" element={<RAGPublicPage />} />

          <Route element={<AuthGuard />}>
            <Route path="/admin" element={<GlassLayout />}>
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
              <Route path="apps/next/*" element={<MicroHost appKey="next" />} />
              <Route path="rag" element={<RAGPage />} />
            </Route>
          </Route>
        </Routes>
      </AntdApp>
    </ConfigProvider>
  );
}
