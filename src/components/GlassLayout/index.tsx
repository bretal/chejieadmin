import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography } from 'antd';
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
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/brand', icon: <IdcardOutlined />, label: '品牌管理' },
  { key: '/car', icon: <CarOutlined />, label: '车型管理' },
  { key: '/car-config', icon: <SettingOutlined />, label: '配置管理' },
  { key: '/car-media', icon: <PictureOutlined />, label: '媒体管理' },
  { key: '/car-color', icon: <BgColorsOutlined />, label: '颜色管理' },
  { key: '/car-rival', icon: <SwapOutlined />, label: '竞品关系' },
  { key: '/persona', icon: <UserOutlined />, label: '用户画像' },
  { key: '/persona-car', icon: <SwapOutlined />, label: '画像推荐' },
  { key: '/banner', icon: <PictureFilled />, label: 'Banner管理' },
];

export default function GlassLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
          selectedKeys={[location.pathname]}
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
          <Typography.Text style={{ color: 'rgba(31, 42, 68, 0.62)', fontSize: 13 }}>
            车界数据管理平台
          </Typography.Text>
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
