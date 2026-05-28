import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { App, Layout, Menu, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  CarOutlined,
  SettingOutlined,
  PictureOutlined,
  BgColorsOutlined,
  SwapOutlined,
  UserOutlined,
  IdcardOutlined,
  PictureFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { clearToken, getToken, getClientId } from '../../auth/token';
import { logout } from '../../api/auth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/admin/brand', icon: <IdcardOutlined />, label: '品牌管理' },
  { key: '/admin/car', icon: <CarOutlined />, label: '车型管理' },
  { key: '/admin/car-config', icon: <SettingOutlined />, label: '配置管理' },
  { key: '/admin/car-media', icon: <PictureOutlined />, label: '媒体管理' },
  { key: '/admin/car-color', icon: <BgColorsOutlined />, label: '颜色管理' },
  { key: '/admin/car-rival', icon: <SwapOutlined />, label: '竞品关系' },
  { key: '/admin/persona', icon: <UserOutlined />, label: '用户画像' },
  { key: '/admin/persona-car', icon: <SwapOutlined />, label: '画像推荐' },
  { key: '/admin/banner', icon: <PictureFilled />, label: 'Banner管理' },
  { key: '/admin/apps/next', icon: <AppstoreOutlined />, label: 'Next 子应用' },
  { key: '/admin/rag', icon: <RobotOutlined />, label: 'RAG 助手' },
];

export default function GlassLayout() {
  const { modal } = App.useApp();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    modal.confirm({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      okText: '退出',
      cancelText: '取消',
      onOk: async () => {
        try {
          const token = getToken();
          const clientId = getClientId();
          if (token && clientId) {
            await logout(token, clientId);
          }
        } catch {
          // 即使后端登出失败也清除本地状态
        }
        clearToken();
        navigate('/login', { replace: true });
      },
    });
  };

  const shellSurface = {
    background: 'color-mix(in srgb, #ffffff 34%, transparent)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255, 255, 255, 0.56)',
    boxShadow: '0 18px 48px rgba(28, 75, 128, 0.14), inset 0 0 5px 2px rgba(255, 255, 255, 0.34)',
  };

  return (
    <Layout style={{ height: '100vh', background: 'transparent', padding: 16, gap: 16 }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={{
          ...shellSurface,
          overflow: 'hidden',
          borderRadius: 24,
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(77, 114, 152, 0.1)',
        }}>
          <Typography.Title level={4} style={{
            color: '#1f2a44',
            margin: 0,
            whiteSpace: 'nowrap',
            letterSpacing: 2,
          }}>
            {collapsed ? '车界' : '车界 · 管理后台'}
          </Typography.Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[
            menuItems
              .filter((item) =>
                location.pathname === item.key || location.pathname.startsWith(`${item.key}/`),
              )
              .sort((a, b) => b.key.length - a.key.length)[0]?.key ?? '/admin',
          ]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            borderRight: 'none',
            padding: '8px',
          }}
        />
      </Sider>
      <Layout style={{ minWidth: 0, background: 'transparent' }}>
        <Header style={{
          ...shellSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderRadius: 24,
          height: 64,
          lineHeight: '64px',
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#1f2a44', fontSize: 16 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Typography.Text style={{ color: 'rgba(31, 42, 68, 0.62)', fontSize: 13 }}>
              车界数据管理平台
            </Typography.Text>
            <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: '#1f2a44' }}>
              退出
            </Button>
          </div>
        </Header>
        <Content style={{
          marginTop: 16,
          padding: 8,
          overflow: 'auto',
          height: 'calc(100vh - 112px)',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
