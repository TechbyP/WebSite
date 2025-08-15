import React from 'react';

interface Props {
  input: string;
  loading: boolean;
  isMobile: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  setInput: (value: string) => void;
  sendMessage: () => void;
}

export const ChatInput = React.memo(({
  input,
  loading,
  isMobile,
  inputRef,
  setInput,
  sendMessage
}: Props) => {
  return (
    <div
      className="p-3 bg-white border-t border-gray-200 flex gap-2"
      style={{
        paddingBottom: isMobile ? 'max(1rem, env(safe-area-inset-bottom, 1rem))' : '1rem'
      }}
    >
      <input
        ref={inputRef}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brandblue focus:border-transparent transition"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={isMobile ? "Type your message..." : "Ask about machines..."}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        aria-label="Type your message"
      />
      <button
        onMouseDown={(e) => e.preventDefault()}
        onClick={sendMessage}
        disabled={loading || !input.trim()}
        className="bg-gradient-to-r from-brandblue to-brandgreen hover:from-brandgreen hover:to-brandblue text-white px-4 py-2 rounded-lg disabled:opacity-50 transition transform hover:scale-105"
        aria-label="Send message"
      >
        {isMobile ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
          </svg>
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
});