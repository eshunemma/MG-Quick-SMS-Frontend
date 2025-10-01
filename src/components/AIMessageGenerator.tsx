import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
const baseURL = import.meta.env.VITE_BASE_URL;


interface AIMessageGeneratorProps {
  onSelectMessage: (message: string) => void;
  disabled?: boolean;
}

const AIMessageGenerator = ({ onSelectMessage, disabled }: AIMessageGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing what kind of message you want.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await fetch(`${baseURL}/api/generate-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuggestions(data.suggestions || []);
        if (data.suggestions.length === 0) {
          setError('No suggestions generated. Try a different prompt.');
        }
      } else {
        setError(data.error || 'Failed to generate messages. Please try again.');
      }
    } catch (err) {
      setError('Failed to connect to AI service. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = (message: string) => {
    onSelectMessage(message);
    setIsExpanded(false);
  };

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors mb-3"
        disabled={disabled}
      >
        <Sparkles className="w-4 h-4" />
        AI Message Generator
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3">
          <div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Create a professional appointment reminder message' or 'Generate a friendly event invitation'"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={disabled || loading}
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={disabled || loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Messages
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600 font-medium">Choose a message:</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectMessage(suggestion)}
                  className="w-full text-left p-3 bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
                  disabled={disabled}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-md flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </span>
                    <p className="text-sm text-slate-800 flex-1 break-words group-hover:text-blue-800">
                      {suggestion}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMessageGenerator;