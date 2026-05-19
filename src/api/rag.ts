import axios from 'axios';

const ragApi = axios.create({
  baseURL: '/rag-api',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

ragApi.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err),
);

export interface ChatCallbacks {
  onToken: (token: string) => void;
  onSources: (sources: { source: string; content: string }[]) => void;
  onDone: () => void;
  onError: (error: string) => void;
}

export function uploadDocument(file: File, collection = 'default') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('collection', collection);
  return ragApi.post('/documents/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }) as Promise<{ task_id: string; status: string }>;
}

export function getTaskStatus(taskId: string) {
  return ragApi.get(`/documents/status/${taskId}`) as Promise<{
    task_id: string;
    status: string;
    error: string | null;
  }>;
}

export function searchDocuments(
  query: string,
  collection = 'default',
  topK?: number,
  scoreThreshold?: number,
) {
  return ragApi.post('/documents/search', {
    query,
    collection,
    top_k: topK,
    score_threshold: scoreThreshold,
  }) as Promise<{ results: Array<{ content: string; metadata: Record<string, string>; score: number }> }>;
}

export function deleteDocument(fileMd5: string, collection = 'default') {
  return ragApi.delete(`/documents/${fileMd5}`, { params: { collection } }) as Promise<{
    deleted_chunks: number;
  }>;
}

export function getCollections() {
  return ragApi.get('/documents/collections') as Promise<{ collections: string[] }>;
}

export function chatRAG(
  sessionId: string,
  query: string,
  collection: string,
  topK = 5,
  scoreThreshold = 0.3,
) {
  return ragApi.post('/chat', {
    session_id: sessionId,
    query,
    collection,
    top_k: topK,
    score_threshold: scoreThreshold,
  }) as Promise<{
    session_id: string;
    answer: string;
    sources: Array<{ source: string; content: string }>;
  }>;
}

export function getChatHistory(sessionId: string) {
  return ragApi.get(`/chat/${sessionId}/history`) as Promise<{
    session_id: string;
    messages: Array<{ role: string; content: string }>;
  }>;
}

export function clearSession(sessionId: string) {
  return ragApi.delete(`/chat/${sessionId}`) as Promise<{ session_id: string; status: string }>;
}

export async function chatRAGStream(
  sessionId: string,
  query: string,
  collection: string,
  callbacks: ChatCallbacks,
  topK = 5,
  scoreThreshold = 0.3,
) {
  const { onToken, onSources, onDone, onError } = callbacks;
  try {
    const res = await fetch('/rag-api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        query,
        collection,
        top_k: topK,
        score_threshold: scoreThreshold,
      }),
    });

    if (!res.ok) {
      onError(`HTTP ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError('浏览器不支持流式响应');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(trimmed.slice(6));
          switch (event.type) {
            case 'token':
              onToken(event.content);
              break;
            case 'sources':
              onSources(event.sources);
              break;
            case 'done':
              onDone();
              break;
          }
        } catch {
          // skip malformed JSON
        }
      }
    }
  } catch (e) {
    onError(e instanceof Error ? e.message : '网络请求失败');
  }
}
