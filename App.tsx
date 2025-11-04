import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptControls } from './components/PromptControls';
import { PreviewWindow } from './components/PreviewWindow';
import { CodeView } from './components/CodeView';
import { CodeIcon } from './components/icons/CodeIcon';
import { PreviewIcon } from './components/icons/PreviewIcon';
import { generateWebsiteTemplate } from './services/geminiService';

type ViewMode = 'preview' | 'code';

const initialHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="min-h-screen flex items-center justify-center">
        <div class="text-center p-8 bg-white rounded-lg shadow-lg">
            <h1 class="text-4xl font-bold text-gray-800 mb-4">Rajaonline Website Builder</h1>
            <p class="text-lg text-gray-600">
                Describe the website you want to build in the panel on the left.
            </p>
            <p class="text-lg text-gray-600 mt-2">
                Click <span class="font-semibold text-indigo-600">"Generate"</span> to see the magic happen!
            </p>
        </div>
    </div>
</body>
</html>
`;

const themes = {
  dark: {
    '--editor-bg': '#1e1e1e',
    '--editor-text': '#d4d4d4',
    '--editor-header-bg': '#252526',
    '--editor-border': '#3c3c3c',
    '--editor-button-bg': '#3e3e3e',
    '--editor-button-hover-bg': '#505050',
    '--editor-tab-active-bg': '#1e1e1e',
    '--editor-tab-inactive-bg': 'transparent',
    '--editor-tab-active-text': '#ffffff',
    '--editor-tab-inactive-text': '#9ca3af',
    '--editor-tab-inactive-hover-bg': 'rgba(255, 255, 255, 0.1)',
    '--editor-select-bg': '#3e3e3e',
    '--editor-select-text': '#ffffff',
  },
  light: {
    '--editor-bg': '#ffffff',
    '--editor-text': '#27272a',
    '--editor-header-bg': '#f4f4f5',
    '--editor-border': '#e4e4e7',
    '--editor-button-bg': '#e4e4e7',
    '--editor-button-hover-bg': '#d4d4d8',
    '--editor-tab-active-bg': '#ffffff',
    '--editor-tab-inactive-bg': 'transparent',
    '--editor-tab-active-text': '#18181b',
    '--editor-tab-inactive-text': '#71717a',
    '--editor-tab-inactive-hover-bg': 'rgba(0, 0, 0, 0.05)',
    '--editor-select-bg': '#e4e4e7',
    '--editor-select-text': '#18181b',
  },
  ocean: {
    '--editor-bg': '#0f172a',
    '--editor-text': '#94a3b8',
    '--editor-header-bg': '#1e293b',
    '--editor-border': '#334155',
    '--editor-button-bg': '#334155',
    '--editor-button-hover-bg': '#475569',
    '--editor-tab-active-bg': '#0f172a',
    '--editor-tab-inactive-bg': 'transparent',
    '--editor-tab-active-text': '#e2e8f0',
    '--editor-tab-inactive-text': '#64748b',
    '--editor-tab-inactive-hover-bg': 'rgba(100, 116, 139, 0.2)',
    '--editor-select-bg': '#334155',
    '--editor-select-text': '#e2e8f0',
  }
};

const parseHtml = (fullHtml: string): { html: string, css: string, js: string } => {
    if (typeof DOMParser === 'undefined') {
        return { html: fullHtml, css: '', js: '' };
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml, 'text/html');

    const cssArray: string[] = [];
    doc.querySelectorAll('style').forEach(style => {
        cssArray.push(style.innerHTML || '');
        style.remove();
    });

    const jsArray: string[] = [];
    doc.querySelectorAll('script:not([src])').forEach(script => {
        jsArray.push(script.innerHTML || '');
        script.remove();
    });

    const html = doc.documentElement.outerHTML;

    return {
        html: html,
        css: cssArray.join('\n\n').trim(),
        js: jsArray.join('\n\n').trim(),
    };
};

const examplePrompts = [
  'A personal portfolio for a graphic designer, featuring a gallery and contact form.',
  'A recipe blog with a clean, minimalist design and featured recipes on the homepage.',
  'An e-commerce storefront for a business that sells handmade pottery.',
  'A landing page for a mobile app called "FitTrack", highlighting key features.',
];


function App() {
  const [prompt, setPrompt] = useState<string>('A modern landing page for a new SaaS product called "InnovateAI", focusing on features and pricing.');
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [cssCode, setCssCode] = useState<string>('');
  const [jsCode, setJsCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [themeName, setThemeName] = useState<string>('dark');

  // Load template from localStorage on initial mount
  useEffect(() => {
    try {
      const savedTemplate = localStorage.getItem('ai-website-builder-template');
      if (savedTemplate) {
        const { html, css, js } = JSON.parse(savedTemplate);
        if (html) {
          setHtmlCode(html);
          setCssCode(css || '');
          setJsCode(js || '');
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load template from localStorage", e);
    }
    
    // Fallback to initial HTML if nothing is saved or loading fails
    const { html, css, js } = parseHtml(initialHtml);
    setHtmlCode(html);
    setCssCode(css);
    setJsCode(js);
  }, []);

  // Save template to localStorage whenever it changes
  useEffect(() => {
    if (!htmlCode) return; // Don't save if there's no code yet

    try {
      const template = {
        html: htmlCode,
        css: cssCode,
        js: jsCode
      };
      localStorage.setItem('ai-website-builder-template', JSON.stringify(template));
    } catch (e) {
      console.error("Failed to save template to localStorage", e);
    }
  }, [htmlCode, cssCode, jsCode]);
  
  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('ai-website-builder-theme') || 'dark';
    setThemeName(savedTheme);
  }, []);

  useEffect(() => {
    const theme = themes[themeName as keyof typeof themes];
    if (theme) {
      for (const [key, value] of Object.entries(theme)) {
        document.documentElement.style.setProperty(key, value);
      }
      localStorage.setItem('ai-website-builder-theme', themeName);
    }
  }, [themeName]);

  const combinedHtml = useMemo(() => {
    if (!htmlCode) return '';
    if (typeof DOMParser === 'undefined') return htmlCode;
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlCode, 'text/html');

    if (cssCode.trim()) {
        const styleTag = doc.createElement('style');
        styleTag.textContent = cssCode;
        doc.head.appendChild(styleTag);
    }

    if (jsCode.trim()) {
        const scriptTag = doc.createElement('script');
        scriptTag.textContent = jsCode;
        doc.body.appendChild(scriptTag);
    }
    
    return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
  }, [htmlCode, cssCode, jsCode]);

  const handleGenerate = useCallback(async () => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const fullHtml = await generateWebsiteTemplate(prompt);
      const { html, css, js } = parseHtml(fullHtml);
      setHtmlCode(html);
      setCssCode(css);
      setJsCode(js);
      setViewMode('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans">
      <div className="flex flex-grow min-h-0">
        <aside className="w-full md:w-1/3 lg:w-1/4 h-full p-6 flex flex-col bg-gray-800/50 overflow-y-auto">
          <Header />
          <PromptControls
            prompt={prompt}
            setPrompt={setPrompt}
            handleGenerate={handleGenerate}
            isLoading={isLoading}
            examplePrompts={examplePrompts}
          />
        </aside>

        <main className="flex-1 flex flex-col bg-gray-900">
          <div className="flex items-center justify-end p-2 border-b border-gray-700">
            <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <PreviewIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'code' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <CodeIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-grow relative">
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="bg-red-800/90 p-6 rounded-lg shadow-xl text-center">
                  <h3 className="text-lg font-bold mb-2">Error Generating Template</h3>
                  <p className="text-red-200">{error}</p>
                  <button onClick={() => setError(null)} className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors">
                    Close
                  </button>
                </div>
              </div>
            )}
            
            {viewMode === 'preview' ? (
              <PreviewWindow htmlContent={combinedHtml} />
            ) : (
              <CodeView
                html={htmlCode}
                css={cssCode}
                js={jsCode}
                setHtml={setHtmlCode}
                setCss={setCssCode}
                setJs={setJsCode}
                themeName={themeName}
                setThemeName={setThemeName}
                themeNames={Object.keys(themes)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;