FROM ubuntu:23.10

WORKDIR /app

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y \
    nodejs \
    python3 \
    python3-pip \
    python3-venv \
    gcc \
    postgresql-client \
    python3-dev \
    libc6 \
    && rm -rf /var/lib/apt/lists/*

# Create and activate virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Upgrade pip and install build tools
RUN pip install --no-cache-dir pip --upgrade
RUN pip install --no-cache-dir wheel setuptools

# Install Python requirements (excluding problematic package)
COPY requirements.txt .
RUN grep -v "cdp-agentkit-core" requirements.txt > requirements_filtered.txt && \
    pip install --no-cache-dir -r requirements_filtered.txt

# Copy application files
COPY src/ /app/src/
COPY migrations/ /app/migrations/

# Setup XMTP app
COPY xmtp-message-kit /app/xmtp-app
WORKDIR /app/xmtp-app
RUN npm install -g yarn && yarn install
WORKDIR /app

ENV PYTHONPATH=/app

EXPOSE 8000

# Add entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]