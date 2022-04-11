# Endpoints

## **(POST) /api/topics/:topic/messages**

Produce messages to the topic `:topic`

Payload:
```
{
  "messages": [{ "data": <string> } ...]
}
```
- Success status code: 201
- Body response: Empty
## **(POST) /api/groups/:group/topics/:topic/register**

Register consumer `:group` to the `:topic`
- No payload
- Success status code: 200
- Body response:
```
{
  "group": <string>,
  "topic": <string>,
  "offset": <number> // current offset (zero if first call)
}
```

## **(PUT) /api/groups/:group/topics/:topic/commit**

Commit consumer `:group` progress to the `:topic`

Payload:
```
{
  "offset": <number>
}
```
- Success status code: 200
- Failure status code: 409 (if offset is not greater than previous one)
- Body response (for code 200 and 409):
```
{
  "group": <string>,
  "topic": <string>,
  "offset": <number> // current offset for consumer group
}
```

## **(GET) /api/groups/:group/topics/:topic/next**

Consume the next message from `:topic` based on current `:group` offset
- Success status code: 200
- Body response:
```
{
  "messages": [{ "data": <string> }]
}
```

## **(GET) /api/groups/:group/topics/:topic/messages/:count**

Consume `:count` messages from `:topic` based on current `:group` offset
- Success status code: 200
- Body response:
```
{
  "messages": [{ "data": <string> } ...]
}
```