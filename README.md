# yoga-sof.fr

## Installation

You will need Node and pnpm:

```shell
pnpm i
```

## Database setup

The application connects to a PostgreSQL database, which you will need to set up separately.

### Database creation

#### Existing PostgreSQL instance

If you already have PostgreSQL installed, you can create the user and database:

```shell
sudo -u postgres psql
```

```shell
create user yoga_sof with password 'change-me';
create database yoga_sof owner yoga_sof;
grant all privileges on database yoga_sof to yoga_sof;
```

(exit with `\q`)

#### Docker

Alternatively, you may run PostgreSQL in a Docker container:

```shell
docker pull postgres
docker run --name yoga-sof-postgres -e POSTGRES_USER=yoga_sof -e POSTGRES_PASSWORD=change-me -d -p 5432:5432 postgres
```

### Environment variable

Then you need to update `.env` with the correct environment variable:

```shell
DATABASE_URL=postgresql://yoga_sof:change-me@localhost:5432/yoga_sof
```

## Google authentication

Authentication uses Google. Create an OAuth client ([Google Cloud Console](https://console.cloud.google.com/apis/credentials)), one per environment, of type "Web application" and with:

|                  | Development                                      | Production                                     |
| ---------------- | ------------------------------------------------ | ---------------------------------------------- |
| Allowed origins  | `http://localhost:3000`                          | `https://yoga-sof.fr`                          |
| Redirection URIs | `http://localhost:3000/api/auth/callback/google` | `https://yoga-sof.fr/api/auth/callback/google` |

Then set the credentials of the development client in `.env`:

```shell
AUTH_GOOGLE_ID=<client id>
AUTH_GOOGLE_SECRET=<client secret>
```
