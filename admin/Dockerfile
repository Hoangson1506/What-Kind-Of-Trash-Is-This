# Sử dụng Node.js version 18 (hoặc phiên bản tương thích với Next.js của bạn)
FROM node:18-alpine

# Đặt working directory trong container
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Xây dựng ứng dụng Next.js
RUN npm run build

# Expose port 3000 (mặc định của Next.js)
EXPOSE 3000

# Môi trường chạy (tùy chọn: cấu hình biến môi trường nếu cần)
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

# Chạy ứng dụng
CMD ["npm", "start"]