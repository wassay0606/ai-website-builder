import React from 'react';

interface PromptControlsProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => void;
  isLoading: boolean;
  examplePrompts: string[];
}

export const PromptControls: React.FC<PromptControlsProps> = ({ prompt, setPrompt, handleGenerate, isLoading, examplePrompts }) => {
  return (
    <div className="flex-grow flex flex-col">
      <label htmlFor="prompt" className="text-sm font-medium text-gray-300 mb-2">
        Website Description
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="e.g., A portfolio website for a photographer with a minimalist dark theme and a gallery section..."
        className="flex-grow w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none"
        rows={10}
      />
      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim()}
        className="w-full mt-4 py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          'Generate Website'
        )}
      </button>

      <div className="mt-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Or try an example:</h3>
        <div className="mt-3 space-y-2">
            {examplePrompts.map((example, index) => (
                <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="w-full text-left text-sm text-indigo-300 hover:text-indigo-200 bg-gray-700/50 hover:bg-gray-700 px-3 py-2 rounded-md transition-colors"
                >
                    {example}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};