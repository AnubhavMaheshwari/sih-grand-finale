# SARTHI Chatbot

An AI-powered chatbot for educational institute data analysis, integrated with the SARTHI platform.

## Features

- 🤖 **AI-Powered Conversations**: Uses GROQ's Llama 3.1 model for intelligent responses
- 🛡️ **Content Safety**: Advanced content filtering for inappropriate content
- 🎤 **Voice Integration**: Speech-to-text and text-to-speech capabilities
- 🏫 **Institute Context**: Analyzes institute data with structured context
- 📊 **Educational Focus**: Specialized for educational institution analysis
- 🔒 **Policy Compliance**: Strict content policy enforcement

## Project Structure

```
chatbot/
├── src/
│   ├── main.py              # Main FastAPI application
│   ├── core/
│   │   └── content_filter.py # Content filtering system
│   ├── services/
│   │   └── llm_service.py   # LLM interaction service
│   └── routes/
│       ├── chat.py          # Chat endpoints
│       ├── institute.py     # Institute data endpoints
│       └── health.py        # Health check endpoints
├── data/                    # Data storage
├── venv/                    # Virtual environment
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── start.sh                # Startup script
└── README.md               # This file
```

## Quick Start

### 1. Prerequisites

- Python 3.8+
- GROQ API key (get from [groq.com](https://console.groq.com))

### 2. Setup

```bash
# Clone the repository (if not already done)
# Navigate to chatbot directory
cd chatbot

# Make startup script executable
chmod +x start.sh

# Run the startup script
./start.sh
```

The startup script will:
1. Create/activate virtual environment
2. Install dependencies
3. Set up environment variables
4. Start the chatbot server

### 3. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your GROQ API key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Start the Server

```bash
# Using the startup script (recommended)
./start.sh

# Or manually
source venv/bin/activate
python -m src.main
```

The server will start at: http://localhost:8000

## API Endpoints

### Chat Endpoints
- `POST /api/v1/chat` - Chat with the AI assistant
- `POST /api/v1/chat/validate` - Validate content appropriateness

### Institute Endpoints
- `POST /api/v1/institute/context` - Format institute data for chatbot context

### Health Endpoints
- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/llm` - LLM connectivity check
- `GET /api/v1/health/content-filter` - Content filter functionality check

## Frontend Integration

The chatbot is designed to work with the SARTHI frontend. The frontend sends institute data as context to the chatbot.

### Example Frontend Usage

```javascript
// Send a chat request with institute context
const response = await fetch('http://localhost:8000/api/v1/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: "What is the teacher-student ratio?",
    context: formattedInstituteData
  })
});
```

## Content Safety Features

The chatbot includes advanced content filtering for:

1. **Vulgar/Abusive Language**: Filters inappropriate language
2. **Sexual Content**: Blocks inappropriate sexual content
3. **Biased/Discriminatory Content**: Prevents biased statements
4. **Caste Discrimination**: Specifically filters caste-based discrimination

## Development

### Adding New Features

1. **New Routes**: Add to `src/routes/` directory
2. **New Services**: Add to `src/services/` directory
3. **Core Logic**: Add to `src/core/` directory

### Testing

```bash
# Run health checks
curl http://localhost:8000/api/v1/health

# Test chat endpoint
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello", "context": "Test context"}'
```

## Troubleshooting

### Common Issues

1. **GROQ API Key Missing**
   - Ensure `.env` file exists with `GROQ_API_KEY`
   - Check if the key is valid

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing process: `pkill -f "python.*src.main"`

3. **Import Errors**
   - Ensure virtual environment is activated
   - Reinstall dependencies: `pip install -r requirements.txt`

### Logs

Check the console output for detailed logs and error messages.

## License

Part of the SARTHI project - Educational Institution Analysis Platform
