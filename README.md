# (m)ake (t)e(m)p(l)ate
Is a command line tool that allows the user to create templates from a data source.

The data source is preferably a `JSON` object or a `JSON` file, if you'd like to provide a data source from a different file, you'll have to write your own parser (`mtml` allows you to provide a custom parser).

The templates use [EJS](http://ejs.co/) style syntax, to prevent a collision with the current EJS syntac, `mtml` uses the dollar sign `<$ $>` brackets.

# Installation
`npm install -g mtml`
Remember the `-g` flag so that the application will be available from the command line anywhere in your file system. On *nix might have to `sudo` it ;)

# Features
- Provide a quick way to create a substantial amount of code whenever there exists a pattern (pretty often, right?)
- Use familiar syntax and file types: NodeJS, Javascript, JSON, EJS
- Simple functionality, plenty of flexibility

# Quick setup

Let's say that we are working on a back-end in [NestJS](https://nestjs.com/). The requirement is to build an API endpoint for each database **entity**. The back-end database use [TypeORM](http://typeorm.io) as a wrapper. To keep things simple the back-end code is very simplified.

## Create a project directory
Create an empty directory to follow this small tutorial.

## Create an entity
Lets define our first **entity**, create a file inside of the created directory called `user.json`:
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
A simple enough **entity** called User. It has 3 fields, each of a certain name and type. It is purely up to the developer to structure the  **entity** and define the data that goes into it. The above is just a basic example. `mtml` does not limit you to CRUD.

## Creating templates
Now lets define **templates** for: creating the database TypeORM entity, creating the database service and creating the api endpoint.

Keep in mind that the created code's syntax may not be accurate or structurally sound, it is just to show how `mtml` works.

## Database entity template
Create a file inside of your project's directory and name it `db-entity.template.mtml`.
```ejs
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
Brakedown: name the class the same way as you named your **entity**. Then iterate through the data array: for each element create a new section for TypeORM. If the field is called id then make it a primary column, otherwise just make a normal column.
Note the usage of underscores `<$_ _$>` to collapse blank lines.

## Database service template
Create a file inside of your project's directory and name it: `db-service.template.mtml`.
```ejs
<$_ var entityName = e.name _$>
<$_ var lEntityName = v.decapitalize(e.name) _$>
export class Db<$= entityName $>Service {

    constructor(
        @InjectRepository(<$= entityName $>)
        private readonly <$= lEntityName $>Repository: Repository<<$= entityName $>>,
    ) { }

