import { useState } from 'react';
import { Send, Volume2 } from 'lucide-react';
import { supabase, SignDictionary } from '../lib/supabase';

export default function TextToSign() {
  const [inputText, setInputText] = useState('');
  const [signs, setSigns] = useState<SignDictionary[]>([]);
  const [loading, setLoading] = useState(false);

  const convertTextToSign = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    const words = inputText.toLowerCase().split(/\s+/);
    const foundSigns: SignDictionary[] = [];

    for (const word of words) {
      const { data, error } = await supabase
        .from('sign_dictionary')
        .select('*')
        .eq('word', word);

      if (data && data.length > 0 && !error) {
        foundSigns.push(data[0]);
        await supabase
          .from('sign_dictionary')
          .update({ usage_count: data[0].usage_count + 1 })
          .eq('id', data[0].id);
      }
    }

    setSigns(foundSigns);

    await supabase.from('conversation_history').insert({
      input_text: inputText,
      input_type: 'text',
      output_type: 'sign',
      signs_used: foundSigns.map((s) => s.word),
    });

    setLoading(false);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-sky-200">
        <h2 className="text-3xl font-bold text-sky-600 mb-6">Text to Sign Language</h2>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Enter your message:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && convertTextToSign()}
              placeholder="Type your message here..."
              className="flex-1 px-4 py-3 border-2 border-sky-300 rounded-lg focus:outline-none focus:border-sky-500 text-lg"
            />
            <button
              onClick={convertTextToSign}
              disabled={loading}
              className="bg-sky-500 text-white px-6 py-3 rounded-lg hover:bg-sky-600 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
              <span>Convert</span>
            </button>
          </div>
        </div>

        {signs.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-sky-600 mb-4">Sign Language Instructions:</h3>
            <div className="grid gap-4">
              {signs.map((sign, index) => (
                <div
                  key={sign.id}
                  className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border-2 border-sky-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-sky-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <h4 className="text-2xl font-bold text-sky-700">{sign.word}</h4>
                        <span className="px-3 py-1 bg-sky-200 text-sky-700 rounded-full text-sm font-semibold">
                          {sign.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          sign.difficulty === 'easy' ? 'bg-green-200 text-green-700' :
                          sign.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-700' :
                          'bg-red-200 text-red-700'
                        }`}>
                          {sign.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-700 text-lg leading-relaxed">{sign.sign_description}</p>
                    </div>
                    <button
                      onClick={() => speakText(sign.word)}
                      className="ml-4 bg-sky-500 text-white p-3 rounded-lg hover:bg-sky-600 transition-all duration-200"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            <p className="text-sky-600 mt-4 font-semibold">Converting to sign language...</p>
          </div>
        )}
      </div>
    </div>
  );
}
