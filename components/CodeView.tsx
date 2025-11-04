import React, { useState } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { ExportIcon } from './icons/ExportIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface CodeViewProps {
  html: string;
  css: string;
  js: string;
  setHtml: (value: string) => void;
  setCss: (value: string) => void;
  setJs: (value: string) => void;
  themeName: string;
  setThemeName: (name: string) => void;
  themeNames: string[];
}

type ActiveTab = 'html' | 'css' | 'js';

export const CodeView: React.FC<CodeViewProps> = ({
  html,
  css,
  js,
  setHtml,
  setCss,
  setJs,
  themeName,
  setThemeName,
  themeNames,
}) => {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('html');

  const handleCopy = () => {
    let contentToCopy = '';
    switch (activeTab) {
      case 'html':
        contentToCopy = `<!DOCTYPE html>\n${html}`;
        break;
      case 'css':
        contentToCopy = css;
        break;
      case 'js':
        contentToCopy = js;
        break;
    }

    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleExport = () => {
    const downloadFile = (filename: string, content: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    const fullHtml = `<!DOCTYPE html>\n${html}`;
    if (html.includes('<body')) {
      downloadFile('index.html', fullHtml, 'text/html');
    }
    if (css.trim()) {
      downloadFile('style.css', css, 'text/css');
    }
    if (js.trim()) {
      downloadFile('script.js', js, 'text/javascript');
    }

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const getButtonClass = (tabName: ActiveTab) => {
    return `px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
      activeTab === tabName
        ? 'bg-[var(--editor-tab-active-bg)] text-[var(--editor-tab-active-text)]'
        : 'text-[var(--editor-tab-inactive-text)] hover:bg-[var(--editor-tab-inactive-hover-bg)]'
    }`;
  };

  const renderEditor = () => {
    const commonProps = {
      className:
        'w-full h-full absolute top-0 left-0 bg-[var(--editor-bg)] text-[var(--editor-text)] font-mono text-sm p-4 resize-none focus:outline-none',
      spellCheck: false,
    };
    switch (activeTab) {
      case 'html':
        return <textarea {...commonProps} value={html} onChange={(e) => setHtml(e.target.value)} aria-label="HTML code editor" />;
      case 'css':
        return <textarea {...commonProps} value={css} onChange={(e) => setCss(e.target.value)} aria-label="CSS code editor" />;
      case 'js':
        return <textarea {...commonProps} value={js} onChange={(e) => setJs(e.target.value)} aria-label="JavaScript code editor" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full bg-[var(--editor-bg)] flex flex-col">
      <div className="flex-shrink-0 flex items-center justify-between border-b border-[var(--editor-border)] bg-[var(--editor-header-bg)]">
        <div className="flex">
          <button onClick={() => setActiveTab('html')} className={getButtonClass('html')}>
            HTML
          </button>
          <button onClick={() => setActiveTab('css')} className={getButtonClass('css')}>
            CSS
          </button>
          <button onClick={() => setActiveTab('js')} className={getButtonClass('js')}>
            JavaScript
          </button>
        </div>
        <div className="flex items-center space-x-3 mx-2 z-10">
          <div className="relative">
            <select
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="text-sm rounded-md border-0 pl-3 pr-8 py-1.5 appearance-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              style={{
                backgroundColor: 'var(--editor-select-bg)',
                color: 'var(--editor-select-text)',
              }}
              aria-label="Select code editor theme"
            >
              {themeNames.map((name) => (
                <option key={name} value={name}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDownIcon 
                className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" 
                style={{ color: 'var(--editor-select-text)' }}
            />
          </div>

          <button
            onClick={handleExport}
            className="relative p-2 bg-[var(--editor-button-bg)] hover:bg-[var(--editor-button-hover-bg)] rounded-lg text-[var(--editor-text)] transition-colors duration-200"
            aria-label="Export files"
          >
            <ExportIcon className="w-5 h-5" />
            {exported && (
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Exported!
              </span>
            )}
          </button>
          <button
            onClick={handleCopy}
            className="relative p-2 bg-[var(--editor-button-bg)] hover:bg-[var(--editor-button-hover-bg)] rounded-lg text-[var(--editor-text)] transition-colors duration-200"
            aria-label="Copy code"
          >
            <CopyIcon className="w-5 h-5" />
            {copied && (
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Copied!
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="flex-grow relative overflow-auto">{renderEditor()}</div>
    </div>
  );
};
