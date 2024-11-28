# database

This module permits you to interact with a database, to handle your migrations and your models.

For now on, only the SQLite database provider is implemented, but you can implement other providers on your own using the API (more info at the bottom of this file).

It uses [Knex](https://knexjs.org/) under the hood, but maybe I'll create a homemade SQL query builder (one day).

Please note that foreign keys aren't planned to be implemented. If you want to link two tables create a field in the first one that contains the second table primary key.

DISCLAIMER: some features are not fully available or tested (alter table, findByWithSQL, SQL injection avoider), please consider test them yourselves before using these features.

Note: you can install the SQLite Viewer VS code extension (from Florian Klampfer) to view your database directly from the IDE.

## Start

Create a migration and then run it (more infos at the next section). And run it.

The default database provider is SQLite, but you can choose to use PostgreSQL provider if you want by updating the app's config (change the ``PROVIDER`` and ``CONFIG``).

You can edit the name of the database file by setting a `DATABASE_NAME` in your `.env` file.

## Migrations

The migrations can help you to define the tables of your database.

To use them, you'll need to create a directory (if not already created) `src/app/migrations`, with in it, an `index.ts` file.

<pre>index.ts</pre>
```ts
import { BaseMigration } from "#database"

import { AddPostMigration } from "./add_post"


const migrations: any = {
    'add_post': new AddPostMigration(),
}

Object.keys(migrations).forEach(key => BaseMigration.runMigration(key, migrations[key]))
```

### Create a migration

You have to create a new file in the `migrations` directory. For this example I will create a Post migration.

So, here's my migration:

<pre>add-post.ts</pre>
```ts
import { BaseMigration, provider, Table } from "#database"

export class AddPostMigration extends BaseMigration {
    protected table = {
        name: "posts",
        columns: [
        ]
    }

    public async up() {
    }

    public async down() {
    }
}
```

### Define tables

To define tables, you have to put columns into your table. Watch out:

<pre>add-post.ts</pre>
```ts
// ...

export class AddPostMigration extends BaseMigration {
    protected table = {
        name: "posts",
        columns: [
            {
                name: 'id',
                type: 'INTEGER',
                isNotNull: true,
                isPrimaryKey: true,
                isUnique: true,
                // isAutoincrement: true  // Nota: I won't use autoincrement to handle ids in this example
            },
            {
                name: 'title',
                type: 'TEXT',
                isNotNull: true
            },
            {
                name: 'content',
                type: 'TEXT',
                isNotNull: true,
            }
        ]
    }

    // ...
```

Nota: here's the column typing:
```ts
type Column = {
    name: string
    /** type of the contained value */
    type: 'TEXT' | 'INTEGER' | 'NULL' | 'REAL' | 'BLOB'
    default?: string
    isAutoIncrement?: boolean
    isNotNull?: boolean
    isPrimaryKey?: boolean
    isUnique?: boolean
}
```

Don't forget to create the `up()` and `down()` methods, the first one to set the migration up, and the second to cancel it.

```ts
    public async up() {
        provider.createTable(this.table)
    }
    
    public async down() {
        provider.dropTable(this.tableName)
    }
```

### Drop

You can drop a table using `provider.dropTable(this.tableName)`.

### Run migrations

Now we finished implementing your migration, we want to run it.

So we import our migration into `src/app/migrations/index.ts` and we create a new instance of the migration class in the `migrations` object:

<pre>index.js</pre>
```ts
//...
import { AddPostMigration } from "./add_post"

const migrations: any = {
    'add_post': new AddPostMigration()
}
//...
```

Then, we need to run the migration, so we open our project in the console, and we run the command 'migrate' from `package.json`. It will create the database file and run the migration after.

Nota: flags.

You can specify the migration key (from the migrations object from `src/app/migrations/index.ts`), and set it on up if you want to run this migration.

Example (in this case): `pnpm migrate add_post=up`, but you can put `add_post=down`. If it isn't specified, nothing happends.

If you don't put any flag, all registred migrations that were not runned (their names aren't situated in the migrations.json at the root of the project) will be runned (mode up). If you specify a key, only the migration.s specified will be executed.

### Alter table

This isn't fully tested, so please do some tests before using these features.

You can look at the code if you want more informations about it.

## Models

You can see the models as a database handler of datas. In other words, the model isn't a data container, but an interface between database and main code, you'll see what I want to say.

Nota: all the methods are static and async.

### Create a model

You need to create a directory named `src/app/models` and you create a new file containing your model in it.

Example: 
<pre>post.ts</pre>
```ts
import { BaseModel } from "#database"

import { AddPostMigration } from "../migrations/add_post"

export class Post extends BaseModel {
    public static table = (new AddPostMigration()).getTable()  // this is to avoid the rewriting of the table

    // if your (main) private key isn't 'id', change it there
    protected idCol: string = 'your_main_private_key_column_name'
    
    // don't forget to declare the fields in the model
    declare id: string

    declare title: string

    declare content: string
}
```

