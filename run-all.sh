#!/bin/bash
# Unified Commerce Platform - Start All Services

echo "🚀 Starting Unified Commerce Platform..."

# Start Backend
cd backend && npm start &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) on port 5000"

# Start POS Frontend
cd ../frontend-pos && npm start &
POS_PID=$!
echo "✅ POS Frontend started (PID: $POS_PID) on port 3000"

# Start eCommerce Frontend
cd ../frontend-ecommerce && npm start &
ECOM_PID=$!
echo "✅ eCommerce Frontend started (PID: $ECOM_PID) on port 3001"

echo ""
echo "📊 Services Running:"
echo "  Backend API:     http://localhost:5000"
echo "  POS Dashboard:   http://localhost:3000"
echo "  eCommerce Store: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $POS_PID $ECOM_PID; exit" SIGINT SIGTERM
wait
