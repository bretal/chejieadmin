export const SNIPPET_WEB = `// React + TypeScript 后台系统
import { Routes, Route } from 'react-router-dom';
import AuthGuard from '@/components/AuthGuard';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AuthGuard />}>
        <Route path="/manage" element={<GlassLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}`;

export const SNIPPET_MINAPP = `// 微信小程序 — 原生开发
Page({
  data: {
    carList: [],
    loading: false,
  },
  async onLoad() {
    const db = wx.cloud.database();
    const res = await db
      .collection('cars')
      .limit(20)
      .get();
    this.setData({ carList: res.data });
  },
});`;

export const SNIPPET_ELECTRON = `// Electron 主进程
const { app, BrowserWindow, ipcMain } =
  require('electron');

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(
        __dirname, 'preload.js'),
      contextIsolation: true,
    },
  });
  win.loadURL('http://localhost:3000');
});`;

export const SNIPPET_BACKEND = `// NestJS REST API
@Controller('api/cars')
@UseGuards(JwtAuthGuard)
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Get(':id')
  async getCar(@Param('id') id: string) {
    const car = await this.carService.findById(id);
    return { code: 0, data: car };
  }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateCarDto) {
    return this.carService.create(dto);
  }
}`;
