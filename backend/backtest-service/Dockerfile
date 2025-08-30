# Sử dụng Python base image
FROM python:3.9-slim

# Tạo thư mục làm việc
WORKDIR /app

# Copy file requirements vào container
COPY requirements.txt .

# Cài đặt thư viện
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn vào container
COPY . .

# Lệnh chạy Flask app
CMD ["python", "run.py"]
