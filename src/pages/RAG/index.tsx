import { useCallback, useEffect, useRef, useState } from 'react';
import { App, Button, Collapse, Empty, Input, Popconfirm, Space, Table, Tag, Typography, Upload } from 'antd';
import {
  DeleteOutlined,
  InboxOutlined,
  RobotOutlined,
  SendOutlined,
  UserOutlined,
  ClearOutlined,
  LoadingOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { createStyles } from 'antd-style';
import {
  chatRAGStream,
  clearSession,
  deleteDocument,
  getChatHistory,
  getTaskStatus,
  getUserFiles,
  uploadDocument,
} from '../../api/rag';
import { isGuest } from '../../auth/token';

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

function uid() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const SUPPORTED_TYPES = ['.pdf', '.docx', '.md', '.markdown', '.csv', '.txt'];

const docColumns = [
  {
    title: '文件名',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (s: string) => {
      const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
        processing: { color: 'processing', icon: <LoadingOutlined />, label: '处理中' },
        done: { color: 'success', icon: <FileDoneOutlined />, label: '已完成' },
        failed: { color: 'error', icon: <ExclamationCircleOutlined />, label: '失败' },
      };
      const item = map[s] ?? map.processing;
      return <Tag color={item.color} icon={item.icon}>{item.label}</Tag>;
    },
  },
  {
    title: '操作',
    key: 'action',
    width: 60,
    render: (_: unknown, record: DocInfo) => (
      <Popconfirm title="确认删除？" onConfirm={() => handleDocDelete(record.md5, record.collection)}>
        <Button type="text" size="small" icon={<DeleteOutlined />} style={{ color: '#ef4444' }} />
      </Popconfirm>
    ),
  },
];

// global ref for delete handler (set by RAGPage)
let handleDocDelete: (md5: string, collection: string) => void = () => {};

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
  const glassPanel = {
    background: `color-mix(in srgb, ${cssVar.colorBgContainer} 34%, transparent)`,
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255, 255, 255, 0.56)',
    boxShadow: '0 18px 48px rgba(28, 75, 128, 0.14), inset 0 0 5px 2px rgba(255, 255, 255, 0.34)',
    borderRadius: 20,
  };

  return {
    wrapper: css({
      height: '100%',
      display: 'flex',
      gap: 16,
    }),
    leftPanel: css({
      ...glassPanel,
      width: 360,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }),
    rightPanel: css({
      ...glassPanel,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      minWidth: 0,
    }),
    panelHeader: css({
      padding: '16px 20px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.28)',
      flexShrink: 0,
    }),
    docList: css({
      flex: 1,
      overflow: 'auto',
      padding: 8,
    }),
    chatMessages: css({
      flex: 1,
      overflow: 'auto',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }),
    chatInputArea: css({
      padding: '12px 20px',
      borderTop: '1px solid rgba(255, 255, 255, 0.28)',
      flexShrink: 0,
    }),
    userBubble: css({
      alignSelf: 'flex-end',
      maxWidth: '80%',
      background: 'color-mix(in srgb, #6366f1 45%, transparent)',
      color: '#fff',
      padding: '10px 16px',
      borderRadius: '16px 16px 4px 16px',
      fontSize: 14,
      lineHeight: 1.6,
      wordBreak: 'break-word',
    }),
    aiBubble: css({
      alignSelf: 'flex-start',
      maxWidth: '90%',
      background: 'color-mix(in srgb, #ffffff 55%, transparent)',
      color: '#1f2a44',
      padding: '12px 18px',
      borderRadius: '16px 16px 16px 4px',
      fontSize: 14,
      lineHeight: 1.7,
      wordBreak: 'break-word',
      code: {
        background: 'rgba(0,0,0,0.06)',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: 13,
      },
      pre: {
        background: 'rgba(0,0,0,0.06)',
        padding: '10px 14px',
        borderRadius: 8,
        overflow: 'auto',
        fontSize: 13,
        margin: '8px 0',
      },
    }),
    sourcesBox: css({
      marginTop: 10,
      background: 'rgba(0,0,0,0.03)',
      borderRadius: 10,
      padding: '2px 4px',
    }),
    typingCursor: css({
      display: 'inline-block',
      width: 2,
      height: 16,
      background: '#1f2a44',
      marginLeft: 2,
      animation: 'blink 0.8s infinite',
      verticalAlign: 'text-bottom',
    }),
  };
});

/* ──────────── component ──────────── */

