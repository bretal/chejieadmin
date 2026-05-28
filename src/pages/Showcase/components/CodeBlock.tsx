type CodeBlockProps = {
  code: string;
};

export default function CodeBlock({ code }: CodeBlockProps) {
  return (
    <div className="code-visual" style={{ paddingTop: 44 }}>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.8, fontFamily: 'inherit', fontSize: 13 }}>
        {code}
      </pre>
    </div>
  );
}
