FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dev

WORKDIR /app

# copy csproj files first (restore cache)
COPY backend/FlexiBooker.Api/Flexibooker.Api.csproj backend/FlexiBooker.Api/
COPY backend/FlexiBooker.Application/FlexiBooker.Application.csproj backend/FlexiBooker.Application/
COPY backend/FlexiBooker.Domain/FlexiBooker.Domain.csproj backend/FlexiBooker.Domain/
COPY backend/FlexiBooker.Infrastructure/FlexiBooker.Infrastructure.csproj backend/FlexiBooker.Infrastructure/

# restore explicitly
RUN dotnet restore backend/FlexiBooker.Api/Flexibooker.Api.csproj

# copy full backend
COPY backend ./backend

WORKDIR /app/backend/FlexiBooker.Api

ENV DOTNET_USE_POLLING_FILE_WATCHER=1
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

CMD ["dotnet", "watch", "run", "--no-launch-profile"]
