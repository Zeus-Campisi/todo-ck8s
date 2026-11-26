const express = require('express');
const redis = require('redis');
const envProps = require('./env_props');

// Initializing the Express Framework //////////////////////////////////////////////////////////////////////////////////
const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis Client Setup //////////////////////////////////////////////////////////////////////////////////////////////////
app.locals.redisClient = null;

// Set up the API routes ///////////////////////////////////////////////////////////////////////////////////////////////

// Get all todos
app.route('/api/v1/todos').get(async (req, res) => {
    console.log('CALLED GET api/v1/todos');

    const redisClient = app.locals.redisClient;
    if (!redisClient) {
        return res.status(503).json({ error: 'Redis is unavailable' });
    }

    const cachedTodoSet = await redisClient.sMembers('todos');
    const todos = cachedTodoSet.map((title) => ({ title }));
    console.log('Got todos from Redis (' + todos.length + ')');
    res.json(todos);
});

// Start the server ////////////////////////////////////////////////////////////////////////////////////////////////////
if (require.main === module) {
    if (!envProps.redisHost || !envProps.redisPort) {
        console.error('REDIS_HOST and REDIS_PORT are required');
        process.exitCode = 1;
    } else {
        const redisClient = redis.createClient({
            url: `redis://${envProps.redisHost}:${envProps.redisPort}`,
            socket: {
                reconnectStrategy: () => 1000
            }
        });
        redisClient.on('connect', () => console.log('Redis client connected'));
        redisClient.on('error', (err) => console.error('Something went wrong with Redis:', err));
        app.locals.redisClient = redisClient;
        redisClient.connect().catch((err) => {
            console.error('Could not connect to Redis:', err);
            process.exitCode = 1;
        });
        app.listen(port, () => {
            console.log('Todo Cache Service started!');
        });
    }
}

module.exports = app;
