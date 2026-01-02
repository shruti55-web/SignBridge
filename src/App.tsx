import { useState } from 'react';
import Navigation from './components/Navigation';
import TextToSign from './components/TextToSign';
import VoiceToSign from './components/VoiceToSign';
import SignToText from './components/SignToText';
import Dictionary from './components/Dictionary';
import History from './components/History';

function App() {
  const [activeTab, setActiveTab] = useState('text-to-sign');

  const renderContent = () => {
    switch (activeTab) {
      case 'text-to-sign':
        return <TextToSign />;
      case 'voice-to-sign':
        return <VoiceToSign />;
      case 'sign-to-text':
        return <SignToText />;
      case 'dictionary':
        return <Dictionary />;
      case 'history':
        return <History />;
      default:
        return <TextToSign />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
      <footer className="bg-white border-t-2 border-sky-200 mt-12 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            SignBridge - Empowering communication for deaf students and children
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Breaking barriers, building connections through technology
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
