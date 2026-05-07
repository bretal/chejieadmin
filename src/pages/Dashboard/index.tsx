import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import { CarOutlined, IdcardOutlined, SettingOutlined, PictureFilled } from '@ant-design/icons';
import { getCarList } from '../../api/car';
import { getBrandList } from '../../api/brand';
import { getConfigList } from '../../api/carConfig';
import { getBannerList } from '../../api/banner';

export default function Dashboard() {
  const [stats, setStats] = useState({ brands: 0, cars: 0, configs: 0, banners: 0 });

  useEffect(() => {
    Promise.all([
      getBrandList({ pageNum: 1, pageSize: 1 }),
      getCarList({ pageNum: 1, pageSize: 1 }),
      getConfigList({ pageNum: 1, pageSize: 1 }),
      getBannerList({ pageNum: 1, pageSize: 1 }),
    ]).then(([br, ca, cf, bn]: any[]) => {
      setStats({
        brands: br?.total || 0,
        cars: ca?.total || 0,
        configs: cf?.total || 0,
        banners: bn?.total || 0,
      });
    });
  }, []);

  const cards = [
    { title: '品牌数', value: stats.brands, icon: <IdcardOutlined />, color: '#6366f1' },
    { title: '车型数', value: stats.cars, icon: <CarOutlined />, color: '#10b981' },
    { title: '配置数', value: stats.configs, icon: <SettingOutlined />, color: '#f59e0b' },
    { title: 'Banner', value: stats.banners, icon: <PictureFilled />, color: '#ef4444' },
  ];

  return (
    <div>
      <Typography.Title level={3} style={{ color: '#e8e8ed', marginBottom: 24 }}>
        仪表盘
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <Card
              style={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
              }}
            >
              <Statistic
                title={<span style={{ color: '#a0a0b0' }}>{c.title}</span>}
                value={c.value}
                prefix={<span style={{ color: c.color }}>{c.icon}</span>}
                valueStyle={{ color: '#e8e8ed', fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
