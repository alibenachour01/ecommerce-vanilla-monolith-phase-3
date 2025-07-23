### local queries for quick db manipulation

```bash
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=admin DB_PASSWORD=admin123 DB_NAME=ecommerce pnpm typeorm query "your-sql-query"
``` 

**show all users**
```bash
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=admin DB_PASSWORD=admin123 DB_NAME=ecommerce pnpm typeorm query "SELECT * FROM users"
``` 

**show all products**
```bash
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=admin DB_PASSWORD=admin123 DB_NAME=ecommerce pnpm typeorm query "SELECT * FROM products"
```     

**alter user role**
```bash
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=admin DB_PASSWORD=admin123 DB_NAME=ecommerce pnpm typeorm query "UPDATE users SET role = 'admin' WHERE email = 'user@example.com"
``` 

**generate migrations**
```bash
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=admin DB_PASSWORD=admin123 DB_NAME=ecommerce pnpm typeorm migration:generate -n MigrationName
```

**reset schema**
```bash
DB_HOST=localhost DB_PORT=5432 DB_USERNAME=admin DB_PASSWORD=admin123 DB_NAME=ecommerce pnpm typeorm schema:drop
``` 
