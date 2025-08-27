# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file .csproj và restore
COPY websocket-gateway.csproj .
RUN dotnet restore websocket-gateway.csproj

# Copy toàn bộ source code và build
COPY . .
RUN dotnet publish websocket-gateway.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Chạy app
ENTRYPOINT ["dotnet", "websocket-gateway.dll"]
