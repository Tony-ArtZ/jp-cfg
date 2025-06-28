#!/bin/bash

echo "🔍 Checking monitoring stack health..."

echo "📊 Checking service status..."
docker-compose ps

echo ""
echo "🎯 Testing endpoints..."

echo -n "Prometheus (9090): "
if curl -s http://localhost:9090/-/healthy > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding"
fi

echo -n "Grafana (3001): "
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding"
fi

echo -n "Loki (3100): "
if curl -s http://localhost:3100/ready > /dev/null; then
    echo "✅ Ready"
else
    echo "❌ Not ready"
fi

echo -n "Jaeger (16686): "
if curl -s http://localhost:16686/ > /dev/null; then
    echo "✅ Healthy"
else
    echo "❌ Not responding"
fi

echo -n "Backend metrics (3000/metrics): "
if curl -s http://localhost:3000/metrics > /dev/null; then
    echo "✅ Available"
else
    echo "❌ Not available"
fi

echo ""
echo "🚀 Access URLs:"
echo "  Grafana:    http://localhost:3001 (admin/admin)"
echo "  Prometheus: http://localhost:9090"
echo "  Jaeger:     http://localhost:16686"
echo "  App:        http://localhost:3000"
echo ""
echo "📝 To view logs in real-time:"
echo "  docker-compose logs -f backend"
echo "  docker-compose logs -f loki"
echo "  docker-compose logs -f promtail"
