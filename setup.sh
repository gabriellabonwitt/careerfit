#!/bin/bash
set -e

echo "=== CareerFit AI Setup ==="

# Backend
echo ""
echo "--- Installing Python dependencies ---"
cd backend
pip3 install -r requirements.txt

# Create .env if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo ""
  echo "⚠️  Created backend/.env — add your ANTHROPIC_API_KEY there!"
fi

cd ..

# Frontend
echo ""
echo "--- Installing Node dependencies ---"
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the app:"
echo "  Terminal 1 (backend):  cd backend && python3 app.py"
echo "  Terminal 2 (frontend): cd frontend && npm run dev"
echo ""
echo "Then open http://localhost:5173"
