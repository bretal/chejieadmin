import { Link } from 'react-router-dom';
import './showcase.css';
import {
  AnimItem,
  Carousel,
  CodeBlock,
  Hero,
  MediaCarousel,
  Section,
  ShowcaseFooter,
} from './components';
import { RAG_PUBLIC_PATH } from './constants';
import { SNIPPET_BACKEND, SNIPPET_ELECTRON } from './snippets';
import { MINIAPP_DEMO_ITEMS } from './miniappDemos';
import { WEB_DEMO_ITEMS } from './webDemos';

const TECH_CAROUSEL_ITEMS = [
  {
    title: 'Web后台管理系统/性能优化',
    desc: '已从0到1开发到上线多个复杂企业级后台，基于 React + TypeScript + Ant Design 构建(技术栈react/vue全家桶均有涉及)，具备权限管理、动态路由、全流程商用部署cdn、打包体积优化等能力。',
    tags: ['React 19','Vue2/3','TypeScript', 'AntDesign6','react-router/vue-router', 'cdn加速', 'webpack/vite','Pinia/Vuex/Redux/Zustand'],
  },
  {
    title: '多端小程序',
    desc: '原生多端小程序开发，熟悉跨端差异化处理、搭建项目、架构设计、地图等流程，已独立交付多个商用小程序（蜂采、游安徽），可以微信小程序搜索访问。',
    tags: ['Taro/UniApp', '地图 API', '支付', '小程序'],
  },
  {
    title: 'Electron 桌面应用',
    desc: '基于 Electron + React 构建跨平台桌面客户端，集成系统级 API，实现窗口管理、本地存储、自动更新等。',
    tags: ['Electron', 'Node.js', 'IPC 通信', '自动更新', '跨平台','Vue/React全家桶'],
  },
  {
    title: '后端能力支撑',
    desc: '掌握 Node.js 与 Nest.js，了解后端架构，熟悉nestjs的设计模式落地通过nestjs开发过双token校验、权限管理、数据分页、数据缓存、websocket前后端独自开发，熟悉 MySQL/Redis数据库，拥有CRUD业务操作能力。了解docker化部署，并在实际工作中落地实践。',
    tags: ['Node.js', 'Nest.js', 'MySQL', 'Redis', 'Docker', 'Nginx'],
  },
  {
    title: 'AI 能力集成',
    desc: '熟练集成大语言模型（LLM），掌握 RAG 检索增强生成、Agent 开发、知识库构建等 AI 工程化实践。已落地多个项目，如：AI客服、AI问答、AI助手等。感兴趣可以在本页AI模块点击访问我个人的RAG系统。',
    tags: ['RAG', 'LangChain', 'LlamaIndex', 'Chroma', 'Milvus', 'Pinecone', 'OpenAI', 'Anthropic', 'Google', 'Azure', 'Prompt Engineering'],
  },
];

