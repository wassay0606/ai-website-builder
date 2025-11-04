
import React from 'react';

interface PreviewWindowProps {
  htmlContent: string;
}

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ htmlContent }) => {
  return (
    <div className="w-full h-full bg-white">
      <iframe
        srcDoc={htmlContent}
        title="Website Preview"
        className="w-full h-full border-none"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};