Please note that you can override every method of BaseModel if you need something more complex (you can see an example in the Auth module).

### Get

There's many ways to get datas from database with this system.

#### Model.find(id: string | number): Promise<BaseModel> (static)

You can get an item with its primary key.

#### Model.findBy(key: string, value: string, operator: Operator = '='): Promise<BaseModel[]> (static)

You can get many items using this function (key param stands for the column name, the value stands for the value to be compared, and the operator stands for the operation between key and the value)

#### Model.findWithSql(condition: string): Promise<BaseModel[]> (static) (**depreciated**)

Supposed to return an array of models selected with a SQL selection, `condition`.

WARNING: escaping not provided. Consider this feature as experimental.

Warning: depreciated. Instead use `provider.query()` (returns an instance of Knex).

#### Model.findAll(): Promise<BaseModel[]> (static)

Returns all items of a table.

### Create

#### Model.create(options: ModelObject): Promise<BaseModel> (static)

Creates a new object in the database and returns it.

### Edit/save

#### model.save(): Promise<void>

Let's have a demo:

```ts
    const post = new Post()
    post.id = "...."
    post.title = "hello there"
    post.content = "."

    // right now my model ("post") isn't stocked in the db

    post.save()

    // now it is

    post.content = "new content" // the update isn't stocked in the db, but the new value is stocked in the model's data

    post.save() // the changes have been stocked in the db
```

### Delete

#### model.destroy(): Promise<void>

Destroys the item specified.

### Format data

#### model.toObject(): ModelObject

Returns the model data stocked in model.data, not the data from db (the difference is that the model.data may be different than db because it stores values updates before saving in the db).

#### model.toJson(): string

Returns the model data stocked in model.data as JSON.

### Serializing

#### model.serialize(fields: Serialize): ModelObject | undefined

Serializes the model according to provided fields.

This is the typing of fields:
```ts
type Serialize = {
    [keys: string]: {
        serializeAs?: string
        doSerialize?: (value: string | number) => string
    }
}
```

There's a little example:
```ts
const posts = await Post.findAll() as Post[]

const postsSerialized: ModelObject[] = await new Promise((resolve, reject) => {
    let serialized: ModelObject[] = []

    posts.forEach(async post => {
        const postSerialized = post.serialize({
            id: {
                serializeAs: "postId"
            },
            title: {
                doSerialize: (value: string | number) => `${value.toString().slice(0, 10)}...`
            }
        })
        serialized.push(postSerialized!)
    })
    
    resolve(serialized)
})
```

## Seeders

You can create seeders if you want to create items automatically.

Let's create a file `post.ts` in the directory named `src/app/seeders`.

```ts
import { Post } from "../models/post"
import { BaseSeeder } from "#database"


export class PostSeeder extends BaseSeeder {
    public async run() {
        await Post.create({
            id: Date.now(),
            title: "created by seeder",
            content: "this is a post created by the seeder"
        })
    }
}
```

Now, register the seeder (as for migrations):

```ts
import { BaseSeeder } from "#database"

import { PostSeeder } from "./post"


const seeders: { [key: string]: BaseSeeder } = {
    "create_initial_post": new PostSeeder()
}

Object.keys(seeders).forEach(key => BaseSeeder.runSeeder(key, seeders[key]))
```

Then run `pnpm run run:seeders create_initial_post`.

Nota: you must specify the seeder key to run the seeder.

## Usage of the providers' API

You might need to use the providers' API without models to create complex requests to your database.

The databases providers are implementing ``DatabaseProviderInterface``:

### connectDb(dbPath: string): void

Connect the DB for interaction.

### closeConnection(): void

Closes the connection after transaction.

### get db(): any | undefined

Returns the DB object.

### get dbPath(): string

Returns the DB path.

### createTable: (table: CreateTable) => void

Permits to create a new table.

### alterTable: (table: AlterTable) => void

Permits to alter a table, usefull for migrations.

Warning: not implemented yet.

### dropTable: (table: Table) => void

Drops a table.

### async query<T extends ModelObject>(sql: string, params?: string[])

It permits to run a query by specifying a raw SQL query to your DB.

### select <T extends ModelObject> (table: Table, condition?: any): Promise<T[]>

Runs a select query.

Nota: if you want to select all columns, don't set the them on the ``table`` argument.

Example:

We have a ``posts`` table with these columns: ``id``, ``title``, ``content``.

If we want to get all these columns, you can do :
```ts
    const posts = await provider.select((new AddPostsMigration()).getTable(), "..") // get the cols directly specifying the table

    // OR

    const posts = await provider.select({ name: "posts" }, "...")  // create a "new table" with only the name
```

### insert <T extends ModelObject> (table: Table, value: T): Promise<T>

Runs an insert query.

### update <T extends ModelObject> (table: Table, condition: any, value: T): Promise<T>

Runs an update query.

Nota: same remark as ``select``.

### delete <T extends ModelObject> (table: Table, condition: any): Promise<T[]>

Runs an delete query.

Nota: same remark as ``select`` and ``update``.
