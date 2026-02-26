import "./globals.css";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>LLM Benchmark</title>
        <meta name="description" content="Performance benchmarking for Large Language Models via OpenRouter" />
      </head>
      <body>
        <nav className="nav">
          <div className="nav-inner">
            <Link href="/" className="nav-logo">LLM Benchmark</Link>
            <div className="nav-links">
              <Link href="/benchmark" className="nav-link">Setup</Link>
              <Link href="/prompts" className="nav-link">Prompts</Link>
              <Link href="/results" className="nav-link">Results</Link>
              <Link href="/context-results" className="nav-link">Context</Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
