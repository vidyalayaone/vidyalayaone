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
node migrate-dev.js
```

# step3: seed the databases
```
node seeding-dev.js
```

# stopping the containers
```
docker compose down
```

# completely clean the containers
```
docker compose down -v
```