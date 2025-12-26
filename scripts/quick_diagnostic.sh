#!/bin/bash

# Agent Builder Platform - Quick Diagnostic Script
# This script will test connectivity and provide specific error analysis

echo "🔍 Agent Builder Platform - Quick Diagnostic"
echo "=============================================\n"

SERVICE_URL="https://agent-builder-339807712198.australia-southeast1.run.app"

echo "Testing connectivity to: $SERVICE_URL"
echo ""

# Test basic connectivity
echo "1. Testing HTTP response..."
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" --connect-timeout 10)
echo "HTTP Status Code: $HTTP_RESPONSE"

if [ "$HTTP_RESPONSE" = "200" ]; then
    echo "✅ Service is responding normally"
elif [ "$HTTP_RESPONSE" = "403" ]; then
    echo "❌ FORBIDDEN ERROR - Service is deployed but blocked"
    echo "   This usually means:"
    echo "   • Service is stopped or crashed"
    echo "   • Authentication settings are incorrect"
    echo "   • Environment variables are missing"
elif [ "$HTTP_RESPONSE" = "404" ]; then
    echo "❌ NOT FOUND - Service may not exist"
    echo "   This means:"
    echo "   • Service was never deployed"
    echo "   • Service was deleted"
    echo "   • Wrong URL"
elif [ "$HTTP_RESPONSE" = "000" ]; then
    echo "❌ CONNECTION FAILED - Service is unreachable"
    echo "   This means:"
    echo "   • Service is down"
    echo "   • Network issues"
    echo "   • URL is incorrect"
else
    echo "⚠️  UNEXPECTED STATUS: $HTTP_RESPONSE"
fi

echo ""

# Test health endpoint
echo "2. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s "$SERVICE_URL/health" --connect-timeout 5)
if [ $? -eq 0 ]; then
    echo "Health response: $HEALTH_RESPONSE"
else
    echo "❌ Health endpoint unreachable"
fi

echo ""

# Check DNS resolution
echo "3. DNS Resolution Check..."
DNS_CHECK=$(nslookup "$SERVICE_URL" 2>/dev/null | grep "NXDOMAIN" || echo "DNS OK")
if [ "$DNS_CHECK" = "NXDOMAIN" ]; then
    echo "❌ DNS resolution failed - domain does not exist"
else
    echo "✅ DNS resolution successful"
fi

echo ""
echo "📋 Diagnostic Summary"
echo "====================="

if [ "$HTTP_RESPONSE" = "200" ]; then
    echo "🟢 Service Status: HEALTHY"
    echo "✅ No action needed - service is working normally"
elif [ "$HTTP_RESPONSE" = "403" ]; then
    echo "🟡 Service Status: DEPLOYED BUT BLOCKED"
    echo "🔧 Fix Required: Redeploy or restart the Cloud Run service"
    echo "📖 See DEPLOYMENT-FIX-INSTRUCTIONS.md for detailed steps"
elif [ "$HTTP_RESPONSE" = "404" ]; then
    echo "🔴 Service Status: NOT FOUND"
    echo "🔧 Fix Required: Deploy the service to Cloud Run"
    echo "📖 See DEPLOYMENT-FIX-INSTRUCTIONS.md for deployment steps"
elif [ "$HTTP_RESPONSE" = "000" ]; then
    echo "🔴 Service Status: DOWN"
    echo "🔧 Fix Required: Check service status and redeploy if needed"
else
    echo "🟠 Service Status: UNKNOWN ($HTTP_RESPONSE)"
    echo "🔧 Fix Required: Manual investigation needed"
fi

echo ""
echo "💡 Quick Actions:"
echo "1. Check Google Cloud Console: https://console.cloud.google.com/run"
echo "2. Verify service status and logs"
echo "3. Redeploy if necessary"
echo "4. Test with health endpoint: $SERVICE_URL/health"