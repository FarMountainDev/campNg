Some helpful commands for development.

###  Create migration:
***SolutionFolder> dotnet ef migrations add InitialCreate -s API -p Infrastructure***

### Create database:
***SolutionFolder> dotnet ef database update -s API -p Infrastructure***

### Drop database:
***SolutionFolder> dotnet ef database drop -s API -p Infrastructure***