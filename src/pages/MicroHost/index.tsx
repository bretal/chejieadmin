import { Typography, Card, Alert } from 'antd';
import { getMicroApp, type MicroAppKey } from '../../micro/registry';

interface MicroHostProps {
  appKey: MicroAppKey;
}

/**
 * qiankun 子应用挂载点（预留）
 * 设置环境变量 VITE_MICRO_NEXT_ENTRY 后，在此接入 registerMicroApps / start
 */
export default function MicroHost({ appKey }: MicroHostProps) {
  const config = getMicroApp(appKey);

  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 16 }}>
        {config.name}
      </Typography.Title>

      {!config.enabled ? (
        <Card>
          <Alert
            type="info"
            showIcon
            message="子应用接入位已预留"
            description={
              <>
                <p>当前未配置子应用入口。Next.js 项目就绪后：</p>
                <ol style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                  <li>子应用按 qiankun 规范导出 bootstrap / mount / unmount</li>
                  <li>
                    在本项目 <code>.env</code> 中设置{' '}
                    <code>VITE_MICRO_NEXT_ENTRY=子应用地址</code>
                  </li>
                  <li>在 <code>src/pages/MicroHost</code> 中启用 qiankun 注册逻辑</li>
                </ol>
                <p style={{ marginTop: 12, marginBottom: 0 }}>
                  路由前缀：<code>{config.activeRule}</code> · 容器：<code>{config.container}</code>
                </p>
              </>
            }
          />
        </Card>
      ) : (
        <div
          id={config.container.replace('#', '')}
          style={{ minHeight: 'calc(100vh - 180px)' }}
        />
      )}
    </div>
  );
}
