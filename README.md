[yoga-sof.fr](https://yoga-sof.fr)
===

Website for the **Yoga Sof** organization.

_Site pour l'organisation **Yoga Sof**._

## Tasks

**[Access the board](https://github.com/FlorianCassayre/yoga-sof.fr/projects/1)**

## Deployment

The following steps should be followed (in that order) to deploy or upgrade in production:

* `git pull --ff-only` or `git clone git@github.com:FlorianCassayre/yoga-sof.fr.git` to fetch the source code
* Update or define `.env.production` according to the template `.env`
* `npm ci` to install the dependencies
* `npm run backup-production` to backup the current database, if there is any
* `npm run prisma-migrate-production` to run the database migration scripts
* `npm run generate-favicons` to generate the favicons
* `npm run build` to generate the production build (this operation consumes some memory, make sure the machine has enough)
* `npm run start-production` to start the production server

For a fresh install, you can additionally run `npx dotenv -e .env.production -- npx prisma db seed` to populate the
database with the initial whitelisted email addresses, as defined in `SEED_EMAILS_ADMIN`.

For a normal update, you may use the command `npm run update`. This command assumes that both the favicon and the environment did not change.
