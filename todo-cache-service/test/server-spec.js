const assert = require('node:assert/strict');
const { once } = require('node:events');
const test = require('node:test');
const server = require('../server');

test('GET /api/v1/todos returns cached todos', async (t) => {
    server.locals.redisClient = {
        sMembers: async () => ['Get kids from school', 'Take out the trash']
    };

    const httpServer = server.listen(0, '127.0.0.1');
    await once(httpServer, 'listening');
    t.after(() => new Promise((resolve) => httpServer.close(resolve)));

    const response = await fetch(`http://127.0.0.1:${httpServer.address().port}/api/v1/todos`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [
        { title: 'Get kids from school' },
        { title: 'Take out the trash' }
    ]);
});

