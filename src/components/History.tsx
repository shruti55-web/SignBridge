import { useState, useEffect } from 'react';
import { Clock, Trash2, MessageSquare, Mic, Camera } from 'lucide-react';
import { supabase, ConversationHistory } from '../lib/supabase';

export default function History() {
  const [history, setHistory] = useState<ConversationHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('conversation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data && !error) {
      setHistory(data);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    if (!confirm('Are you sure you want to clear all history?')) return;

    const { error } = await supabase.from('conversation_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (!error) {
      setHistory([]);
    }
  };

  const getInputIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquare className="w-5 h-5" />;
      case 'voice':
        return <Mic className="w-5 h-5" />;
      case 'sign':
        return <Camera className="w-5 h-5" />;
      default:
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-sky-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-sky-600">Conversation History</h2>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-lg"
            >
              <Trash2 className="w-5 h-5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            <p className="text-sky-600 mt-4 font-semibold">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No conversation history yet.</p>
            <p className="text-gray-400 mt-2">Start using the platform to see your history here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border-2 border-sky-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-sky-500 text-white p-2 rounded-lg">
                      {getInputIcon(item.input_type)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-sky-700">
                        {item.input_type.charAt(0).toUpperCase() + item.input_type.slice(1)} to{' '}
                        {item.output_type.charAt(0).toUpperCase() + item.output_type.slice(1)}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(item.created_at)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">Input:</p>
                    <p className="text-gray-800 text-lg">{item.input_text}</p>
                  </div>

                  {item.signs_used && item.signs_used.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-600 mb-1">Signs shown:</p>
                      <div className="flex flex-wrap gap-2">
                        {item.signs_used.map((sign, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-sky-200 text-sky-700 rounded-full text-sm font-semibold"
                          >
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
