<p align="center">
  <img src="./images/logo.png" align="center">
</p>

<p align="center">A simple broker API</p>

## Description

The **queuejs** is a simple broker API for dummy purposes.

## Design

The API was designed to interact with **producer** and **consumer** http clients.
### Dependencies
- [NestJS](https://nestjs.com) for API abstraction;
- [Prisma](https://www.prisma.io) for database abstration;
- [async-lock](https://www.npmjs.com/package/async-lock) for concurrency management;
- [SQLite](https://www.sqlite.org/index.html) for database engine;
- [Swagger](https://swagger.io) for API documentation;

### Producer endpoint

> **(POST) /api/topics/:topic/messages**

Produce messages to the topic `:topic`

Payload:
```json
{
  "messages": [{ "data": <string> } ...]
}
```
- Success status code: 201
- Body response: Empty
### Consumer entrypoints

> **(POST) /api/groups/:group/topics/:topic/register**

Register consumer `:group` to the `:topic`
- No payload
- Success status code: 200
- Body response:
```json
{
  "group": <string>,
  "topic": <string>,
  "offset": <number> // current offset (zero if first call)
}
```

> **(PUT) /api/groups/:group/topics/:topic/commit**

Commit consumer `:group` progress to the `:topic`

Payload:
```json
{
  "offset": <number>
}
```
- Success status code: 200
- Failure status code: 409 (if offset is not greater than previous one)
- Body response (for code 200 and 409):
```json
{
  "group": <string>,
  "topic": <string>,
  "offset": <number> // current offset for consumer group
}
```

> **(GET) /api/groups/:group/topics/:topic/next**

Consume the next message from `:topic` based on current `:group` offset
- Success status code: 200
- Body response:
```json
{
  "messages": [{ "data": <string> }]
}
```

> **(GET) /api/groups/:group/topics/:topic/messages/:count**

Consume `:count` messages from `:topic` based on current `:group` offset
- Success status code: 200
- Body response:
```json
{
  "messages": [{ "data": <string> } ...]
}
```

## Running with docker (if you are hurry)


```bash
$ docker build -t queuejs .
$ docker run -it --rm --name queuejs -p 3000:3000 queuejs
```

To see API endpoints go to https://localhost:3000/api (Swagger UI)

## Running locally

Before running the code locally, we need to prepare the enviroment.

### Prepare

```bash
# install dependencies
$ npm install

# create the database structure
$ npm run pushdb:dev

# generate database abstractions
$ npx prisma generate
```

### Running

```bash
# development
$ npm run start

# watch mode (hot reload)
$ npm run start:dev
```

To see API endpoints go to https://localhost:3000/api (Swagger UI)

### Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Tools

Some standalone implementations for **producer** and **consumer** are provided.

Currently, the consumer implements *at-most-once* approach to handle messages.

Example:
  1. Make sure **queuejs** is running at `localhost:3000`;
  2. Produce 3 messages: `echo -e 'message1\nmessage2\nmessage3' | node tools/producer.js -t topic1`
  ```
message1 OK
message2 OK
message3 OK
  ```
  3. Consume 3 messages: `node tools/consumer.js -t topic1 -w`:
  ```
[ { topic: 'topic1', data: 'message1', offset: 1 } ]
[ { topic: 'topic1', data: 'message3', offset: 2 } ]
[ { topic: 'topic1', data: 'message2', offset: 3 } ]
  ```

### **tools/producer.js**

```
$ node tools/producer.js --help

Usage: producer.js [options]

produce a message for each stdin line to queuejs

Options:
  -h, --host <host>     The host for queuejs (default: localhost) (default: "localhost")
  -p, --port <port>     The port for queuejs (default: 3000) (default: "3000")
  -t, --topic <topic>  topic to produce messages
```

### **tools/consumer.js**

```
$ node tools/consumer.js --help

Usage: consumer.js [options]

consume messages from queuejs and write to stdout

Options:
  -h, --host <host>    The host for queuejs (default: "localhost")
  -p, --port <port>    The port for queuejs (default: "3000")
  -g, --group <group>  The consumer group to be used
  -t, --topic <topic>  topic to produce messages
  -w, --watch          Keep listening for new messages (default: false)
```

## Limitations

This API is not supposed to have multiple instances for a single database.
So scaling horizontally is not an option now.
## Backlog

1. Add support to reset consumer group offset;
2. Migrate atomic operations (i.e. produce, commit and consume) to PostgreSQL procedures;
3. Add partition support.