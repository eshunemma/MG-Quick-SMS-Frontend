import { Eye, MessageSquare } from 'lucide-react';
import { PreviewMessage, Contact } from '../types';

interface PreviewPanelProps {
  previews: PreviewMessage[];
  contacts: Contact[];
}

const PreviewPanel = ({ previews, contacts }: PreviewPanelProps) => {
  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Live Preview</h2>
        </div>

        <div className="flex flex-col items-center justify-center h-64 text-center">
          <MessageSquare className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-slate-500">Upload an Excel file to see preview messages</p>
          <p className="text-xs text-slate-400 mt-2">First 3 personalized messages will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">Live Preview</h2>
        </div>
        <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
          Showing {previews.length} of {contacts.length}
        </span>
      </div>

      <div className="space-y-4">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 border border-slate-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-600 mb-1">To: {preview.phone}</p>
                <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                  {preview.message || (
                    <span className="text-slate-400 italic">Enter a message template to see preview</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {contacts.length > 3 && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 text-center">
            + {contacts.length - 3} more message(s) will be sent
          </p>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;