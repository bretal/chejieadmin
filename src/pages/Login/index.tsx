import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { App, Button, Card, Checkbox, Form, Input, Typography, theme } from 'antd';
import { LockOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import { assertBusinessSuccess, extractToken, extractClientId, login, type LoginParams } from '../../api/auth';
import { getErrorMessage } from '../../api/request';
import { isAuthenticated, setToken, setClientId } from '../../auth/token';

const { useToken } = theme;

const useStyles = createStyles(({ css, cssVar }) => {
  const glassCard = {
    background: `color-mix(in srgb, ${cssVar.colorBgContainer} 38%, transparent)`,
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255, 255, 255, 0.56)',
    boxShadow:
      '0 18px 48px rgba(28, 75, 128, 0.14), inset 0 0 5px 2px rgba(255, 255, 255, 0.34)',
    borderRadius: 24,
  };

  return {
    page: css({
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
    }),
    panel: css({
      ...glassCard,
      width: '100%',
      maxWidth: 440,
      padding: '40px 36px 32px',
    }),
    brand: css({
      textAlign: 'center',
      marginBottom: 32,
    }),
    title: css({
      margin: '0 0 10px !important',
      color: '#1f2a44',
      letterSpacing: 2,
      fontWeight: 600,
    }),
    subtitle: css({
      color: 'rgba(31, 42, 68, 0.58)',
      fontSize: 13,
    }),
    formItem: css({
      marginBottom: 20,
    }),
    rememberRow: css({
      marginBottom: 24,
    }),
    submitBtn: css({
      height: 44,
      fontSize: 16,
      fontWeight: 500,
      borderRadius: 12,
      letterSpacing: 1,
    }),
    footer: css({
      textAlign: 'center',
      marginTop: 20,
      color: 'rgba(31, 42, 68, 0.38)',
      fontSize: 12,
    }),
  };
});

type LoginFormValues = Omit<LoginParams, 'clientId' | 'grantType' | 'tenantId'> & { remember?: boolean };

const DEFAULT_CLIENT_ID = 'e5cd7e4891bf95d1d19206ce24a7b32e';
const DEFAULT_GRANT_TYPE = 'password';
const DEFAULT_TENANT_ID = '000000';

export default function LoginPage() {
  const { styles } = useStyles();
  const { token: themeToken } = useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();

  if (isAuthenticated()) {
    const redirect = searchParams.get('redirect') || '/admin';
    return <Navigate to={redirect} replace />;
  }

  const onFinish = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      const res = await login({
        clientId: DEFAULT_CLIENT_ID,
        grantType: DEFAULT_GRANT_TYPE,
        tenantId: DEFAULT_TENANT_ID,
        username: values.username.trim(),
        password: values.password,
      });
      assertBusinessSuccess(res);
      const token = extractToken(res);
      if (!token) {
        message.error('登录成功但未返回 token，请检查后端响应格式');
        return;
      }
      setToken(token);

      const cid = extractClientId(res);
      if (cid) {
        setClientId(cid);
      }

      message.success('登录成功');
      const fromState = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const redirect = searchParams.get('redirect') || fromState || '/admin';
      navigate(redirect, { replace: true });
    } catch (error) {
      message.error(getErrorMessage(error, '登录失败，请检查用户名或密码'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Card className={styles.panel} variant="borderless">
        <div className={styles.brand}>
          <Typography.Title level={3} className={styles.title}>
            车界 · 管理后台
          </Typography.Title>
          <Typography.Text className={styles.subtitle}>请登录后继续操作</Typography.Text>
        </div>

        <Form<LoginFormValues>
          form={form}
          name="login"
          layout="vertical"
          size="large"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            className={styles.formItem}
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { whitespace: true, message: '用户名不能为空格' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: themeToken.colorTextQuaternary }} />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            className={styles.formItem}
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 1, message: '密码不能为空' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: themeToken.colorTextQuaternary }} />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <div className={styles.rememberRow}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={submitting}
            className={styles.submitBtn}
          >
            登 录
          </Button>
        </Form>

        <div className={styles.footer}>
          <a
            href="/rag-public"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 20px',
              borderRadius: 20,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 1,
              transition: 'all 0.3s',
              boxShadow: '0 4px 14px rgba(99,102,241,0.32)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.32)';
            }}
          >
            <RobotOutlined /> RAG 智能问答
          </a>
          <div style={{ marginTop: 12 }}>车界数据管理平台 v1.0</div>
        </div>
      </Card>
    </div>
  );
}
