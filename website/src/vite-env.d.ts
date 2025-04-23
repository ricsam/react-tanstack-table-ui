/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types'
  import type { Toc } from '@stefanprobst/rehype-extract-toc'

  export const tableOfContents: Toc
  export default function MDXContent(props: MDXProps): JSX.Element
}
declare module '*.md' {
  import type { MDXProps } from 'mdx/types'
  import type { Toc } from '@stefanprobst/rehype-extract-toc'

  export const tableOfContents: Toc
  export default function MDXContent(props: MDXProps): JSX.Element
}