import AnimItem from './AnimItem';

export default function ShowcaseFooter() {
  return (
    <footer className="showcase-footer">
      <AnimItem variant="up" delay={0}>
        <p style={{ margin: 0, letterSpacing: 1 }}>2026 吕浩然 · 全栈开发工程师 · 持续学习中</p>
        {/* <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.5 }}>Built with React + TypeScript + Vite</p> */}
      </AnimItem>
    </footer>
  );
}
