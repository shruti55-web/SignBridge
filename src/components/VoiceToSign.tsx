import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { supabase, SignDictionary } from '../lib/supabase';

export default function VoiceToSign() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [signs, setSigns] = useState<SignDictionary[]>([]);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          convertTextToSign(transcriptText);
        }
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setTranscript('');
      setSigns([]);
    }
  };

  const convertTextToSign = async (text: string) => {
    if (!text.trim()) return;

    const words = text.toLowerCase().split(/\s+/);
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
      input_text: text,
      input_type: 'voice',
      output_type: 'sign',
      signs_used: foundSigns.map((s) => s.word),
    });
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-sky-200">
        <h2 className="text-3xl font-bold text-sky-600 mb-6">Voice to Sign Language</h2>

        <div className="text-center mb-8">
          <button
            onClick={toggleListening}
            className={`relative inline-flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {isListening ? (
              <MicOff className="w-16 h-16 text-white" />
            ) : (
              <Mic className="w-16 h-16 text-white" />
            )}
          </button>
          <p className="mt-4 text-lg font-semibold text-gray-700">
            {isListening ? 'Listening... Click to stop' : 'Click to start speaking'}
          </p>
        </div>

        {transcript && (
          <div className="mb-6 p-4 bg-sky-50 rounded-lg border-2 border-sky-200">
            <p className="text-gray-700">
              <span className="font-semibold text-sky-600">You said:</span> {transcript}
            </p>
          </div>
        )}

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
      </div>
    </div>
  );
}
