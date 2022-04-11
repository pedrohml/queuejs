const { program } = require('commander');
const { consumers } = require('stream');
const superagent = require('superagent');
const { AtMostOnceStrategy } = require('./strategy');


program
  .name('consumer.js')
  .description('consume messages from queuejs and write to stdout')
  .option('-h, --host <host>', 'The host for queuejs', 'localhost')
  .option('-p, --port <port>', 'The port for queuejs', '3000')
  .option('-g, --group <group>', 'The consumer group to be used')
  .option('-w, --watch', 'Keep listening for new messages', false)
  .requiredOption('-t, --topic <topic>', 'topic to produce messages');

program.parse();

const options = program.opts();
const { host, port, topic } = options;
const group = options.group || topic;

const register_uri = `http://${host}:${port}/api/groups/${group}/topics/${topic}/register`;
const commit_uri = `http://${host}:${port}/api/groups/${group}/topics/${topic}/commit`;
const consume_uri = `http://${host}:${port}/api/groups/${group}/topics/${topic}/next`;

async function register() {
  return superagent.post(register_uri);
}

async function commit(offset) {
  return superagent.put(commit_uri)
    .ok((res) => [200, 409].indexOf(res.statusCode) >= 0)
    .send({ offset: offset });
}

async function consume() {
  return superagent.get(consume_uri);
}

const strategy = new AtMostOnceStrategy(consume, commit);
// const strategy = new AtLeastOnceStrategy(consume, commit);

function handler(messages) {
  // CUSTOM CODE HERE
  console.log(messages);
}

(async () => {
  console.assert((await register()).statusCode === 201, "The consumer couldn't be registered")
  
  if (options.watch) {
    setInterval(() => { strategy.consume(handler); }, 500);
  } else {
    strategy.consume(handler);
  }
})();

