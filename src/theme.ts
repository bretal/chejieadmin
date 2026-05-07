import type { ThemeConfig } from 'antd';

export const glassTheme: ThemeConfig = {
  token: {
    colorPrimary: '#6366f1',
    borderRadius: 12,
    colorBgContainer: 'rgba(255, 255, 255, 0.08)',
    colorBgElevated: 'rgba(255, 255, 255, 0.12)',
    colorBorder: 'rgba(255, 255, 255, 0.12)',
    colorText: '#e8e8ed',
    colorTextSecondary: '#a0a0b0',
    colorBgLayout: 'transparent',
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    controlHeight: 38,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'rgba(20, 20, 40, 0.6)',
      siderBg: 'rgba(20, 20, 40, 0.4)',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(99, 102, 241, 0.2)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
      itemBorderRadius: 8,
    },
    Table: {
      headerBg: 'rgba(255, 255, 255, 0.06)',
      rowHoverBg: 'rgba(255, 255, 255, 0.04)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    Card: {
      colorBgContainer: 'rgba(255, 255, 255, 0.06)',
    },
    Button: {
      borderRadius: 8,
      controlHeight: 38,
    },
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.08)',
      colorBorder: 'rgba(255, 255, 255, 0.12)',
    },
    Select: {
      colorBgContainer: 'rgba(255, 255, 255, 0.08)',
      colorBorder: 'rgba(255, 255, 255, 0.12)',
    },
    Modal: {
      colorBgElevated: 'rgba(30, 30, 60, 0.95)',
    },
  },
};
