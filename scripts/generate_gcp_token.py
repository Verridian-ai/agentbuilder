#!/usr/bin/env python3
import json
import time
import jwt
import requests
from google.auth import jwt as google_jwt

def generate_access_token():
    # Read service account credentials
    with open('user_input_files/agent-builder-482410-b770407ad459.json', 'r') as f:
        creds = json.load(f)
    
    # Create JWT token
    now = int(time.time())
    exp = now + 3600  # 1 hour
    
    # JWT payload
    payload = {
        'iss': creds['client_email'],
        'scope': 'https://www.googleapis.com/auth/cloud-platform',
        'aud': 'https://oauth2.googleapis.com/token',
        'exp': exp,
        'iat': now
    }
    
    # Create and encode JWT
    jwt_token = jwt.encode(payload, creds['private_key'], algorithm='RS256')
    
    # Exchange JWT for access token
    token_url = 'https://oauth2.googleapis.com/token'
    token_data = {
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': jwt_token
    }
    
    response = requests.post(token_url, data=token_data)
    
    if response.status_code == 200:
        token_info = response.json()
        access_token = token_info.get('access_token')
        if access_token:
            print("✅ Successfully generated Google Cloud access token!")
            print(f"Token type: {token_info.get('token_type', 'Bearer')}")
            print(f"Expires in: {token_info.get('expires_in', 'Unknown')} seconds")
            print(f"\n🎯 Access Token:\n{access_token}")
            return access_token
        else:
            print("❌ Error: No access token in response")
            return None
    else:
        print(f"❌ Error generating token: {response.status_code}")
        print(f"Response: {response.text}")
        return None

if __name__ == "__main__":
    generate_access_token()