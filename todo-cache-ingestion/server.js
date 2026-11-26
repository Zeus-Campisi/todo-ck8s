const redis = require('redis');
const rabbitmq = require('amqplib/callback_api');
const apiAdapter = require('./apiAdapter');
const envProps = require('./env_props');

const storageServiceApi = apiAdapter(envProps.storageServiceURL);

// Redis Client Setup //////////////////////////////////////////////////////////////////////////////////////////////////
const redisClient = redis.createClient({
    url: `redis://${envProps.redisHost}:${envProps.redisPort}`,
    socket: {
        reconnectStrategy: () => 1000
    }
});
redisClient.on('connect', () => console.log('Redis client connected'));
redisClient.on('error', (err) => console.error('Something went wrong with Redis:', err));

redisClient.connect().then(() => {
    startMessageProcessing();
}).catch((err) => {
    console.error('Could not connect to Redis:', err);
    process.exitCode = 1;
});

// Messaging Processing ////////////////////////////////////////////////////////////////////////////////////////////////
function startMessageProcessing() {
rabbitmq.connect(envProps.rabbitmqUrl, function(err, connection) {
    if (err) {
        console.error('Could not connect to RabbitMQ:', err);
        process.exitCode = 1;
        return;
    }
    connection.createChannel(function(err, channel) {
        if (err) {
            console.error('Could not create RabbitMQ channel:', err);
            process.exitCode = 1;
            return;
        }
        const cacheIngestionQueue = 'cache-ingestion';

        channel.assertQueue(cacheIngestionQueue, {durable: true});

        // Get one (1) message, let other cache servers grab messages if there are more
        channel.prefetch(1);

        console.log("Waiting for messages in '%s' queue...", cacheIngestionQueue);

        channel.consume(cacheIngestionQueue, async function(msg) {
            if (!msg) {
                return;
            }
            const msgContent = msg.content.toString();

            console.log("Received '%s' message", msgContent);

            try {
                if (msgContent === '**load**') {
                    await loadRedisFromStorage();
                } else {
                    await addTodo2Redis(msgContent);
                }
                channel.ack(msg);
            } catch (error) {
                console.error('Could not process cache-ingestion message:', error);
                channel.nack(msg, false, true);
            }

        }, {noAck: false});
    });
});
}

async function loadRedisFromStorage() {
    const response = await storageServiceApi.get('/api/v1/todos');
    const todos = response.data;
    if (!todos || todos.length === 0) {
        console.log('Nothing to load, got nothing from Todo Storage');
        return;
    }
    console.log('Loading Todos from Todo Storage (' + todos.length + ')');
    for (const todo of todos) {
        await addTodo2Redis(todo.title);
    }
}

async function addTodo2Redis(todoTitle) {
    await redisClient.sAdd('todos', todoTitle);
    console.log('Added Todo: [' + todoTitle + '] to Redis Cache');
}