export default function ShowcasePage() {
  return (
    <div className="showcase">
      <Hero />
      <Section
        id="tech"
        title="技术能力全景"
        desc="多年全栈开发经验，覆盖 Web、移动端、桌面端及 AI 领域，追求极致用户体验与工程化效率。"
      >
        <AnimItem variant="up" delay={2}>
          <Carousel items={TECH_CAROUSEL_ITEMS} />
        </AnimItem>
      </Section>

      <Section
        id="web"
        title="Web 管理系统"
        desc="多年深耕企业级后台管理系统的设计与开发，沉淀了完善的技术体系与最佳实践。"
      >
        <AnimItem variant="up" delay={2}>
          <MediaCarousel items={WEB_DEMO_ITEMS} />
        </AnimItem>
      </Section>

      <Section
        id="miniapp"
        title="移动多端小程序开发"
        desc="具备完整的多端小程序从 0 到 1 交付能力，涵盖前端开发、跨端差异化解决、上线发布全流程。"
      >
        <AnimItem variant="up" delay={2}>
          <MediaCarousel items={MINIAPP_DEMO_ITEMS} />
        </AnimItem>
      </Section>

      <Section
        id="electron"
        // number="04 / 模块"
        title="Electron 桌面应用"
        desc="将 Web 技术带入桌面端，构建高性能、原生体验的跨平台桌面客户端。"
      >
        <div className="two-col" style={{ marginTop: 56 }}>
          <AnimItem variant="left" delay={2}>
            <div className="col-text">
              <ul className="skill-list">
                <li><span className="skill-dot" />Electron + React 跨平台桌面应用架构</li>
                <li><span className="skill-dot" />主进程 / 渲染进程 IPC 通信机制</li>
                <li><span className="skill-dot" />系统托盘、全局快捷键、通知等原生能力</li>
                <li><span className="skill-dot" />SQLite 本地数据库 + 数据持久化方案</li>
                <li><span className="skill-dot" />electron-updater 自动更新与版本管理</li>
                <li><span className="skill-dot" />打包优化 (electron-builder) 与签名分发</li>
              </ul>
            </div>
          </AnimItem>
          <AnimItem variant="right" delay={3}>
            <div className="col-visual">
              <CodeBlock code={SNIPPET_ELECTRON} />
            </div>
          </AnimItem>
        </div>
      </Section>

      <Section
        id="backend"
        // number="05 / 模块"
        title="后端能力支撑"
        desc="具备全栈思维，能够独立完成后端服务的设计、开发与部署，理解前后端协作的最佳边界。"
      >
        <div className="two-col reverse-mobile" style={{ marginTop: 56 }}>
          <AnimItem variant="left" delay={2}>
            <div className="col-visual">
              <CodeBlock code={SNIPPET_BACKEND} />
            </div>
          </AnimItem>
          <AnimItem variant="right" delay={3}>
            <div className="col-text">
              <ul className="skill-list">
                <li><span className="skill-dot" />Node.js Nest.js 双技术栈</li>
                <li><span className="skill-dot" />MySQL 数据库设计、索引优化与慢查询治理</li>
                <li><span className="skill-dot" />Redis 缓存策略：分布式锁、消息队列、限流</li>
                <li><span className="skill-dot" />RESTful API 设计规范与接口文档 (OpenAPI)</li>
                <li><span className="skill-dot" />Docker 容器化 + Nginx 反向代理 + CI/CD 部署</li>
                <li><span className="skill-dot" />OAuth 2.0 认证、RBAC 权限模型设计</li>
              </ul>
            </div>
          </AnimItem>
        </div>
      </Section>

      <Section
        id="ai"
        // number="06 / 模块"
        title="AI 能力展示"
        desc="拥抱 AI 时代，将大语言模型能力落地为实际产品功能，提升应用的智能化水平。"
      >
        <div className="two-col" style={{ marginTop: 56 }}>
          <AnimItem variant="left" delay={2}>
            <div className="col-text">
              <ul className="skill-list">
                <li><span className="skill-dot" />RAG 检索增强生成：知识库 + 语义检索 + LLM 回答</li>
                <li><span className="skill-dot" />LangChain(项目使用) / LlamaIndex 框架应用开发</li>
                <li><span className="skill-dot" />向量数据库 (Chroma / qdrant(项目使用) / Pinecone) 集成</li>
                <li><span className="skill-dot" />AI Agent 多轮对话与工具调用（Function Calling）</li>
                <li><span className="skill-dot" />Prompt Engineering 提示词优化与模板管理</li>
                <li><span className="skill-dot" />文档解析、Embedding 向量化与语义分块(项目使用)</li>
              </ul>
              <Link to={RAG_PUBLIC_PATH} className="showcase-rag-link">
                进入 RAG 智能问答
              </Link>
            </div>
          </AnimItem>
          <AnimItem variant="right" delay={3}>
            <div className="col-visual">
              <div className="chat-visual">
                <AnimItem variant="scale" delay={4}>
                  <div className="chat-bubble user">
                    <div className="bubble-label">用户</div>
                    帮我分析一下最近 30 天的车型销量趋势
                  </div>
                </AnimItem>
                <AnimItem variant="scale" delay={5}>
                  <div className="chat-bubble ai">
                    <div className="bubble-label">AI 助手</div>
                    根据知识库数据，近 30 天 SUV 车型销量环比增长 12.3%，轿车基本持平。
                    其中新能源车型占比已突破 45%，建议重点关注混合动力细分市场的竞争格局变化。
                    <div style={{ marginTop: 8, color: 'var(--text-dim)', fontSize: 12 }}>
                      数据来源：销售数据库 · 知识库检索 · 实时分析
                    </div>
                  </div>
                </AnimItem>
              </div>
            </div>
          </AnimItem>
        </div>
      </Section>

      <ShowcaseFooter />
    </div>
  );
}
