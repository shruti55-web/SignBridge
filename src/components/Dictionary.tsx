import { useState, useEffect } from 'react';
import { Search, Volume2, Filter } from 'lucide-react';
import { supabase, SignDictionary } from '../lib/supabase';

export default function Dictionary() {
  const [signs, setSigns] = useState<SignDictionary[]>([]);
  const [filteredSigns, setFilteredSigns] = useState<SignDictionary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'greetings', 'common', 'needs', 'places', 'people', 'family', 'pronouns', 'emotions', 'learning'];

  useEffect(() => {
    fetchSigns();
  }, []);

  useEffect(() => {
    filterSigns();
  }, [searchQuery, selectedCategory, signs]);

  const fetchSigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sign_dictionary')
      .select('*')
      .order('word', { ascending: true });

    if (data && !error) {
      setSigns(data);
      setFilteredSigns(data);
    }
    setLoading(false);
  };

  const filterSigns = () => {
    let filtered = signs;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((sign) => sign.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((sign) =>
        sign.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSigns(filtered);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-sky-200">
        <h2 className="text-3xl font-bold text-sky-600 mb-6">Sign Language Dictionary</h2>

        <div className="mb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a word..."
                className="w-full pl-10 pr-4 py-3 border-2 border-sky-300 rounded-lg focus:outline-none focus:border-sky-500 text-lg"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-2">
            <Filter className="text-gray-500 w-5 h-5 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            <p className="text-sky-600 mt-4 font-semibold">Loading dictionary...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing <span className="font-bold text-sky-600">{filteredSigns.length}</span> signs
            </div>

            <div className="grid gap-4">
              {filteredSigns.map((sign) => (
                <div
                  key={sign.id}
                  className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border-2 border-sky-200 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
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
                        {sign.usage_count > 0 && (
                          <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-sm font-semibold">
                            Used {sign.usage_count}x
                          </span>
                        )}
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

            {filteredSigns.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No signs found matching your search.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
