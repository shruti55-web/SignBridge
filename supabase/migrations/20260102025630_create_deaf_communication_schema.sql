/*
  # Deaf Communication Platform Schema

  1. New Tables
    - `sign_dictionary`
      - `id` (uuid, primary key) - Unique identifier for each sign
      - `word` (text) - The word or phrase in English
      - `category` (text) - Category (greetings, common, alphabet, numbers, etc.)
      - `sign_description` (text) - Description of how to perform the sign
      - `video_url` (text, optional) - URL to sign language video demonstration
      - `image_url` (text, optional) - URL to sign language image
      - `difficulty` (text) - Difficulty level (easy, medium, hard)
      - `usage_count` (integer) - Track how often this sign is used
      - `created_at` (timestamptz) - When the entry was created

    - `conversation_history`
      - `id` (uuid, primary key) - Unique identifier for each conversation entry
      - `user_id` (uuid, optional) - User identifier if auth is added later
      - `input_text` (text) - The original text/speech input
      - `input_type` (text) - Type of input (text, voice, sign)
      - `output_type` (text) - Type of output (sign, text, voice)
      - `signs_used` (text[]) - Array of signs that were shown
      - `created_at` (timestamptz) - When the conversation happened

  2. Security
    - Enable RLS on all tables
    - Allow public read access to sign_dictionary (educational resource)
    - Allow public insert/read access to conversation_history (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS sign_dictionary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL,
  category text NOT NULL DEFAULT 'common',
  sign_description text NOT NULL,
  video_url text,
  image_url text,
  difficulty text DEFAULT 'easy',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  input_text text NOT NULL,
  input_type text NOT NULL,
  output_type text NOT NULL,
  signs_used text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sign_dictionary ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sign dictionary"
  ON sign_dictionary FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update sign usage count"
  ON sign_dictionary FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read conversation history"
  ON conversation_history FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert conversation history"
  ON conversation_history FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_sign_dictionary_word ON sign_dictionary(word);
CREATE INDEX IF NOT EXISTS idx_sign_dictionary_category ON sign_dictionary(category);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at DESC);

-- Insert sample sign language dictionary data
INSERT INTO sign_dictionary (word, category, sign_description, difficulty) VALUES
  ('Hello', 'greetings', 'Open hand near forehead, move forward in a small arc (like a salute)', 'easy'),
  ('Thank you', 'greetings', 'Touch fingers to chin, then move hand forward and down', 'easy'),
  ('Please', 'greetings', 'Open hand on chest, move in circular motion', 'easy'),
  ('Yes', 'common', 'Fist with closed hand, move up and down like nodding', 'easy'),
  ('No', 'common', 'Index and middle finger tap thumb (like a mouth closing)', 'easy'),
  ('Help', 'common', 'Place fist on flat palm, lift both hands up together', 'easy'),
  ('Sorry', 'greetings', 'Fist on chest, move in circular motion', 'easy'),
  ('Good', 'common', 'Flat hand near mouth, move down to other flat hand', 'easy'),
  ('Bad', 'common', 'Flat hand near mouth, move down and flip away', 'easy'),
  ('Water', 'needs', 'W handshape, tap chin twice', 'medium'),
  ('Food', 'needs', 'Flat O handshape, tap mouth twice', 'easy'),
  ('Eat', 'needs', 'Flat O handshape, move to mouth repeatedly', 'easy'),
  ('Drink', 'needs', 'C handshape near mouth, tilt back like drinking', 'easy'),
  ('Bathroom', 'needs', 'T handshape, shake side to side', 'medium'),
  ('Home', 'places', 'Flat O handshape, move from mouth to cheek', 'easy'),
  ('School', 'places', 'Clap hands twice', 'easy'),
  ('Friend', 'people', 'Hook index fingers together, then reverse', 'medium'),
  ('Teacher', 'people', 'Flat O handshapes at temples, move forward and close', 'medium'),
  ('Mother', 'family', 'Open hand, thumb on chin', 'easy'),
  ('Father', 'family', 'Open hand, thumb on forehead', 'easy'),
  ('I', 'pronouns', 'Point to yourself with index finger', 'easy'),
  ('You', 'pronouns', 'Point to other person with index finger', 'easy'),
  ('We', 'pronouns', 'Index finger, move from one shoulder to other', 'medium'),
  ('Happy', 'emotions', 'Open hands brush up chest twice', 'easy'),
  ('Sad', 'emotions', 'Open hands move down face', 'easy'),
  ('Love', 'emotions', 'Cross fists over heart', 'easy'),
  ('Understand', 'learning', 'Index finger on forehead, flick up', 'medium'),
  ('Learn', 'learning', 'Open hand on flat palm, move to forehead', 'medium'),
  ('Read', 'learning', 'V handshape, move down flat palm', 'medium'),
  ('Write', 'learning', 'Pinch thumb and index, write on flat palm', 'medium')
ON CONFLICT DO NOTHING;