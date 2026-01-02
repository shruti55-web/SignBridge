import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Volume2 } from 'lucide-react';

export default function SignToText() {
  const [isRecording, setIsRecording] = useState(false);
  const [detectedText, setDetectedText] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const simulateDetection = () => {
    const samplePhrases = [
      'Hello, how are you?',
      'Thank you for your help',
      'I understand',
      'Please help me',
      'Good morning',
    ];
    setDetectedText(samplePhrases[Math.floor(Math.random() * samplePhrases.length)]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-sky-200">
        <h2 className="text-3xl font-bold text-sky-600 mb-6">Sign Language to Text</h2>

        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <p className="text-yellow-800 font-semibold">
            Note: Full sign language recognition requires advanced AI models. This is a demonstration interface.
            In production, integrate with services like Google Cloud Vision AI or TensorFlow.js hand pose detection.
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            {isRecording ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-24 h-24 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Camera off</p>
                </div>
              </div>
            )}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2 animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full"></div>
                <span className="font-semibold">Recording</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={isRecording ? stopCamera : startCamera}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-sky-500 hover:bg-sky-600 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <CameraOff className="w-5 h-5" />
                  <span>Stop Camera</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Start Camera</span>
                </>
              )}
            </button>

            {isRecording && (
              <button
                onClick={simulateDetection}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white transition-all duration-200 shadow-lg"
              >
                <span>Simulate Detection</span>
              </button>
            )}
          </div>

          {detectedText && (
            <div className="mt-6 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border-2 border-sky-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-sky-600 mb-2">Detected Text:</h3>
                  <p className="text-2xl font-semibold text-gray-800">{detectedText}</p>
                </div>
                <button
                  onClick={() => speakText(detectedText)}
                  className="ml-4 bg-sky-500 text-white p-3 rounded-lg hover:bg-sky-600 transition-all duration-200"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 p-6 bg-sky-50 rounded-lg border-2 border-sky-200">
          <h3 className="font-bold text-sky-700 mb-3">How it works:</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-sky-500 mr-2">•</span>
              <span>Position yourself in front of the camera with good lighting</span>
            </li>
            <li className="flex items-start">
              <span className="text-sky-500 mr-2">•</span>
              <span>Perform sign language gestures clearly and slowly</span>
            </li>
            <li className="flex items-start">
              <span className="text-sky-500 mr-2">•</span>
              <span>The AI will detect hand positions and translate to text</span>
            </li>
            <li className="flex items-start">
              <span className="text-sky-500 mr-2">•</span>
              <span>Use the speaker button to hear the detected text</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
