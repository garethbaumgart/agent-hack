# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src

# Copy solution and project files
COPY ["MyNote.API/MyNote.API.csproj", "MyNote.API/"]
COPY ["MyNote.Application/MyNote.Application.csproj", "MyNote.Application/"]
COPY ["MyNote.Domain/MyNote.Domain.csproj", "MyNote.Domain/"]
COPY ["MyNote.Infrastructure/MyNote.Infrastructure.csproj", "MyNote.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "MyNote.API/MyNote.API.csproj"

# Copy source code
COPY . .

# Build application
WORKDIR "/src/MyNote.API"
RUN dotnet build "MyNote.API.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "MyNote.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime
WORKDIR /app
EXPOSE 8080

# Copy published application
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "MyNote.API.dll"]
