## Backend

To get started:

```
yarn start:dev
```

### Postgres

```
brew install postgresql
brew services start postgresql
psql postgres
CREATE USER victoruser WITH PASSWORD 'victorpassword';
ALTER USER victoruser WITH SUPERUSER;
CREATE DATABASE victordb;
```

now update your .env file with this:

```
DATABASE_URL="postgresql://victoruser:victorpassword@localhost:5432/victordb"
```

### Prisma

We use prisma for DB connections. Make sure you have a postgres instance stood up.

Run this to run existing migrations on DB:

```
yarn prisma migrate dev
```

When you add a schema to schema.prisma, use these commands:

```
yarn prisma migrate dev
yarn prisma generate
```

To browse data use:

```
yarn prisma studio
```

# Running files

```
npx ts-node src/playground.ts
```

# Notebooks
Buggy, but still potentially helpful.

Install tslab: https://github.com/yunabe/tslab?tab=readme-ov-file#installing-tslab-1
Then, use vscode to open notebooks/notebook-1