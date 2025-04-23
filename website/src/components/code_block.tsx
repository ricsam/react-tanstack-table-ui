import { ReactNode, useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Import languages
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";

export interface CodeBlockProps {
  language: string;
  children?: ReactNode;
  className?: string;
  code?: string; // Support both code prop and children
}

export function CodeBlock({ language, children, className = "", code }: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const content = code || (typeof children === "string" ? children : "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [content, language]);

  const handleCopyCode = () => {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-0 right-0 flex items-center rounded-bl overflow-hidden bg-gray-100 dark:bg-gray-900 border-b border-l border-transparent dark:border-gray-700">
        <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-300">
          {language}
        </div>
        <button
          onClick={handleCopyCode}
          className="p-1 text-xs text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label="Copy code"
          title="Copy code"
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          )}
        </button>
      </div>
      <pre className={`language-${language} overflow-x-auto p-4 rounded-md !bg-[--tw-prose-pre-bg] dark:!bg-[#1f2937] !text-sm`}>
        <code ref={codeRef} className={`language-${language}`}>
          {content}
        </code>
      </pre>
    </div>
  );
}
