"use client";

/**
 * Lightweight markdown renderer for pod/lesson content.
 * Handles: bold, inline code, code blocks, bullets, numbered lists, line breaks.
 * No external dependencies.
 */

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold**, `code`, and plain text
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`|([^*`]+))/g;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match[2]) {
      parts.push(<strong key={key++} style={{ color: "var(--text)", fontWeight: 600 }}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(
        <code key={key++} style={{
          background: "rgba(245,166,35,0.12)",
          color: "var(--amber)",
          padding: "1px 5px",
          borderRadius: 4,
          fontSize: "0.9em",
          fontFamily: "monospace",
        }}>{match[3]}</code>
      );
    } else if (match[4]) {
      parts.push(<span key={key++}>{match[4]}</span>);
    }
  }
  return parts;
}

function CodeBlock({ content, language }: { content: string; language?: string }) {
  return (
    <div style={{
      background: "var(--surface2)",
      borderRadius: 12,
      padding: "14px 16px",
      margin: "10px 0",
      overflowX: "auto",
      border: "1px solid var(--border)",
    }}>
      {language && (
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "var(--muted)",
          marginBottom: 8,
        }}>{language}</div>
      )}
      <pre style={{
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
        fontSize: 12,
        lineHeight: 1.5,
        color: "var(--text)",
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}>{content}</pre>
    </div>
  );
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Code block
    if (line.startsWith("```")) {
      const language = line.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(<CodeBlock key={key++} content={codeLines.join("\n")} language={language} />);
      continue;
    }

    // Empty line
    if (line.trim() === "" || line.trim() === "---") {
      i++;
      continue;
    }

    // ### Subheading
    if (line.startsWith("### ")) {
      elements.push(
        <div key={key++} style={{
          fontFamily: "var(--font-fraunces), Fraunces, serif",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text)",
          marginTop: 16,
          marginBottom: 8,
        }}>{line.slice(4)}</div>
      );
      i++;
      continue;
    }

    // Bullet list — collect consecutive bullets
    if (line.match(/^\s*[-*]\s/)) {
      const bullets: string[] = [];
      while (i < lines.length && lines[i].match(/^\s*[-*]\s/)) {
        bullets.push(lines[i].replace(/^\s*[-*]\s+/, "").trim());
        i++;
      }
      elements.push(
        <ul key={key++} style={{ paddingLeft: 18, margin: "8px 0", display: "flex", flexDirection: "column", gap: 6 }}>
          {bullets.map((b, j) => (
            <li key={j} style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
              {renderInline(b)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, "").trim());
        i++;
      }
      elements.push(
        <ol key={key++} style={{ paddingLeft: 20, margin: "8px 0", display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((item, j) => (
            <li key={j} style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Table — skip for now, show as formatted text
    if (line.includes("|") && line.trim().startsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim().startsWith("|")) {
        // Skip separator rows
        if (!lines[i].match(/^\|[\s-|]+\|$/)) {
          tableLines.push(lines[i]);
        }
        i++;
      }
      if (tableLines.length > 0) {
        const headers = tableLines[0].split("|").filter(Boolean).map(s => s.trim());
        const rows = tableLines.slice(1).map(row => row.split("|").filter(Boolean).map(s => s.trim()));
        elements.push(
          <div key={key++} style={{ overflowX: "auto", margin: "10px 0" }}>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {headers.map((h, j) => (
                    <th key={j} style={{
                      textAlign: "left",
                      padding: "6px 10px",
                      fontWeight: 600,
                      color: "var(--amber)",
                      borderBottom: "1px solid var(--border)",
                      whiteSpace: "nowrap",
                    }}>{renderInline(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, j) => (
                  <tr key={j}>
                    {row.map((cell, k) => (
                      <td key={k} style={{
                        padding: "5px 10px",
                        color: "var(--text)",
                        borderBottom: "1px solid var(--border)",
                      }}>{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, margin: "6px 0" }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div>{elements}</div>;
}
