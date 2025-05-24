# What of kind trash is this? 

An AI-powered web application that helps users identify and correctly dispose of waste materials through image detection. The systems provides real-time detection of trash types and guides on how to handle the waste properly and efficiently. 

## About

With environmental pollution reaching critical levels, our team of AI undergraduate students in Vietnam wants to contribute some of our knowledge to this movement. We're passionate about using what we've learned to help make our country greener and cleaner. In Vietnam, there's a big push to improve the environment, but many people aren't sure how to sort their trash or dispose of it properly. Our Web aims to fix that by letting users upload photos, videos of trash, or use real-time webcam and get instant feedback on what type it is, along with simple tips on how to handle it. We hope this tool makes waste management easier for everyone and supports Vietnam's efforts to build a more sustainable future.

## Features

- 🔍 **Real-time Trash Detection**
  - Upload images or use webcam
  - Support for video processing
  - High-accuracy AI model for waste classification
  - Bounding box visualization

- 🗺️ **Disposal Point Locator**
  - Find nearby waste disposal facilities
  - Interactive map interface
  - Real-time directions
  - Detailed facility information

- 🌍 **Multilingual Support**
  - English and Vietnamese interfaces
  - Easy language switching
  - Localized content and instructions

- 📱 **User-Friendly Interface**
  - Intuitive drag-and-drop upload
  - Real-time processing feedback
  - Detailed disposal instructions
  - Recent detection history

## Supported Trash Types

- Paper
- Glass
- Metal
- Plastic
- Food waste
- Other

## Technology Used

- **Frontend**: React.js
- **Backend**: FastAPI
- **Image Detection Model**: YOLO
- **Database**: ...

## Prerequisites (optional for developers)
- Node.js 18.0 or higher
- NPM or Yarn
- Python installed

## Installation
### Without Docker Hub
A step-by-step instructions to set up project locally.

1. Clone the repository and navigate to the project directory:
``` 
git clone https://github.com/Hoangson1506/What-Kind-Of-Trash-Is-This.git
cd What-Kind-Of-Trash-Is-This
```
2. Run the server:
```
docker-compose up -d
```

### With Docker Hub
Guide to set up project by using Docker Hub.
1. Pull image:
```
docker pull ...
```
2. Get our `docker-compose.yml` file.
3. Run the server:
```
docker-compose up -d
```

### For contributors
1. Clone the repository and navigate to the project directory:
``` 
git clone https://github.com/Hoangson1506/What-Kind-Of-Trash-Is-This.git
cd What-Kind-Of-Trash-Is-This
```
2. Install backend requirements:
```
cd backend
pip install -r requirements.txt
```
3. Install frontend requirements:
```
cd ../frontend
npm install
```
4. Run the server:
```
cd ../backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
cd ../frontend
npm run dev
```

## Usage
After installation, go to your prefer web browser (Microsoft Edge, Google Chrome, Firefox,...) and open [http://localhost:5173](http://localhost:5173). Feel free to mess around and try our web features. The UI already have guides to use the Web.

# Group Information
Our group comprises of 4 members:
- Hoàng Sơn: Frontend + Backend Developer
- Phạm Minh Tú: Backend + Database Developer
- Nguyễn Công Trình: Model Developer
- Nguyễn Công Vinh: Admin Page Developer
