#!/bin/bash
# Setup script for Respire Backend

echo "🚀 Setting up Respire Backend..."

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check .env
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found! Copy from .env.example and configure."
else
    echo "✅ .env file found"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file with MySQL and InfluxDB credentials"
echo "2. Create MySQL database: mysql -u root -p < schema.sql"
echo "3. Run the server: python -m uvicorn app.main:app --reload"
echo ""
echo "📖 Documentation: see README.md"
