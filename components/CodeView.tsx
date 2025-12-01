import React, { useState, useRef, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { ExportIcon } from './icons/ExportIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { WordIcon } from './icons/WordIcon';

type ActiveTab = 'html' | 'css' | 'js';

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
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  error?: {
    message: string;
    line?: number;
    column?: number;
  } | null;
  combinedHtml: string;
}

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
  activeTab,
  setActiveTab,
  error,
  combinedHtml,
}) => {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [wordExported, setWordExported] = useState(false);
  const htmlTextareaRef = useRef<HTMLTextAreaElement>(null);

  // For the error highlighting overlay
  const [highlightedHtmlContent, setHighlightedHtmlContent] = useState<React.ReactNode>(html);
  const highlightRef = useRef<HTMLPreElement>(null);
  
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightRef.current) {
        highlightRef.current.scrollTop = e.currentTarget.scrollTop;
        highlightRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // This effect updates the highlighted content in the backdrop
  useEffect(() => {
      if (error && error.line && activeTab === 'html') {
          const lines = html.split('\n');
          const errorLineIndex = error.line - 1;

          if (errorLineIndex < 0 || errorLineIndex >= lines.length) {
              setHighlightedHtmlContent(html);
              return;
          }

          const startPos = lines.slice(0, errorLineIndex).join('\n').length + (errorLineIndex > 0 ? 1 : 0);
          const lineContent = lines[errorLineIndex];
          const endPos = startPos + lineContent.length;
          
          const column = error.column || 1;
          const finalColumn = Math.min(Math.max(1, column), lineContent.length + 1) - 1;
          const errorCharStart = startPos + finalColumn;
          const errorCharEnd = errorCharStart + 1;

          setHighlightedHtmlContent(
              <>
                  {html.substring(0, startPos)}
                  <span className="bg-red-900/60 rounded-sm">
                    {html.substring(startPos, errorCharStart)}
                    <span className="bg-red-700/80 outline outline-1 outline-red-500 rounded-sm">{html.substring(errorCharStart, errorCharEnd) || ' '}</span>
                    {html.substring(errorCharEnd, endPos)}
                  </span>
                  {html.substring(endPos)}
              </>
          );
      } else {
          setHighlightedHtmlContent(html);
      }
  }, [html, error, activeTab]);

  // This effect handles focusing and scrolling the textarea to the error location
  useEffect(() => {
    if (error && error.line && htmlTextareaRef.current && activeTab === 'html') {
      const ta = htmlTextareaRef.current;
      
      requestAnimationFrame(() => {
        const lines = ta.value.split('\n');
        
        if (error.line! <= 0 || error.line! > lines.length) return;

        const errorLineIndex = error.line! - 1;
        const startPos = lines.slice(0, errorLineIndex).join('\n').length + (errorLineIndex > 0 ? 1 : 0);
        
        const column = error.column || 1;
        const lineContent = lines[errorLineIndex];
        
        const finalColumn = Math.min(Math.max(1, column), lineContent.length + 1);
        const position = startPos + finalColumn - 1;

        ta.focus();
        ta.setSelectionRange(position, position + 1);

        const lineHeight = ta.scrollHeight > 0 && lines.length > 0 ? ta.scrollHeight / lines.length : 18; // Default line height
        const linesInView = ta.clientHeight / lineHeight;
        const scrollTop = (error.line! - Math.floor(linesInView / 2)) * lineHeight;
        
        ta.scrollTop = Math.max(0, scrollTop);
        
        if (highlightRef.current) {
            highlightRef.current.scrollTop = ta.scrollTop;
            highlightRef.current.scrollLeft = ta.scrollLeft;
        }
      });
    }
  }, [error, activeTab]);

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

  const handleExportWord = () => {
    if (!combinedHtml) return;

    const blob = new Blob([combinedHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'website.doc';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setWordExported(true);
    setTimeout(() => setWordExported(false), 2000);
  };

  const getButtonClass = (tabName: ActiveTab) => {
    return `px-4 py-2 text-sm font-medium transition-colors focus:outline-none ${
      activeTab === tabName
        ? 'bg-[var(--editor-tab-active-bg)] text-[var(--editor-tab-active-text)]'
        : 'text-[var(--editor-tab-inactive-text)] hover:bg-[var(--editor-tab-inactive-hover-bg)]'
    }`;
  };

  const renderEditor = () => {
    const editorBaseClasses = 'w-full h-full font-mono text-sm p-4 resize-none focus:outline-none whitespace-pre-wrap break-words';
    
    switch (activeTab) {
      case 'html':
        return (
            <div className="relative w-full h-full">
                <pre
                    aria-hidden="true"
                    ref={highlightRef}
                    className={`${editorBaseClasses} absolute top-0 left-0 text-[var(--editor-text)] bg-[var(--editor-bg)] overflow-auto pointer-events-none`}
                >
                   {highlightedHtmlContent}
                </pre>
                <textarea
                    spellCheck={false}
                    className={`${editorBaseClasses} absolute top-0 left-0 bg-transparent text-transparent caret-[var(--editor-text)] relative z-10 overflow-auto`}
                    ref={htmlTextareaRef}
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    onScroll={handleScroll}
                    aria-label="HTML code editor"
                />
            </div>
        );
      case 'css':
        return <textarea 
            spellCheck={false}
            className={`${editorBaseClasses} absolute top-0 left-0 bg-[var(--editor-bg)] text-[var(--editor-text)]`} 
            value={css} 
            onChange={(e) => setCss(e.target.value)} 
            aria-label="CSS code editor" />;
      case 'js':
        return <textarea 
            spellCheck={false}
            className={`${editorBaseClasses} absolute top-0 left-0 bg-[var(--editor-bg)] text-[var(--editor-text)]`} 
            value={js} 
            onChange={(e) => setJs(e.target.value)} 
            aria-label="JavaScript code editor" />;
      default:
        return null;
    }
  };


  return (
    <div className="w-full h-full bg-[var(--editor-bg)] flex flex-col">
      {error && error.line && (
        <div className="flex-shrink-0 p-4 bg-red-900/80 border-b border-red-700 text-red-200 text-sm">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="font-bold text-white">HTML Parsing Error Detected</h3>
              <p className="mt-1">
                The generated HTML has a syntax error. We've automatically focused the editor on the exact character causing the problem.
              </p>
              <div className="mt-2 p-2 bg-black/20 rounded-md font-mono text-xs text-red-100 whitespace-pre-wrap">
                <span className="font-semibold">Location:</span> Line {error.line}, Column {error.column || 1}
                <br />
                <span className="font-semibold">Details:</span> {error.message}
              </div>
            </div>
          </div>
        </div>
      )}
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
            onClick={handleExportWord}
            className="relative p-2 bg-[var(--editor-button-bg)] hover:bg-[var(--editor-button-hover-bg)] rounded-lg text-[var(--editor-text)] transition-colors duration-200"
            aria-label="Export as MS Word document"
          >
            <WordIcon className="w-5 h-5" />
            {wordExported && (
              <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Exported!
              </span>
            )}
          </button>
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