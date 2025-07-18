References to helpful commands for development.

## Entity Framework:
###  Create migration:
`SolutionFolder> dotnet ef migrations add InitialCreate -s API -p Infrastructure`

### Create database:
`SolutionFolder> dotnet ef database update -s API -p Infrastructure`

### Drop database:
`SolutionFolder> dotnet ef database drop -s API -p Infrastructure`


## Docker:
A docker-compose.yml file is included within the repo to run the Sql Server and Redis containers for local development.

### Build and run the containers:
`SolutionFolder> docker-compose up -d`

### Stop the containers:
`SolutionFolder> docker-compose down`

### Remove the containers and volumes:
`SolutionFolder> docker-compose down -v`


## Testing Stripe Local Webhook:
Make sure you have a Stripe account setup for this application and have added the secret key to `StripeSettings:SecretKey`

### 1. Install Stripe CLI:
https://docs.stripe.com/stripe-cli

### 2. Login to Stripe CLI:
`>> stripe login`

### 3. Listen to Stripe events:
`>> stripe listen --forward-to https://localhost:5001/api/payments/webhook -e payment_intent.succeeded`

Ensure the `StripeSettings:WhSecret` config setting matches the one returned by the CLI.


## Deployment to Azure:
**Note:** Steps assume an Azure App Service and Azure SQL Database are already set up and IDE is configured for Azure deployment.
#### 1. Ensure client angular.json build outputPath is set to `../API/wwwroot`
#### 2. Build client application with `ng build`
#### 3. Publish the API project to Azure.