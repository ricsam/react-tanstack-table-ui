import { CodeBlock } from '@/components/CodeBlock';

export function InstallationPage() {
  return (
    <div className="prose max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1>Installation</h1>
      
      <p>
        Follow these steps to install React TanStack Table UI in your React project.
      </p>
      
      <h2>Dependencies</h2>
      
      <p>
        React TanStack Table UI is built on top of TanStack Table and TanStack Virtual, which are peer dependencies.
      </p>
      
      <h2>Installation</h2>
      
      <p>
        You can install React TanStack Table UI using npm, yarn, or pnpm:
      </p>
      
      <CodeBlock
        code={`# npm
npm install @rttui/core @tanstack/react-table @tanstack/react-virtual

# yarn
yarn add @rttui/core @tanstack/react-table @tanstack/react-virtual

# pnpm
pnpm add @rttui/core @tanstack/react-table @tanstack/react-virtual`}
        language="bash"
      />
      
      <h2>Skins (Optional)</h2>
      
      <p>
        We provide several skins that you can choose from based on your UI requirements:
      </p>
      
      <h3>Material UI Skin</h3>
      
      <p>
        If you're using Material UI in your project, you can install our MUI skin:
      </p>
      
      <CodeBlock
        code={`# npm
npm install @rttui/skin-mui

# yarn
yarn add @rttui/skin-mui

# pnpm
pnpm add @rttui/skin-mui`}
        language="bash"
      />
      
      <h3>Anocca Skin</h3>
      
      <p>
        For a more modern and clean look, you can use our Anocca skin:
      </p>
      
      <CodeBlock
        code={`# npm
npm install @rttui/skin-anocca

# yarn
yarn add @rttui/skin-anocca

# pnpm
pnpm add @rttui/skin-anocca`}
        language="bash"
      />
      
      <h2>TypeScript Support</h2>
      
      <p>
        React TanStack Table UI is written in TypeScript and provides excellent type safety. TypeScript types are included in the package and require no additional installation.
      </p>
      
      <h2>Next Steps</h2>
      
      <p>
        Once you've installed the necessary packages, check out the <a href="/docs/quickstart" className="text-primary-600 hover:text-primary-700">Quick Start</a> guide to learn how to set up and use the core <code>{'<ReactTanstackTableUi />'}</code> component.
      </p>
    </div>
  );
} 