const { program } = require('commander');
const { API } = require('./api');
const { AtMostOnceStrategy, AtLeastOnceStrategy } = require('./strategy');


program
  .name('consumer.js')
  .description('consume messages from queuejs and write to stdout')
  .option('-h, --host <host>', 'The host for queuejs', 'localhost')
  .option('-p, --port <port>', 'The port for queuejs', '3000')
  .option('-g, --group <group>', 'The consumer group to be used')
  .requiredOption('-t, --topic <topic>', 'The topic to produce messages')
  .option('-w, --watch', 'Keep listening for new messages', false);

program.parse();

const options = program.opts();
const { host, port, topic } = options;
const group = options.group || topic;

function handler(messages) {
  // CUSTOM CODE HERE
  console.log(messages);
}

const api = new API(host, port);

const strategy = new AtMostOnceStrategy(api, topic, group, handler);
// const strategy = new AtLeastOnceStrategy(api, topic, group, handler);

(async () => {
  await api.register(group, topic);

  if (options.watch)
    setInterval(async () => { await strategy.consume() }, 100); // watching
  else
    await strategy.consume();
})();

