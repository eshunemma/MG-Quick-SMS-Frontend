import { useState, ChangeEvent } from 'react';
import { Upload, Send, X, Loader2, FileSpreadsheet } from 'lucide-react';
import { Contact, PreviewMessage } from '../types';
import { parseExcelFile } from '../utils/excelParser';
import { generatePreviews, extractPlaceholders } from '../utils/messageProcessor';
import PreviewPanel from './PreviewPanel';
import AIMessageGenerator from './AIMessageGenerator';
const baseURL = import.meta.env.VITE_BASE_URL;

const MessageForm = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [previews, setPreviews] = useState<PreviewMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value;
    setMessage(newMessage);

    if (contacts.length > 0) {
      setPreviews(generatePreviews(newMessage, contacts));
    }
  };

  const handleAIMessageSelect = (selectedMessage: string) => {
    setMessage(selectedMessage);
    if (contacts.length > 0) {
      setPreviews(generatePreviews(selectedMessage, contacts));
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setParseError(null);

    if (selectedFile) {
      setFile(selectedFile);

      try {
        const parsedContacts = await parseExcelFile(selectedFile);

        if (parsedContacts.length === 0) {
          setParseError('The Excel file is empty or has no valid data.');
          setContacts([]);
          setPreviews([]);
          return;
        }

        const contactsWithoutPhone = parsedContacts.filter(c => !c.phone);
        if (contactsWithoutPhone.length > 0) {
          setParseError(`Warning: ${contactsWithoutPhone.length} contact(s) are missing phone numbers and will be skipped.`);
        }

        const validContacts = parsedContacts.filter(c => c.phone);
        setContacts(validContacts);

        if (message) {
          setPreviews(generatePreviews(message, validContacts));
        }
      } catch (error) {
        setParseError((error as Error).message);
        setContacts([]);
        setPreviews([]);
      }
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setContacts([]);
    setPreviews([]);
    setParseError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!message.trim()) {
      setResult({ type: 'error', message: 'Please enter a message template.' });
      return;
    }

    if (!file) {
      setResult({ type: 'error', message: 'Please upload an Excel file with contacts.' });
      return;
    }

    if (contacts.length === 0) {
      setResult({ type: 'error', message: 'No valid contacts found in the Excel file.' });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('contacts', file);

      const response = await fetch(`${baseURL}/send-sms`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ type: 'success', message: data.message || 'Messages sent successfully!' });
        handleReset();
      } else {
        setResult({ type: 'error', message: data.error || 'Failed to send messages.' });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'Failed to connect to the server. Please ensure the backend is running.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessage('');
    setFile(null);
    setContacts([]);
    setPreviews([]);
    setParseError(null);

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const placeholders = extractPlaceholders(message);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">QuickSMS</h1>
          <p className="text-slate-600">Send personalized SMS messages to your contacts</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-700">
                    Message template (use {'{{'}<strong>name</strong>{'}}'}  as placeholder):
                  </p>
                  <span className="text-xs text-slate-500">
                    {message.length} character{message.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <textarea
                  name="message"
                  value={message}
                  onChange={handleMessageChange}
                  rows={4}
                  placeholder="Hello {{name}}, your appointment is tomorrow at 10AM"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-shadow"
                  disabled={loading}
                />
                {placeholders.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-slate-600">Placeholders:</span>
                    {placeholders.map((placeholder) => (
                      <span
                        key={placeholder}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium"
                      >
                        {`{{${placeholder}}}`}
                      </span>
                    ))}
                  </div>
                )}

                <AIMessageGenerator
                  onSelectMessage={handleAIMessageSelect}
                  disabled={loading}
                />
              </div>

              <div>
                {!file ? (
                  <input
                    name="contacts"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    required
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    disabled={loading}
                  />
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{file.name}</p>
                        <p className="text-xs text-slate-600">{contacts.length} valid contacts</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                      disabled={loading}
                    >
                      <X className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                )}

                {parseError && (
                  <p className="mt-2 text-sm text-amber-600">{parseError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !message || !file || contacts.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Upload & Send'
                )}
              </button>

              {result && (
                <div
                  className={`p-4 rounded-xl ${
                    result.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <p className="text-sm font-medium">{result.message}</p>
                </div>
              )}
            </form>
          </div>

          <PreviewPanel previews={previews} contacts={contacts} />
        </div>
      </div>
    </div>
  );
};

export default MessageForm;