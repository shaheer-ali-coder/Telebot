 express = require('express');
const app = express();
const schedule = require('node-schedule');
const TelegramBot = require('node-telegram-bot-api');
const telegramBotToken = '6795524100:AAFKVRFEZVwXAuRsM5Np0wdS06zqGZyZVxM';
const telegramBot = new TelegramBot(telegramBotToken, { polling: true });
const link1='https://buy.stripe.com/6oE2c5dvH5Ei48g8wA'
const link2='https://buy.stripe.com/28o5oh77jfeSfQY003'
const link3='https://buy.stripe.com/7sI2c5fDPeaObAI7su'
const link4="https://t.me/+ET7WhdN-aMA3NWU8 , https://t.me/+SsXhEyKcQJsxNzY0 , https://t.me/+avS5iXreDuk3ZTQ0"
const channelLinks = ['https://t.me/+ET7WhdN-aMA3NWU8', 'https://t.me/+SsXhEyKcQJsxNzY0', 'https://t.me/+avS5iXreDuk3ZTQ0'];
const subscriptions = []; // Array to store subscription information (user ID, channel link, timestamp)

// Function to add a subscription
function addSubscription(userId, channelLink) {
  const timestamp = new Date().getTime();
  subscriptions.push({ userId, channelLink, timestamp });
}
function removeUserFromChannel(channelLinkss, userId) {
  // Use the kickChatMember method to remove the user from the channel
  channelLinkss.forEach(channelLink => {
  telegramBot.kickChatMember(channelLink, userId)
    .then(() => {
      console.log(`User ${userId} removed from the channel`);
    })
    .catch((error) => {
      console.error(`Error removing user ${userId} from the channel: ${error.message}`);
    });
  })}
// Function to check and remove expired subscriptions
function checkAndRemoveExpiredSubscriptions() {
  const currentTimestamp = new Date().getTime();
  const expiredSubscriptions = subscriptions.filter(sub => (currentTimestamp - sub.timestamp) >= (30 * 24 * 60 * 60 * 1000));

  expiredSubscriptions.forEach(sub => {
    removeUserFromChannel(channelLinks, sub.userId);
    const index = subscriptions.indexOf(sub);
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }
  });
}

// Schedule the task to run every day (adjust the cron syntax accordingly)
schedule.scheduleJob('0 0 * * *', () => {
  checkAndRemoveExpiredSubscriptions();
});

telegramBot.onText(/\/start|\/help/, (msg) => {
    const chatId = msg.chat.id;
    const userid = msg.from.id
    telegramBot.sendMessage(chatId, `Welcome! Check these links for subscriptions : ${link1} , ${link2} , ${link3} \n For more details or help contact this number : +971 54 501 1726`);
});
app.post('/webhook/stripe', express.json({type: 'application/json'}), (request, response) => {
  const event = request.body;


  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      // const paymentIntent = event.data.object;
      // Assuming you have the user ID and channel link information here
      const userId =userStripeIdMap.get(paymentIntent.customer);
      addSubscription(userId, channelLink);
      telegramBot.sendMessage(chatId, `Here is the link for the channel : ${link4} \n For more details or help contact this number : +971 54 501 1726`);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      telegramBot.sendMessage(chatId, 'Payement failed please try again \n For more details or help contact this number : +971 54 501 1726 ');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.json({received: true});
});

app.listen(8000, () => console.log('Running on port 8000'));