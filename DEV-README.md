Some helpful commands for development.

## Entity Framework:
###  Create migration:
***SolutionFolder> dotnet ef migrations add InitialCreate -s API -p Infrastructure***

### Create database:
***SolutionFolder> dotnet ef database update -s API -p Infrastructure***

### Drop database:
***SolutionFolder> dotnet ef database drop -s API -p Infrastructure***


## Docker:
### Build and run the containers:
***SolutionFolder> docker-compose up -d***

### Stop the containers:
***SolutionFolder> docker-compose down***

### Remove the containers and volumes:
***SolutionFolder> docker-compose down -v***