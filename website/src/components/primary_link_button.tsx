import React from 'react';

interface PrimaryLinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function PrimaryLinkButton({
  href,
  children,
  className = '',
  target = '_blank',
  rel = 'noopener noreferrer'
}: PrimaryLinkButtonProps) {
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:text-white dark:bg-primary-600 dark:hover:bg-primary-700 ${className}`}
    >
      {children}
    </a>
  );
} 