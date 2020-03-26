# CodeChef Contest Arena

## Setting up development environment
- Clone this repository
- Get `composer` and `yarn` installed on your system
- Run `composer install` at the root directory of the project
- Ensure to set all environment variables mentioned in `.env.example` file ( Add export statements to .bashrc, if you are on Linux )
- Make sure you create the database with the name mentioned in your env variable `DB_NAME`
- Finally, run `php -S 0.0.0.0:2304` to start the backend server
- Next, get inside `client/` directory and run `yarn install`
- And, run `yarn serve` to start the web app
- Wait until React automatically opens the browser for you :)
