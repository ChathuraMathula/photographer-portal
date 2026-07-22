import * as amqp from 'amqplib';

export async function resetRabbitMQ(): Promise<void> {
  const url = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  try {
    console.log(`  🔌 Connecting to RabbitMQ at ${url}...`);
    const connection = await amqp.connect(url);
    const channel = await connection.createChannel();
    const queueName = 'notifications_queue';

    await channel.assertQueue(queueName, { durable: true });
    const result = await channel.purgeQueue(queueName);
    console.log(`  ✔ Purged RabbitMQ queue '${queueName}' (${result.messageCount} messages removed)`);

    await channel.close();
    await connection.close();
  } catch (err: any) {
    console.warn(`  ⚠️ RabbitMQ reset warning: ${err.message}`);
  }
}

// Allow direct execution
if (require.main === module) {
  resetRabbitMQ()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Failed to reset RabbitMQ:', err);
      process.exit(1);
    });
}
