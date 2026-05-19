import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Collapse, Empty, Input, Popconfirm, Space, Table, Tag, Typography, Upload } from 'antd';
import {
  ArrowLeftOutlined,
  ClearOutlined,
  DeleteOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  InboxOutlined,
  LoadingOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { createStyles, keyframes } from 'antd-style';
import {
  chatRAGStream,
  clearSession,
  deleteDocument,
  getTaskStatus,
  uploadDocument,
} from '../../api/rag';

const { Dragger } = Upload;

/* ──────────── types ──────────── */

interface DocInfo {
  md5: string;
  name: string;
  collection: string;
  status: 'processing' | 'done' | 'failed';
  taskId: string;
  uploadTime: number;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sources?: { source: string; content: string }[];
  streaming?: boolean;
}

const DOCS_STORAGE_KEY = 'rag_public_docs';

function loadDocs(): DocInfo[] {
  try {
    return JSON.parse(localStorage.getItem(DOCS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDocs(docs: DocInfo[]) {
  localStorage.setItem(DOCS_STORAGE_KEY, JSON.stringify(docs));
}

function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const SUPPORTED_TYPES = ['.pdf', '.docx', '.md', '.markdown', '.csv', '.txt'];

/* ──────────── keyframes ──────────── */

const fadeInUp = keyframes('fadeInUp', {
  '0%': { opacity: 0, transform: 'translateY(16px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
});

const typingBounce = keyframes('typingBounce', {
  '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
  '30%': { transform: 'translateY(-8px)', opacity: 1 },
});

const floatParticle = keyframes('floatParticle', {
  '0%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: 0 },
  '10%': { opacity: 0.7 },
  '90%': { opacity: 0.2 },
  '100%': { transform: 'translateY(-100vh) translateX(60px) scale(0.4)', opacity: 0 },
});

const shimmer = keyframes('shimmer', {
  '0%': { backgroundPosition: '-200% 0' },
  '100%': { backgroundPosition: '200% 0' },
});

/* ──────────── simple markdown ──────────── */

function SimpleMarkdown({ text }: { text: string }) {
  if (!text) return null;
  const html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ──────────── styles ──────────── */

const useStyles = createStyles(({ css, cssVar }) => {
  const glassSurface = {
    background: `color-mix(in srgb, ${cssVar.colorBgContainer} 34%, transparent)`,
    backdropFilter: 'blur(28px) saturate(140%)',
    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
    border: '1px solid rgba(255, 255, 255, 0.52)',
    boxShadow: '0 18px 48px rgba(28, 75, 128, 0.12), inset 0 0 6px 2px rgba(255, 255, 255, 0.3)',
    borderRadius: 22,
  };

  return {
    page: css({
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }),

    /* floating particles */
    particles: css({
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
    }),
    particle: (i: number) =>
      css({
        position: 'absolute',
        bottom: '-12px',
        left: `${(i * 13 + 7) % 100}%`,
        width: `${(i % 3) + 3}px`,
        height: `${(i % 3) + 3}px`,
        background: i % 2 === 0 ? 'rgba(99, 102, 241, 0.5)' : 'rgba(16, 185, 129, 0.4)',
        borderRadius: '50%',
        animation: `${floatParticle} ${(i % 3) + 6}s ${(i * 0.7).toFixed(1)}s infinite ease-in`,
      }),

    container: css({
      position: 'relative',
      zIndex: 1,
      width: '100%',
      maxWidth: 1100,
      height: 'min(88vh, 800px)',
      display: 'flex',
      gap: 16,
    }),

    /* back button */
    backBtn: css({
      position: 'absolute',
      top: -44,
      left: 0,
      color: 'rgba(31,42,68,0.65)',
      fontSize: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      transition: 'color 0.2s',
      cursor: 'pointer',
      '&:hover': { color: '#1f2a44' },
    }),

    /* doc panel */
    docPanel: css({
      ...glassSurface,
      width: 300,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      '@media (max-width: 768px)': { display: 'none' },
      animation: `${fadeInUp} 0.5s ease both`,
    }),
    docPanelHeader: css({
      padding: '14px 18px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.26)',
      flexShrink: 0,
    }),
    docList: css({
      flex: 1,
      overflow: 'auto',
      padding: 8,
    }),

    /* chat panel */
    chatPanel: css({
      ...glassSurface,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0,
      animation: `${fadeInUp} 0.5s 0.1s ease both`,
    }),
    chatHeader: css({
      padding: '14px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.26)',
      flexShrink: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, rgba(99,102,241,0.3), rgba(16,185,129,0.3), rgba(99,102,241,0.3))',
        backgroundSize: '200% 100%',
        animation: `${shimmer} 3s infinite linear`,
      },
    }),
    titleGlow: css({
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #10b981 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
    }),

    chatMessages: css({
      flex: 1,
      overflow: 'auto',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }),

    chatInputArea: css({
      padding: '12px 20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.26)',
      flexShrink: 0,
    }),

    /* message bubbles */
    userBubble: css({
      alignSelf: 'flex-end',
      maxWidth: '78%',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      color: '#fff',
      padding: '10px 18px',
      borderRadius: '18px 18px 6px 18px',
      fontSize: 14,
      lineHeight: 1.6,
      wordBreak: 'break-word',
      boxShadow: '0 4px 16px rgba(99, 102, 241, 0.28)',
      animation: `${fadeInUp} 0.3s ease both`,
      transition: 'box-shadow 0.2s',
      '&:hover': {
        boxShadow: '0 6px 22px rgba(99, 102, 241, 0.38)',
      },
    }),
    aiBubble: css({
      alignSelf: 'flex-start',
      maxWidth: '88%',
      background: 'color-mix(in srgb, #ffffff 58%, transparent)',
      color: '#1f2a44',
      padding: '12px 20px',
      borderRadius: '18px 18px 18px 6px',
      fontSize: 14,
      lineHeight: 1.7,
      wordBreak: 'break-word',
      border: '1px solid rgba(255, 255, 255, 0.42)',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
      animation: `${fadeInUp} 0.3s ease both`,
      code: {
        background: 'rgba(0,0,0,0.05)',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 13,
      },
      pre: {
        background: 'rgba(0,0,0,0.05)',
        padding: '10px 14px',
        borderRadius: 8,
        overflow: 'auto',
        fontSize: 13,
        margin: '8px 0',
      },
    }),

    /* typing indicator */
    typingIndicator: css({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 0',
    }),
    typingDot: (i: number) =>
      css({
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#6366f1',
        animation: `${typingBounce} 1.4s ${i * 0.15}s infinite ease-in-out`,
      }),

    sourcesBox: css({
      marginTop: 10,
      background: 'rgba(0,0,0,0.025)',
      borderRadius: 12,
      padding: '2px 6px',
    }),
    typingCursor: css({
      display: 'inline-block',
      width: 2,
      height: 15,
      background: '#1f2a44',
      marginLeft: 2,
      animation: 'blink 0.8s infinite',
      verticalAlign: 'text-bottom',
    }),
  };
});

/* ──────────── document table columns ──────────── */

let handleDocDelete: (md5: string, collection: string) => void = () => {};

const docColumns = [
  { title: '文档', dataIndex: 'name', key: 'name', ellipsis: true },
  {
    title: '',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (s: string) => {
      const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
        processing: { color: 'processing', icon: <LoadingOutlined />, label: '处理中' },
        done: { color: 'success', icon: <FileDoneOutlined />, label: '完成' },
        failed: { color: 'error', icon: <ExclamationCircleOutlined />, label: '失败' },
      };
      const item = map[s] ?? map.processing;
      return <Tag color={item.color} icon={item.icon}>{item.label}</Tag>;
    },
  },
  {
    title: '',
    key: 'action',
    width: 40,
    render: (_: unknown, record: DocInfo) => (
      <Popconfirm title="确认删除？" onConfirm={() => handleDocDelete(record.md5, record.collection)}>
        <Button type="text" danger size="small" icon={<DeleteOutlined />} />
      </Popconfirm>
    ),
  },
];

/* ──────────── component ──────────── */

export default function RAGPublicPage() {
  const { styles } = useStyles();
  const { message } = App.useApp();
  const [sessionId] = useState(uid);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [docs, setDocs] = useState<DocInfo[]>(loadDocs);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef(false);

  useEffect(() => {
    handleDocDelete = (md5, collection) => handleDelete(md5, collection);
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // poll tasks
  useEffect(() => {
    const processing = docs.filter((d) => d.status === 'processing');
    if (processing.length === 0) return;

    const timer = setInterval(async () => {
      let changed = false;
      const updated = await Promise.all(
        docs.map(async (d) => {
          if (d.status !== 'processing') return d;
          try {
            const res = await getTaskStatus(d.taskId);
            if (res.status === 'done' || res.status === 'failed') {
              changed = true;
              return { ...d, status: res.status as DocInfo['status'] };
            }
          } catch {
            /* keep processing */
          }
          return d;
        }),
      );
      if (changed) {
        setDocs(updated);
        saveDocs(updated);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [docs]);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleUpload = async (file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_TYPES.includes(ext)) {
      message.error(`不支持的文件类型: ${ext}`);
      return;
    }
    try {
      const res = await uploadDocument(file);
      const newDoc: DocInfo = { md5: '', name: file.name, collection: 'default', status: 'processing', taskId: res.task_id, uploadTime: Date.now() };
      const updated = [newDoc, ...docs];
      setDocs(updated);
      saveDocs(updated);
      message.success(`${file.name} 上传成功，处理中...`);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (detail?.status === 'duplicate') {
        message.warning(`${file.name} 已存在`);
      } else {
        message.error(`上传失败: ${typeof detail === 'string' ? detail : e.message || '未知错误'}`);
      }
    }
  };

  const handleDelete = async (md5: string, collection: string) => {
    try {
      await deleteDocument(md5, collection);
      const updated = docs.filter((d) => !(d.md5 === md5 && d.collection === collection));
      setDocs(updated);
      saveDocs(updated);
      message.success('删除成功');
    } catch (e: any) {
      message.error(`删除失败: ${e?.response?.data?.detail || e.message}`);
    }
  };

  const handleSend = useCallback(async () => {
    const query = input.trim();
    if (!query || streaming) return;

    const userMsg: Message = { id: uid(), role: 'user', content: query };
    const aiMsg: Message = { id: uid(), role: 'ai', content: '', streaming: true };
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
    setStreaming(true);
    streamRef.current = true;

    await chatRAGStream(sessionId, query, 'default', {
      onToken: (token) => {
        if (!streamRef.current) return;
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content + token } : m)));
        scrollToBottom();
      },
      onSources: (sources) => {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, sources } : m)));
      },
      onDone: () => {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, streaming: false } : m)));
        setStreaming(false);
        streamRef.current = false;
      },
      onError: (error) => {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content || `错误: ${error}`, streaming: false } : m)));
        setStreaming(false);
        streamRef.current = false;
      },
    });
  }, [input, streaming, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearSession = async () => {
    try {
      await clearSession(sessionId);
      setMessages([]);
      message.success('会话已清空');
    } catch {
      message.error('清空失败');
    }
  };

  return (
    <div className={styles.page}>
      {/* floating particles */}
      <div className={styles.particles}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} className={styles.particle(i)} />
        ))}
      </div>

      <div className={styles.container}>
        <a className={styles.backBtn} href="/login">
          <ArrowLeftOutlined /> 返回登录
        </a>

        {/* document panel */}
        <div className={styles.docPanel}>
          <div className={styles.docPanelHeader}>
            <Typography.Title level={5} style={{ margin: 0, color: '#1f2a44', fontSize: 15 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              知识库
            </Typography.Title>
          </div>
          <div style={{ padding: '8px 10px' }}>
            <Dragger
              multiple
              showUploadList={false}
              beforeUpload={(file) => { handleUpload(file); return false; }}
              accept={SUPPORTED_TYPES.join(',')}
              style={{ borderRadius: 14 }}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p style={{ fontSize: 12, color: 'rgba(31,42,68,0.55)' }}>上传文档</p>
            </Dragger>
          </div>
          <div className={styles.docList}>
            {docs.length === 0 ? (
              <Empty description="暂无文档" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 30 }} />
            ) : (
              <Table dataSource={docs} columns={docColumns} rowKey="taskId" size="small" pagination={false} showHeader={false} />
            )}
          </div>
        </div>

        {/* chat panel */}
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <Typography.Title level={5} style={{ margin: 0, fontSize: 16 }}>
              <RobotOutlined style={{ marginRight: 8, color: '#6366f1' }} />
              <span className={styles.titleGlow}>RAG 智能问答</span>
            </Typography.Title>
            <Button size="small" icon={<ClearOutlined />} onClick={handleClearSession} disabled={messages.length === 0}>
              清空
            </Button>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="上传知识库文档后，即可提问" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id}>
                  <div className={m.role === 'user' ? styles.userBubble : styles.aiBubble}>
                    <Space align="start" size={8}>
                      {m.role === 'ai' && <RobotOutlined style={{ color: '#6366f1', marginTop: 3 }} />}
                      <div style={{ flex: 1 }}>
                        {m.streaming && m.content.length === 0 ? (
                          <div className={styles.typingIndicator}>
                            <span className={styles.typingDot(0)} />
                            <span className={styles.typingDot(1)} />
                            <span className={styles.typingDot(2)} />
                            <Typography.Text type="secondary" style={{ fontSize: 13, marginLeft: 6 }}>
                              正在翻阅文档，为您生成最准确的回答...
                            </Typography.Text>
                          </div>
                        ) : m.streaming ? (
                          <span>
                            <SimpleMarkdown text={m.content} />
                            <span className={styles.typingCursor} />
                          </span>
                        ) : (
                          <SimpleMarkdown text={m.content} />
                        )}
                      </div>
                      {m.role === 'user' && <UserOutlined style={{ color: 'rgba(255,255,255,0.7)', marginTop: 3 }} />}
                    </Space>
                  </div>
                  {m.sources && m.sources.length > 0 && !m.streaming && (
                    <div className={styles.sourcesBox}>
                      <Collapse
                        ghost
                        size="small"
                        items={[{
                          key: 'sources',
                          label: <Typography.Text style={{ fontSize: 12, color: 'rgba(31,42,68,0.45)' }}>引用来源 ({m.sources.length})</Typography.Text>,
                          children: (
                            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'rgba(31,42,68,0.6)' }}>
                              {m.sources.map((s, i) => (
                                <li key={i} style={{ marginBottom: 6 }}>
                                  <strong>{s.source || '未知来源'}</strong>: {s.content}
                                </li>
                              ))}
                            </ul>
                          ),
                        }]}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <div className={styles.chatInputArea}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <Input.TextArea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入问题，Enter 发送 / Shift+Enter 换行"
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={streaming}
                style={{ flex: 1, borderRadius: 12 }}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={streaming}
                disabled={!input.trim() || streaming}
                style={{ borderRadius: 12, height: 38, flexShrink: 0 }}
              >
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
