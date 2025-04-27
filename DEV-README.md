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


## Testing Stripe Local Webhook:
### 1. Install Stripe CLI:
https://docs.stripe.com/stripe-cli

### 2. Login to Stripe CLI:
***PowerShell> stripe login***

### 3. Listen to Stripe events:
***PowerShell> stripe listen --forward-to https://localhost:5001/api/payments/webhook -e payment_intent.succeeded***

Ensure that the webhook secret from the CLI matches the one in appSettings.json.

**Note:** Does not seem to work from JetBrains IDE terminals. Windows PowerShell terminal works fine.