# (m)ake (t)e(m)p(l)ate
Is a command line tool that allows the user to create templates from a data source.

The data source preferably is a `JSON` object or a `JSON` file, if you'd like to provide a data source from a different file type you'll have to write your own parser (`mtml` allows you to provide a parser).

The templates use [EJS](http://ejs.co/) style syntax, to prevent collision `mtml` uses dollar sign `<$ $>` brackets.

# TLDR setup

Let it be that we are working on a back-end in [NestJS](https://nestjs.com/) that requires you to build the API endpoint for each database **entity**. Hypothetically we are using Typescript on the back-end with [TypeORM](http://typeorm.io).

## Create an project directory
Create an empty directory for this small test.

## Create entity
Lets define our first **entity**, create a file inside of your project's directory: `user.json`:

```json
{
    "name": "User",
    "data": [
        { "field": "id", "type": "number" },
        { "field": "name", "type": "string" },
        { "field": "age", "type": "number" }
    ]
}
```
A simple enough **entity** called User with 3 fields, each of a certain name and type. It is purely up to the developer what data goes into the **entity** file and how to structure it.

## Creating templates
Now lets define **templates** for: creating the **entity**, creating the database service and creating the api endpoint.

Keep in mind that the created code's syntax may not be accurate or structurally sound, it is just to show how `mtml` works.

## Database entity template
Create a file inside of your project's directory and name it `db-entity.template.mtml`.

```html
@Entity()
export class <$= e.name $> {

<$_ e.data.forEach(function(item) { _$>
<$_ if (item.field === 'id') { _$>
    @PrimaryGeneratedColumn()
<$_ } else { _$>
    @Column()
<$_ } _$>
    <$= item.field $>: <$= item.type $>;

<$_ }) _$>
}
```
Note the `e` variable. `e` is basically your **entity** that you defined in the `user.json` file.
Brakedown: name the class the same way as you named your **entity**. Then iterate through the data array: for each element create a new section for TypeORM. If the field is called id then make it a primary column, otherwise just a normal column.
Note the usage of `<$_ _$>` to collapse blank lines.

## Database service template
Create a file inside of your project's directory and name it: `db-service.template.mtml`.

```html
<$_ var entityName = e.name _$>
<$_ var lEntityName = v.decapitalize(e.name) _$>
export class Db<$= entityName $>Service {

    constructor(
        @InjectRepository(<$= entityName $>)
        private readonly <$= lEntityName $>Repository: Repository<<$= entityName $>>,
    ) { }

    /**
     * Find all <$= lEntityName $>s by query
     * @param query The query object (optional)
     * @throws ServerErrorException Server Error Exception
     */
    async find(query?: any): Promise<<$= entityName $>[]> {

        let <$= lEntityName $>s: <$= entityName $>[];

        try {
            <$= lEntityName $>s = await this.<$= lEntityName $>Repository.find(query);
        } catch {
            throw new ServerErrorException();
        }

        return <$= lEntityName $>s;
    }

    /**
     * Find a <$= lEntityName $> by query
     * @param query The query object
     * @throws ServerErrorException Server Error Exception
     */
    async findOne(query: any): Promise<<$= entityName $>> {

        let <$= lEntityName $>: <$= entityName $>;

        try {
            <$= lEntityName $> = await this.<$= lEntityName $>Repository.findOne(query);
        } catch {
            throw new ServerErrorException();
        }

        return <$= lEntityName $>;
    }

    /**
     * Save a <$= lEntityName $> into the database
     * @param <$= lEntityName $> <$= entityName $> object
     * @throws ServerErrorException Server Error Exception
     */
    async save(<$= lEntityName $>: <$= entityName $>): Promise<<$= entityName $>> {

        try {
            <$= lEntityName $> = await this.<$= lEntityName $>Repository.save(<$= lEntityName $>);
        } catch {
            throw new ServerErrorException();
        }

        return <$= lEntityName $>;
    }
}
```
This is a bit longer, but the complexity is simply not there.
Breakdown: define two variables (for ease of use) `entityName` and a lower case version of it `lEntityName`. These two variables are then used throughout the rest of the file to insert either a lowercase or a capitalized version of the **entity** name into the template file.
The template file itself is simply a database service for finding and saving **entity** data in the database.

## API endpoint template
Create a file inside of your project's directory and name it: `rest-endpoint.template.mtml`.
```html
<$_ var entityName = e.name _$>
<$_ var lEntityName = v.decapitalize(e.name) _$>
@Controller('api/<$= lEntityName $>')
export class <$= entityName $>Controller {

    constructor(
        private readonly <$= lEntityName $>Service: Db<$= entityName $>Service
    ) { }

    @Get()
    async <$= lEntityName $>s(): Promise<<$= entityName $>[]> {

        return await this.<$= lEntityName $>Service.find();
    }

    @Get('/:id')
    async <$= lEntityName $>(@Param('id', new ParseIntPipe()) id): Promise<<$= entityName $>> {

        return await this.<$= lEntityName $>Service.findOne({
            id: id
        });
    }

    @Post()
    async <$= lEntityName $>Post(@Body() <$= lEntityName $>: <$= entityName $>) {

        return await this.<$= lEntityName $>Service.save(<$= lEntityName $>);
    }
}
```
As with the previous template we define two convenience variables `entityName` and `lEntityName`. The rest is straightforward and simply defines an endpoint for the **entity**.

## Create a scenario file
Create a file inside of your project's directory and name it: `my-project.scenario.mtml`.
```
{
    "entity": {
        "json": "h.getArg(1)"
    },
    "template": [
        {
            "name": "dbEntity",
            "from": "db-entity.template.mtml"
        },
        {
            "name": "dbService",
            "from": "db-service.template.mtml"
        },
        {
            "name": "apiEndpoint",
            "from": "rest-endpoint.template.mtml"
        }
    ],
    "use": [
        {
            "template": "dbEntity",
            "spawn": "`db/entity/${v.decapitalize(e.name)}/${v.decapitalize(e.name)}.entity.ts`"
        },
        {
            "template": "dbService",
            "spawn": "`db/service/${v.decapitalize(e.name)}/${v.decapitalize(e.name)}.service.ts`"
        },
        {
            "template": "apiEndpoint",
            "spawn": "`rest/${v.decapitalize(e.name)}/${v.decapitalize(e.name)}.controller.ts`"
        }
    ]
}
```
This is the file that defines:
- From where to take the **entity** from
- How to read the **entity**
- Where to get the **templates** from and what are their names
- How to use the **templates** and what files to spawn out of them

The keys: `entity`, `template` and `use` are mandatory.
`mtml` uses `eval` quite heavily for the ease of use and flexibility of the scenario file. This is perhaps the first time ever that I saw a good use of eval when creating a project.
Each of the values of the keys are first `eval'ed`, if the `eval` fails the value is taken as is. Convenience functions are described [HERE](NEED LINK TO CONVENIECE FUNCTIONS).
Breakdown of the above scenario file:
- Describe the **entity** as json, the json file is given as the 1st argument from the command line
- Provide an array of **templates**, each template has its own name and the file where it can be found, e.g. the template in the file `db-service.template.mtml` is named `dbEntity`.
- Provide an array of **uses**, each **use** takes the template, injects the entity into it and spawns a file in the given location.
**NOTE:** all pathing within `mtml` is relative to the scenario file.
