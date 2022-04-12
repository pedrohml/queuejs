const { post, put, get } = require('superagent');

class API {
    static PRODUCER_URI = 'http://:host::port/api/topics/:topic/messages';
    static REGISTER_URI = 'http://:host::port/api/groups/:group/topics/:topic/register';
    static COMMIT_URI = 'http://:host::port/api/groups/:group/topics/:topic/commit';
    static CONSUME_URI = 'http://:host::port/api/groups/:group/topics/:topic/next';

    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    buildURI(uri, obj) {
        const params = Object.assign({ 'host': this.host, 'port': this.port }, obj);

        for (const param in params)
            uri = uri.replace(`:${param}`, params[param]);

        return uri;
    }

    produce(topic, data) {
        return post(this.buildURI(API.PRODUCER_URI, { topic }))
            .send({ messages: [ { data } ] });
    }

    register(group, topic) {
        return post(this.buildURI(API.REGISTER_URI, { group, topic }));
    }

    commit(group, topic, offset) {
        return put(this.buildURI(API.COMMIT_URI, { group, topic }))
            .ok((res) => res.statusCode === 200 || res.statusCode === 409)
            .send({ offset });
    }

    consume(group, topic) {
        return get(this.buildURI(API.CONSUME_URI, { group, topic }));
    }
}

module.exports = { API };
