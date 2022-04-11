const { program } = require('commander');
const superagent = require('superagent');
const readline = require('readline');


program
  .name('producer.js')
  .description('produce a message for each stdin line to queuejs')
  .option('-h, --host <host>', ' The host for queuejs (default: localhost)', 'localhost')
  .option('-p, --port <port>', ' The port for queuejs (default: 3000)', '3000')
  .requiredOption('-t, --topic <topic>', 'topic to produce messages');

program.parse();

const options = program.opts();
const { host, port, topic } = options;

let lineReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const producer_uri = `http://${host}:${port}/api/topics/${topic}/messages`;

function red(str) {
  return `\x1b[31m${str}\x1b[0m`;
}

function green(str) {
  return `\x1b[32m${str}\x1b[0m`;
}

const start = async () =>{
  for await (const line of lineReader) {
    const response = await superagent.post(producer_uri)
      .send({ messages: [ { data: line } ] });
    console.log(line, (response.statusCode === 201 ? green('OK'): red('ERROR')));
  }
}
start()
