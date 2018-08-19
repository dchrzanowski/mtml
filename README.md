# (m)ake (t)e(m)p(l)ate
Is a command line tool that allows the user to create templates from a data source.

The data source is preferably a `json` object or a `json` file. If you'd like to provide a data source from a different file, then you will have to write your own parser (`mtml` allows you to provide a custom parser).

The templates use [ejs](http://ejs.co/) for rendering. To prevent a collision with the current `ejs` syntax, `mtml` uses the dollar sign `<$ $>` brackets.

# Features
- Provide a quick way to create a substantial amount of code whenever there exists a pattern (pretty often, right?)
- Use familiar syntax and file types: NodeJS, Javascript, JSON, EJS
- Simple functionality, plenty of flexibility

# Installation
```shell
npm install -g mtml
```
Remember the `-g` flag so that the application will be available from the command line anywhere in your file system. On *nix you might have to `sudo` it ;)

# Run
```
mtml my-file.scenario.mtml any-additional command-line-args
```
The scenario file is mandatory, any additional command line argument's functionality is described by the developer in the **scenario** file and the **templates**

# Setup and quick tutorial
Let's say that we are working on a back-end in [NestJS](https://nestjs.com/). The requirement is to build an API endpoint for each database's **entity**. The back-end database uses [TypeORM](http://typeorm.io) as a wrapper. To keep things simple for this tutorial, the back-end code is very simplified and lacks imports, etc.

## Create a project folder
Make sure that you've [installed](#installation) `mtml`.

Create an empty folder to follow this small tutorial.

*NOTE*: All of the below setup files are available in the `examples` folder.

## Create an entity
Lets define our first **entity**. Create a file inside of the folder you've just created and call it `user.json`:
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
A simple enough **entity** called User. It has three fields, each of a certain name and type.

It is purely up to the developer to structure the  **entity** and define the data that goes into it. The above is just a basic example. `mtml` does not limit you to CRUD operations only.

## Creating templates
Now lets define **templates** for creating the database TypeORM entity, creating the database service and creating the API endpoint (as stated above). In your case it could be: SQL files, PHP files, Java files, Django, Python, HTML files, ...

Keep in mind that the below template's created code syntax may not be accurate or structurally sound, it is just to showcase how `mtml` works.

## Database entity template
Create a file inside of your project's folder and name it `db-entity.template.mtml`:
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
*Note* the `e` variable. `e` is basically your **entity** that you defined in the `user.json` file.

*Brakedown*: Name the class the same way as you named your **entity**. Then iterate through the data array: for each element of the array create a new section for TypeORM field description. If the field is called id then make it a primary column, otherwise just make a normal column.

*Note* the usage of underscores `<$_ _$>` to collapse blank lines.

## Database service template
Create a file inside of your project's folder and name it: `db-service.template.mtml`.
```html
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
*Breakdown*: define two variables (for ease of use) `entityName` and a lower case version of it `lEntityName` (`v.decapitalize` references the `decapitalize` method from the [voca](https://vocajs.com/) package, this package is provided in `mtml`). The two defined variables are then used throughout the rest of the template to insert either a lowercase or a capitalized version of the **entity** name into the template file.

The template file itself is simply a database service for finding and saving **entity** data in the database.

## API endpoint template
Create a file inside of your project's folder and name it: `rest-endpoint.template.mtml`.
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
As with the previous template we define two convenience variables `entityName` and `lEntityName`. The rest is straightforward and simply defines two endpoints for the User **entity**: `GET api/user` and `POST api/user`. The endpoint uses the database service that we have created previously.

## Create a scenario file
Create a file inside of your project's folder and name it: `my-project.scenario.mtml`.
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
This **scenario** file declares:
- Where to take the **entity** from
- How to read the **entity**
- Where to get the **templates** from and what are their names
- How to use the **templates** and what files to spawn out of them

Breakdown of the above **scenario** file:
- Provide the **entity** as `json`, the json file is given as the 1st argument from the command line (`h.getArg(1)`). `h` is a helper package with a few [convenience functions](#convenience-methods-and-variables).
- Provide an array of **templates**, each template has its own name and the file path where it can be found. As an example, the first **template** is named `dbEntity` and can be located at `db-entity.template.mtml`. The `name` and `from` keys are mandatory!
- Provide an array of **uses**, each **use** takes the template, injects the entity into it and spawns a file in the given location. As an example, the first **use** takes the `dbEntity` and spawns a file at `db/entity/user/user.entity.ts`. We use string interpolation and the `voca` package `decapitalize` method to manipulate the path.
*NOTE:* all pathing within `mtml` is relative to the **scenario** file.

The keys: `entity`, `template` and `use` are mandatory.

`mtml` uses `eval` quite heavily to provide flexibility of the **scenario** file. This is perhaps the first time ever that I saw a good use of `eval` when creating a project. I know that `eval` has security issues, but `mtml` is meant to be used by the developer that created the **scenario** file and thus it is his/hers responsibility to not break things and use `mtml` with caution.

### Note on scenario key value evaluation
Each of the values of the keys are first `eval'ed`, if the `eval` fails then the value is taken as is. So if you type in as a value: `v.capitalize('hello')`, then the value will be `Hello` (`v` references the `voca` package), but if you type `x.capitalize('hello')`, then the `eval` will fail and the value will literally be the string `x.capitalize('hello')`, since `x` is not a known variable.

Convenience methods and variables that can be used as the values of the keys are described [here](#convenience-methods-and-variables).

## Run `mtml`
Now, since we have completed the setup, let's run the following command from within the project folder that you've created:
```shell
mtml my-project.scenario.mtml user.json
```
You should see a list of three files that have been created: `user.entity.ts`, `user.service.ts` and `user.controller.ts`.

Do you remember the `h.getArg(1)` in the **scenario** file's `json` key? That method grabs the 1st argument of the command line, in this case `user.json`. By doing so we can now pass in different `json` files as entities from the command line to `mtml` and reuse the scenario!

## Need more entities?
Lets create a different entity, create a `product.json` file:
```json
{
    "name": "Product",
    "description": "Product creation API",
    "data": [
        { "field": "id", "type": "number" },
        { "field": "name", "type": "string" },
        { "field": "description", "type": "string" },
        { "field": "price", "type": "number"}
    ]
}
```
So now if you run:
```shell
mtml my-project.scenario.mtml product.json
```
You will reuse your scenario file and all the templates that you've created, but the a different data input (`product.json` file). Neat, right?

It is purely up to you how far you want your entity to expand. You could create a whole back-end/front-end rest API and the relevant `html` files and their inputs fields. All based from the entity file. It is all up to your imagination where this takes you and how much it helps you.

# Convenience methods and variables
Both the **template** file and the **scenario** file have access to the following convenience variables, and their methods/objects:
- Built-in JS methods/functions work as intended in both templates and the scenario files, e.g. `parseInt`, `JSON.parse`, etc.
- `v` the [voca](https://vocajs.com/) package and all of its methods
- `_` the [lodash](https://lodash.com/) package and all of its methods
- `s` is the whole **scenario** object after all the values have been evaluated. This means that it contains the `meta`, `entity`, `template` and `use` keys.
- `e` is the **scenario's** **entity** object after all the values have been evaluated. It is simply a shortcut to `s.entity`.
- `m` is the **scenario's** **meta** object after all the values have been evaluated. Is is simply a shortcut to `s.meta`.
- `h` the custom helpers lib which has the following methods:
  - `abort(reason)` aborts the application's execution, pass in a string as the `reason`
  - `askUser(prompt)` ask for input from the user via the command line, provide a string as the `prompt`
  - `getArg(number)` get the command line argument provided at index `number`. Example: if you would run from the command line `mtml my.scenario.mtml foo.json`, then `my.scenario.mtml` is argument 0 and `foo.json` is argument 1.

# Command line arguments
Two command line arguments are available:
- `--dry-run` will display where the spawned files would have been created without actually modifying any data on the file system
- `--debug` will show some debug data about evaluated scenario file and the command line arguments, very useful for troubleshooting

Please note that providing the above command line arguments makes them NOT available via `h.getArg` method. Running `mtml my.scenario.mtml foo.json --dry-run` does not mean that `h.getArg(2)` will return `--dry-run`, it will be `undefined`. Still, for simplicity's sake, provide the above command line arguments as last arguments.

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
In the above case the `h.askUser` method will be called upon execution of the **scenario** file and the user will be asked to `Provide a description:`. Once a user enters the value from the command prompt it will be stored in the `meta`'s `description` key. To use the value in the the **scenario** file or the **templates**, reference it with the `m` convenience variable. E.g. a **template** that creates a html header with the description provided from the command line
```html
<h1><$= m.descripton $></h1>
```

# Providing an entity other that a JSON file
In the examples above we provide the entity from a JSON file. But, in-fact there are three different ways of providing an entity. The **entity** key must have one of the three attributes:
- `json` as in the example above, a JSON file
- `here` a JSON object placed directly in the **scenario** file
- `parser` an arbitrary file source. This option will need a parser written by you.

## JSON file, `json`
Is alread explained [here](#create-a-scenario-file).
However, the syntax is:
```json
"entity": {
    "json": "path to a file"
}
```
You can use a raw string, or use `h.askUser` to ask the user for a path from the command line, or `h.getArg` to provide a path from the command line. Remember that the path is relative to the **scenario** file.

## JSON object in the scenario, `here`
This option is simple, the syntax looks as follows:
```json
"entity": {
    "here": [ {"my": "array"}, {"of": "objects"}]
}
```
Now the convenience variable `e` will contain an array of two objects one {"my": "array"}, and the other {"of": "objects"}.

## Data from an arbitrary source, `parser`
In my case I inherited a project in which all the mongoose files were already written, so I didn't exactly want to write the JSON entities anew, so I thought that I'd write a parser for the mongoose files and provide the entity data that way. And so was born the parser idea.

The syntax is:
```json
"entity": {
    "parser": {
        "file": "path to the Javascript file containing the parser method",
        "data": "path to the file containing the data. An SQL file? A mongoose file? Etc. etc."
    }
}
```
Remember that you can always provide the paths as raw strings or use `h.getArg` or `h.askUser` methods to get the path as the command line argument or ask from the command line, respectively. The path is relative to the **scenario** file.

The parser `file` that is being asked for must have the following syntax:
```javascript
module.exports = function(content) {
    var output = {};
    // do something with content and assign to output
    return output;
}
```

An example of a parser that attaches a `magic` key to any `json` file that doesn't have one:
```javascript
module.exports = function(content) {
    var output = JSON.parse(content);
    output.magic = "magic";
    return output;
};
```
Basically what happens in here is that `mtml` will pass the file provided in the **scenario** file's `entity.parser.data` key into the parser function as the `content` argument. Then `mtml` will assign the returned object into the `e` convenience variable that can be directly used in the **scenario** file and the **template** files.

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
