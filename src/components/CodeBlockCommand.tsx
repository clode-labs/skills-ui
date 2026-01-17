import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockCommandProps {
  repoUrl: string;
  skillPath: string;
}

type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun';

export default function CodeBlockCommand({ repoUrl, skillPath }: CodeBlockCommandProps) {
  const [selected, setSelected] = useState<PackageManager>('pnpm');
  const [copied, setCopied] = useState(false);

  const getCommand = (pm: PackageManager) => {
    const skillUrl = `${repoUrl}/tree/main/${skillPath}`;
    switch (pm) {
      case 'pnpm':
        return `pnpm dlx add-skill ${skillUrl}`;
      case 'npm':
        return `npx add-skill ${skillUrl}`;
      case 'yarn':
        return `yarn dlx add-skill ${skillUrl}`;
      case 'bun':
        return `bunx add-skill ${skillUrl}`;
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getCommand(selected));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const managers: PackageManager[] = ['pnpm', 'npm', 'yarn', 'bun'];

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {managers.map((pm) => (
          <button
            key={pm}
            onClick={() => setSelected(pm)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selected === pm
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {pm}
          </button>
        ))}
      </div>

      {/* Command */}
      <div className="flex items-center justify-between p-4">
        <code className="text-green-400 text-sm font-mono flex-1 overflow-x-auto">
          {getCommand(selected)}
        </code>
        <button
          onClick={handleCopy}
          className="ml-4 p-2 text-gray-400 hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
