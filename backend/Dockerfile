FROM python:3.10-slim

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip setuptools wheel
RUN pip install typing-extensions
RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu128

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000

CMD [ "uvicorn",  "main:app", "--host", "0.0.0.0", "--port", "8000"]