    async find(query?: any): Promise<<$= entityName $>[]> {

        let <$= lEntityName $>s: <$= entityName $>[];

        try {
            <$= lEntityName $>s = await this.<$= lEntityName $>Repository.find(query);
        } catch {
            throw new ServerErrorException();
        }

        return <$= lEntityName $>s;
    }

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
Breakdown: define two variables (for ease of use) `entityName` and a lower case version of it `lEntityName` (v.decapitalize references the decapitalize method from the [voca](https://vocajs.com/) package). The two defined variables are then used throughout the rest of the template to insert either a lowercase or a capitalized version of the **entity** name into the template file.
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

    @Post()
    async <$= lEntityName $>Post(@Body() <$= lEntityName $>: <$= entityName $>) {

        return await this.<$= lEntityName $>Service.save(<$= lEntityName $>);
    }
}
```
As with the previous template we define two convenience variables `entityName` and `lEntityName`. The rest is straightforward and simply defines two endpoint for the User **entity**: `GET api/user` and `POST api/user`.

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
- Where to take the **entity** from
- How to read the **entity**
- Where to get the **templates** from and what are their names
- How to use the **templates** and what files to spawn out of them

The keys: `entity`, `template` and `use` are mandatory.

`mtml` uses `eval` quite heavily to provide flexibility of the **scenario** file. This is perhaps the first time ever that I saw a good use of eval when creating a project.

### Note on value evaluation
Each of the values of the keys are first `eval'ed`, if the `eval` fails then value is taken as is. So if you type in as value `v.capitalize('hello')` then the value will be `Hello`, but if you type `x.capitalize('hello')`, then the `eval` will fail and the value will literally be the string `x.capitalize('hello')`, since `x` is not a known variable. Convenience methods and variables that can be used as the values of the keys are described [here](#convenience-methods-and-variables).

Breakdown of the above **scenario** file:
- Describe the **entity** as `json`, the json file is given as the 1st argument from the command line (`h.getArg(1)`). `h` is a helper package with a few convenience functions.
- Provide an array of **templates**, each template has its own name and the file path where it can be found. As an example, the first **template** is named `dbEntity` and can be located at `db-entity.template.mtml` .
- Provide an array of **uses**, each **use** takes the template, injects the entity into it and spawns a file in the given location, As an example, the first **use** takes the `dbEntity` and spawns a file at `db/entity/user/user.entity.ts`. We use string interpolation and the `voca` package to manipulate the path.
**NOTE:** all pathing within `mtml` is relative to the **scenario** file.

## Run `mtml`
Now once the setup is complete run the following command from within the project folder that you're created:
```shell
mtml my-project.scenario.mtml user.json
```
You should see a list of 3 files that have been created.
Do you remember the `h.getArg(1)` in the **scenario** file? That method grabs the 1st argument of the command line, in this case `user.json`. Argument 0 is the **scenario** file `my-project.scenario.mtml`.

# Convenience methods and variables
Both the template file and the **scenario** file have access to the following convenience variables, and their methods/objects:
- `v` the [voca](https://vocajs.com/) package and all of its methods
- `_` the [lodash](https://lodash.com/) package and all of its methods
- `s` is the whole **scenario** object after all the values have been evaluated. That means that it contains the `meta`, `entity`, `template` and `use` keys.
- `e` is the **scenario's** **entity** object after all the values have been evaluated
- `m` is the **meta** object after all the values have been evaluated
- `h` the custom helpers which have the following methods
  - `abort(reason)` aborts the application's execution, pass in a string as the `reason`
  - `askUser(prompt)` ask for input from the user via the command line, provide a string as the `prompt`
  - `getArg(number)` get the command line argument provided as the `number`. In you'd run from the command line `mtml my.scenario.mtml foo.json`, then `my.scenario.mtml` is argument 0 and `foo.json` is argument 1.
- Built-in JS methods/functions work as intended in both templates and the scenario files, e.g. `parseInt`, `JSON.parse`, etc.

# Command line arguments
Two command line arguments are available:
- `--dry-run` will display where the spawned files would have been created without actually modifying any data in the file system
- `--debug` will show some debug data about the, primarily the evaluated scenario file and the command line arguments
Please note the providing the above command line arguments makes them NOT available via `h.getArg` method. Running `mtml my.scenario.mtml foo.json --dry-run` does not mean that `h.getArg(2)` will return `--dry-run`, it will be `undefined`. Still to keep things simple, provide the above command line arguments as last arguments.

# Additional meta in the scenario file
The scenario file can also contain additional meta:
```json
{
    "meta": {
        "description": "h.askUser('Provide a description:')"
    },
    "entity": {
        "json": "h.getArg(1)"
    },
    "template": [
        {
            "name": "dbEntity",
            "from": "db-entity.template.mtml"
        }
    ],
    "use": [
        {
            "template": "dbEntity",
            "spawn": "`db/entity/${v.decapitalize(e.name)}/${v.decapitalize(e.name)}.entity.ts`"
        }
    ]
}
```
In the above case the `h.askUser` method will be called upon execution of the **scenario** file and the user will be asked to `Provide a description:`. Once a user enters the value from the command prompt it will be stored in the `meta`'s `description` key. To use the value in the the **scenario** file or the **templates**, reference it with the `m` convenience variable, e.g. a **template** that creates a html header with the description provided from the command line
```html
<h1><$= m.descripton $></h1>
```

# Providing an entity other that a JSON file
In the examples above we provide the entity from a JSON file. But in fact there are three different ways of providing an entity. The **entity** key must have one of the three:
- `json` as in the example above, a JSON file
- `here` a JSON object placed directly in the **scenario** file
- `parser` an arbitrary file source. This option will need a parser written by you.

## JSON file
Is alread explained [here](#create-a-scenario-file).
However the syntax is:
```json
"entity": {
    "json": "path to a file"
}
```
You can use a raw string, or use `h.askUser` to ask the user for a path from the command line, or `h.getArg` to provide a path from the command line.

## JSON object in the scenario
This option is simple, the syntax looks as follows:
```json
"entity": {
    "here": [ {"my": "array"}, {"of": "objects"}]
}
```

## Data from an arbitrary source
In my case I inherited a project in which all the mongoose files were already written, so I didn't exactly want to write the JSON entities anew, so I thought that I'd write a parser for the mongoose files and provide the entity data that way.
The syntax is:
```json
"entity": {
    "parser": {
        "file": "path to the Javascript file containing the parser method",
        "data": "path to the file containing the data. An SQL file? A mongoose file? Etc. etc."
    }
}
```
Remember that you can always provide the paths as raw strings or use `h.getArg` or `h.askUser` methods to get the path as the command line argument or ask from the command line, respectively.

The parser `file` that is being asked for must have the following syntax:
```javascript
module.exports = function(content) {
    var output = {};
    // do something with content and assign to output
    return output;
}
```

An example of a parser that attached a `magic` key to any `json` file that doesn't have one:
```javascript
module.exports = function(content) {
    var output = JSON.parse(content);
    output.magic = "magic";
    return output;
};
```
Basically what happens is that `mtml` will pass the file provided in the **scenario** file's `entity.parser.data` into the function as the `content` argument and then assign in to the `e` convenience variable that can be directly used in the **scenario** and the **templates**.

## License
Licensed under [MIT](https://github.com/dchrzanowski/mtml/blob/master/LICENSE.md)

## Copyright
Copyright (c) 2018 Damian Chrzanowski <pjdamian.chrzanowski@gmail.com>, MIT License

## This app uses the following open-source libraries
[voca](https://github.com/panzerdp/voca), Copyright (c) 2016 Dmitri Pavlutin, MIT License
[chalk](https://github.com/chalk/chalk/), Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com), MIT License
[mkdirp](https://github.com/substack/node-mkdirp), Copyright 2010 James Halliday (mail@substack.net), MIT License
[lodash](https://github.com/lodash/lodash), Copyright JS Foundation and other contributors <https://js.foundation/>, MIT License
[readline-sync](https://github.com/anseki/readline-sync), Copyright (c) 2018 anseki, MIT License
[ejs](https://github.com/mde/ejs), copyright 2012 mde@fleegix.org, Licensed under the Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
