# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy file .csproj và restore
COPY finance-Socket.csproj .
RUN dotnet restore finance-Socket.csproj

# Copy toàn bộ source code và build
COPY . .
RUN dotnet publish finance-Socket.csproj -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Chạy app
ENTRYPOINT ["dotnet", "finance-Socket.dll"]
