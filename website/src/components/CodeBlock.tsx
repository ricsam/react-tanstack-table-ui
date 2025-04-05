import { ReactNode, useEffect, useRef } from "react";
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

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [content, language]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-0 right-0 p-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-bl">
        {language}
      </div>
      <pre className={`language-${language} overflow-x-auto p-4 rounded-md bg-gray-100 dark:bg-gray-800`}>
        <code ref={codeRef} className={`language-${language}`}>
          {content}
        </code>
      </pre>
    </div>
  );
}