export default function RAGPage() {
  const { styles } = useStyles();
  const { message, modal } = App.useApp();
  const [sessionId] = useState(uid);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [docs, setDocs] = useState<DocInfo[]>([]);

  // load user's files from server on mount
  useEffect(() => {
    getUserFiles().then((res) => {
      if (res.files?.length) {
        setDocs(res.files.map((f) => ({
          md5: f.md5,
          name: f.name,
          collection: f.collection,
          status: 'done' as const,
          taskId: '',
          uploadTime: Date.now(),
        })));
      }
    }).catch(() => {});
  }, []);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef(false);

  // expose delete handler for table column
  useEffect(() => {
    handleDocDelete = (md5, collection) => handleDelete(md5, collection);
  });

  // scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // poll task statuses
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
            // task not found, keep as processing
          }
          return d;
        }),
      );
      if (changed) {
        setDocs(updated);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [docs]);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleUpload = async (file: File) => {
    if (isGuest() && docs.length >= 1) {
      modal.warning({
        title: 'RAG仅支持访客用户体验一次',
        content: '您已上传过文件，访客模式下仅支持上传一个文件进行体验。如需更多功能，请注册账号登录。',
      });
      return;
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!SUPPORTED_TYPES.includes(ext)) {
      message.error(`不支持的文件类型: ${ext}`);
      return;
    }

    try {
      const res = await uploadDocument(file);
      const newDoc: DocInfo = {
        md5: res.file_md5 || '',
        name: file.name,
        collection: 'default',
        status: 'processing',
        taskId: res.task_id,
        uploadTime: Date.now(),
      };
      const updated = [newDoc, ...docs];
      setDocs(updated);
      message.success(`${file.name} 上传成功，后台处理中...`);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      if (detail?.status === 'duplicate') {
        message.warning(`${file.name} 已存在，无需重复上传`);
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

    await chatRAGStream(
      sessionId,
      query,
      'default',
      {
        onToken: (token) => {
          if (!streamRef.current) return;
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, content: m.content + token } : m)),
          );
          scrollToBottom();
        },
        onSources: (sources) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, sources } : m)),
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) => (m.id === aiMsg.id ? { ...m, streaming: false } : m)),
          );
          setStreaming(false);
          streamRef.current = false;
        },
        onError: (error) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsg.id ? { ...m, content: m.content || `错误: ${error}`, streaming: false } : m,
            ),
          );
          setStreaming(false);
          streamRef.current = false;
        },
      },
    );
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

  // load history on mount
  useEffect(() => {
    getChatHistory(sessionId)
      .then((res) => {
        if (res.messages?.length) {
          setMessages(
            res.messages.map((m) => ({
              id: uid(),
              role: m.role as 'user' | 'ai',
              content: m.content,
            })),
          );
        }
      })
      .catch(() => {
        // no history yet, ignore
      });
  }, [sessionId]);

  return (
    <div className={styles.wrapper}>
      {/* ── left: document management ── */}
      <div className={styles.leftPanel}>
        <div className={styles.panelHeader}>
          <Typography.Title level={5} style={{ margin: 0, color: '#1f2a44' }}>
            <FileTextOutlined style={{ marginRight: 8 }} />
            知识库文档
          </Typography.Title>
        </div>

        <div style={{ padding: '12px 16px' }}>
          <Dragger
            multiple
            showUploadList={false}
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
            accept={SUPPORTED_TYPES.join(',')}
            style={{ borderRadius: 14 }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p style={{ fontSize: 13, color: 'rgba(31,42,68,0.6)' }}>
              点击或拖拽上传 (PDF / DOCX / MD / CSV / TXT)
            </p>
          </Dragger>
        </div>

        <div className={styles.docList}>
          {docs.length === 0 ? (
            <Empty description="暂无文档" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />
          ) : (
            <Table
              dataSource={docs}
              columns={docColumns}
              rowKey="taskId"
              size="small"
              pagination={false}
              showHeader={false}
              scroll={{ y: 'calc(100vh - 360px)' }}
            />
          )}
        </div>
      </div>

      {/* ── right: chat ── */}
      <div className={styles.rightPanel}>
        <div className={styles.panelHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Title level={5} style={{ margin: 0, color: '#1f2a44' }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            RAG 对话
          </Typography.Title>
          <Button size="small" icon={<ClearOutlined />} onClick={handleClearSession} disabled={messages.length === 0}>
            清空会话
          </Button>
        </div>

        <div className={styles.chatMessages}>
          {messages.length === 0 ? (
            <Empty
              description="上传文档后，在此提问即可检索知识库"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 80 }}
            />
          ) : (
            messages.map((m) => (
              <div key={m.id}>
                <div className={m.role === 'user' ? styles.userBubble : styles.aiBubble}>
                  <Space align="start" size={8}>
                    {m.role === 'ai' && <RobotOutlined style={{ color: '#6366f1', marginTop: 3 }} />}
                    <div style={{ flex: 1 }}>
                      {m.streaming && m.content.length === 0 ? (
                        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                          <LoadingOutlined style={{ marginRight: 6 }} />
                          正在翻阅文档，为您生成最准确的回答...
                        </Typography.Text>
                      ) : m.streaming ? (
                        <span>
                          <SimpleMarkdown text={m.content} />
                          <span className={styles.typingCursor} />
                        </span>
                      ) : (
                        <SimpleMarkdown text={m.content} />
                      )}
                    </div>
                    {m.role === 'user' && <UserOutlined style={{ color: '#ccc', marginTop: 3 }} />}
                  </Space>
                </div>
                {m.sources && m.sources.length > 0 && !m.streaming && (
                  <div className={styles.sourcesBox}>
                    <Collapse
                      ghost
                      size="small"
                      items={[
                        {
                          key: 'sources',
                          label: <Typography.Text style={{ fontSize: 12, color: 'rgba(31,42,68,0.5)' }}>引用来源 ({m.sources.length})</Typography.Text>,
                          children: (
                            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'rgba(31,42,68,0.65)' }}>
                              {m.sources.map((s, i) => (
                                <li key={i} style={{ marginBottom: 6 }}>
                                  <strong>{s.source || '未知来源'}</strong>: {s.content}
                                </li>
                              ))}
                            </ul>
                          ),
                        },
                      ]}
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
              placeholder="输入问题，按 Enter 发送 (Shift+Enter 换行)"
              autoSize={{ minRows: 1, maxRows: 5 }}
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
              {streaming ? '回答中...' : '发送'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
