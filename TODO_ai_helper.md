# Advanced AI Helper Upgrade

**Goal:** Replace rule-based /ai-chat with OpenAI GPT-4o-mini for real answers on sign language/questions.

**Files:**
- backend/app.py: Use OpenAI client for chat.completions.create

**Plan:**
1. Edit app.py /ai-chat route:
   - Get conversation history from session or param
   - GPT prompt: "You are sign language expert..."
   - Return reply

**Info:**
- OpenAI client loaded
- .env has OPENAI_API_KEY (assume set)
- Frontend ready

Proceed?

