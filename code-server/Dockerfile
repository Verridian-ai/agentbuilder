FROM codercom/code-server:latest

USER root

# Install Node.js 20, Python, Git, and common dev tools
RUN apt-get update && apt-get install -y \
    curl \
    git \
    python3 \
    python3-pip \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm typescript ts-node \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create workspace directory
RUN mkdir -p /home/coder/workspace && chown -R coder:coder /home/coder

USER coder

# Set working directory
WORKDIR /home/coder/workspace

# Install useful VS Code extensions
RUN code-server --install-extension ms-python.python \
    && code-server --install-extension dbaeumer.vscode-eslint \
    && code-server --install-extension esbenp.prettier-vscode \
    && code-server --install-extension bradlc.vscode-tailwindcss \
    && code-server --install-extension ms-azuretools.vscode-docker

# Expose port
EXPOSE 8080

# Environment variables
ENV PASSWORD=""
ENV HASHED_PASSWORD=""

# Start code-server with password authentication
# Set PASSWORD or HASHED_PASSWORD environment variable when deploying
# Generate hashed password with: echo -n "yourpassword" | npx argon2-cli -e
ENTRYPOINT ["/usr/bin/entrypoint.sh", "--bind-addr", "0.0.0.0:8080", "--auth", "password", "/home/coder/workspace"]
