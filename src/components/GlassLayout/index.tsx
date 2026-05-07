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

const siderStyle: React.CSSProperties = {
  background: 'rgba(20, 20, 50, 0.35)',
  backdropFilter: 'blur(24px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.08)',
};

const headerStyle: React.CSSProperties = {
  background: 'rgba(20, 20, 50, 0.25)',
  backdropFilter: 'blur(20px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
};

const contentStyle: React.CSSProperties = {
  padding: 24,
  overflow: 'auto',
  height: 'calc(100vh - 64px)',
};

export default function GlassLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ height: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={200}
        style={siderStyle}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Typography.Title level={4} style={{
            color: '#e8e8ed',
            margin: 0,
            whiteSpace: 'nowrap',
            letterSpacing: 2,
          }}>
            {collapsed ? '车界' : '车界 · 管理后台'}
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
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
      <Layout>
        <Header style={headerStyle}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ color: '#e8e8ed', fontSize: 16 }}
          />
          <Typography.Text style={{ color: '#a0a0b0', fontSize: 13 }}>
            车界数据管理平台
          </Typography.Text>
        </Header>
        <Content style={contentStyle}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
