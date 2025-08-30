# step1: start the containers
```
docker compose up --build
```

or

```
docker compose up
```

# step2: apply migrations
```
node migrate.js
```

# step3: seed the databases
```
node seeding.js
```

# stopping the containers
```
docker compose down
```

# completely clean the containers
```
docker compose down -v
```