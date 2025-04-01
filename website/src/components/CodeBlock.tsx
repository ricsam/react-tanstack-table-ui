import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import { useTheme } from '@/contexts/ThemeContext';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  showCopyButton?: boolean;
}

export function CodeBlock({ 
  code, 
  language = 'tsx', 
  className = '',
  showCopyButton = true 
}: CodeBlockProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const copyToClipboard = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code: ', err);
      }
    }
  };

  return (
    <div className="relative group">
      <pre className={`rounded-md overflow-x-auto bg-gray-50 dark:bg-gray-800 ${className}`}>
        <code ref={codeRef} className={`language-${language}`}>
          {code}
        </code>
      </pre>
      
      {showCopyButton && (
        <button
          onClick={copyToClipboard}
          className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded 
            transition-opacity duration-200
            ${copied 
              ? 'bg-green-500 text-white opacity-100' 
              : 'bg-gray-700 dark:bg-gray-600 text-gray-200 opacity-0 group-hover:opacity-100 hover:bg-gray-600 dark:hover:bg-gray-500'
            }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}
    </div>
  );
} 