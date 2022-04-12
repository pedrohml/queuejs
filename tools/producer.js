const { program } = require( 'commander');
const { API } = require('./api');
const { createInterface } = require('readline');

program
  .name('producer.js')
  .description('produce a message for each stdin line to queuejs')
  .option('-h, --host <host>', ' The host for queuejs (default: localhost)', 'localhost')
  .option('-p, --port <port>', ' The port for queuejs (default: 3000)', '3000')
  .requiredOption('-t, --topic <topic>', 'topic to produce messages');

program.parse();

const { host, port, topic } = program.opts();

let lineReader = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const api = new API(host, port);

const start = async () =>{
  for await (const line of lineReader) {
    await api.produce(topic, line);
  }
}
start()
