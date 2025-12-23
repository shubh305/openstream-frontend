import React, { InputHTMLAttributes } from 'react';

interface TerminalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  prefixLabel?: string;
}

export const TerminalInput = React.forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ className, prefixLabel, ...props }, ref) => {
    return (
      <div className="flex items-center gap-4 w-full">
        {prefixLabel && (
          <span className="text-muted-text select-none font-mono text-sm">{prefixLabel}</span>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-transparent border-b border-muted-text 
            text-white font-mono placeholder:text-muted-text/50
            focus:border-white focus:outline-none 
            caret-white py-2 px-1 transition-colors duration-200
            ${className}
          `}
          autoComplete="off"
          spellCheck="false"
          {...props}
        />
      </div>
    );
  }
);

TerminalInput.displayName = 'TerminalInput';
