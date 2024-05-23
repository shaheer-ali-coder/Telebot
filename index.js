const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');const axios = require('axios')
const path = require('path');
const fetch = require('node-fetch');
// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = '6322304990:AAGl871HQ6LWXqkIb4CiAayKiH_RDwNCuTg';
const {
    Keypair,
    Connection,
    Transaction,
    SystemProgram,
    PublicKey,
  } = require("@solana/web3.js");
const fix_message_private = `❔ Please, add @test_alpha_guard_bot to group with administrator rights and select the group for which the portal will be created.`;
let state = 'idle'
// Create a bot instance
const bot = new TelegramBot(token, { polling: true });
// Function to read data from the file
function readDataFromFile() {
    try {
        const data = fs.readFileSync('data.json', 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data from file:', err);
        return null;
    }
}


// CoinGecko API endpoints
const COINS_LIST_URL = "https://api.coingecko.com/api/v3/coins/list";
const COIN_MARKET_URL = "https://api.coingecko.com/api/v3/coins/{id}/market_chart";

// Function to get a list of memecoins
async function getMemecoins() {
    try {
        const response = await axios.get(COINS_LIST_URL);
        const coins = response.data;
        // console.log(coins)
        // Filter memecoins based on criteria (e.g., name includes 'doge', 'shiba', etc.)
        const memecoins = coins.filter(coin => coin.id.includes('doge') || coin.id.includes('shiba'));
        // console.log(memecoins)
        return memecoins;
    } catch (error) {
        console.error("Error fetching coin list:", error);
    }
}
const HISTORICAL_DATA_URL = "https://api.coingecko.com/api/v3/coins/{id}/market_chart/range";
// Function to get recent trade data for a random memecoin
async function getRandomMemecoinTrade(memecoins , username) {
  try {
      const randomIndex = Math.floor(Math.random() * memecoins.length);
      const coin = memecoins[randomIndex];
      console.log(`coin: ${JSON.stringify(coin)}`);

      const coinId = coin.id;
      const tradeUrl = COIN_MARKET_URL.replace("{id}", coinId);
      console.log(`trade url: ${tradeUrl}`);

      const response = await axios.get(tradeUrl, { params: { vs_currency: 'usd', days: 1 } });
      console.log(`response data: ${JSON.stringify(response.data)}`);

      // const quantityResponse = await axios.get(`https://api.coingecko.com/api/v3/user/memecoins/${coinId}/quantity`);
      const quantity = 100;
      console.log(`quantity: ${quantity}`);
      // const now = Math.floor(Date.now() / 1000);
      // const thirtyDaysAgo = now - (30 * 24 * 60 * 60);

      // const historicalDataUrl = HISTORICAL_DATA_URL.replace("{id}", coinId);
      // const historicalResponse = await axios.get(historicalDataUrl, {
      //     params: {
      //         vs_currency: 'usd',
      //         from: thirtyDaysAgo,
      //         to: now
      //     }
      // });
      // console.log(`historical data: ${JSON.stringify(historicalResponse.data)}`);

      // Determine buy price (for simplicity, use the closing price 30 days ago)
      const buyPrice =1
      console.log(`buy price: ${buyPrice}`);// Assuming buyPrice is defined somewhere or replace with actual logic

      // Calculate total amount spent
      
      // console.log(`totalSpent: ${totalSpent}`);

      // Fetch the current price from CoinGecko API
      const response_ = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
      const currentPrice = response_.data[coinId].usd;
      // console.log(`currentPrice: ${currentPrice}`);

      // // Calculate the total value of coins held (HODL)
      
      // console.log(`totalHodlValue: ${totalHodlValue}`);

      // // Calculate the position (percentage change)
      
      // console.log(`position: ${position}`);

      
      // console.log(`tradeData: ${JSON.stringify(tradeData)}`);
      let GIF = ''
const totalSpent = buyPrice * quantity;
const totalHodlValue = currentPrice * quantity;
const position = ((currentPrice - buyPrice) / buyPrice) * 100;
const tradeData = response.data;
console.log(coin, tradeData, totalSpent, totalHodlValue, position)
const chatIds = fetchChatIds();
                chatIds.forEach(chatId => {
                  let data = readDataFromFile();
          if (data) {
              // Check if the username exists in the data, if not, initialize it
              if (!data[username]) {
                  data[username] = {};
              }
              // Update data object with token and chatId
              GIF = data[username].gif;
              // data[msg.from.username].chatId = msg.chat.id; // Store the chatId of the group
              
              // Write data back to file
              // writeDataToFile(data);
              
              // Send confirmation message
            }

                    logTradeData(chatId,GIF, coin, tradeData , totalSpent , totalHodlValue , position);
                });
          
// return {coin}
      // return { coin, tradeData, totalSpent, totalHodlValue, position };
  } catch (error) {
      console.error("Error fetching trade data:", error);
      // return null; // Explicitly return null or some fallback value
  }
}


// Function to format and log trade data
async function logTradeData(chatId, GIF, coin, tradeData, totalSpent, totalHodlValue, position) {
  const prices = tradeData.prices.map(price => price[1]);
  const marketCaps = tradeData.market_caps.map(cap => cap[1]);

  const latestPrice = prices[prices.length - 1];
  const meanPrice = prices.reduce((total, price) => total + price, 0) / prices.length;
  const meanMarketCap = marketCaps.reduce((total, cap) => total + cap, 0) / marketCaps.length;

  // Fetch the quantity from an external API
  const roundedPosition = Math.round(position);
  const message = `📈 Recent trade for *${coin.name} (${coin.symbol})*:\n` +
                  `💲 Current price: *$${latestPrice.toFixed(6)}*\n` +
                  `💹 Got: *${totalHodlValue}*\n` +
                  `🎯 Position: *${roundedPosition}%*\n` +
                  `💹 Avg Buyprice: *$${meanPrice.toFixed(6)}*\n` +
                  `📊 Market cap: *$${meanMarketCap.toFixed(2)}*\n`;

  console.log(message);
  // Send the GIF along with the message
  bot.sendAnimation(chatId, GIF, {caption: message, parse_mode: 'Markdown'});
}


// Function to validate Solana public key format
function isValidPublicKey(publicKey) {
  try {
      // Check if the provided public key is a valid PublicKey object
      new PublicKey(publicKey);
      return true;
  } catch (error) {
      // If an error occurs during parsing, the public key is invalid
      return false;
  }
}

async function buyTokens(chatId, sellerPublicKey, buyerPrivateKeyBase64, amount) {
  try {
    // Establish connection to the Solana network
    const connection = new Connection("https://api.devnet.solana.com");
    // Assuming you're using Node.js
    // Assuming you're using Node.js
const privateKeyBuffer = Buffer.from("sVXqOyRxrDhPXLYXs5iTTyL43r2tHtZs45Jf90DaWSg1bjLN3zmG2KE9FoRHJc8xTVIYZLwdrwjTszWFAZvDPg==", 'base64');

// Slice the buffer to 32 bytes
const trimmedPrivateKeyBuffer = privateKeyBuffer.slice(0, 32);

// Convert trimmed buffer to hexadecimal
const hexEncodedPrivateKey = trimmedPrivateKeyBuffer.toString('hex');

console.log("Private Key Hex:", hexEncodedPrivateKey);
console.log("Private Key Length:", hexEncodedPrivateKey.length);


    const buyerKeyPair = Keypair.fromSecretKey(privateKeyBuffer);
    console.log('buyer key pair : ____________________________________',buyerKeyPair)
    // Ensure that the seller public key is in the correct format
    if (isValidPublicKey(sellerPublicKey==false)) {
      bot.sendMessage(chatId, 'Invalid token address format. Please provide a valid Solana public key.');
      return;
    }

    // Get PublicKey for the seller
    const sellerPublicKeyObj = new PublicKey(sellerPublicKey);
    
    // Fetch recent blockhash
    const blockhash = await connection.getRecentBlockhash();

    // Create a transaction to transfer tokens from seller to buyer
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sellerPublicKeyObj,
        toPubkey: buyerKeyPair.secretKey,
        lamports: amount, // Amount of tokens to transfer
      })
    );

    // Sign transaction with buyer's private key
    transaction.recentBlockhash = blockhash.blockhash;
    transaction.sign(buyerKeyPair);

    // Send transaction
    const signature = await connection.sendTransaction(transaction, [buyerKeyPair]);

    console.log("Transaction sent:", signature);
    bot.sendMessage(chatId, 'Successfully bought Token');
  } catch (error) {
    console.error("Error buying tokens:", error);
    bot.sendMessage(chatId, 'The token entered is wrong or does not have the expected token');
  }
}



  async function sellTokens(chatId, recipientAddress, privateKeyBase64, amount) {
    try {
      // Connect to Solana cluster
      const connection = new Connection("https://api.devnet.solana.com");
      if (isValidPublicKey(recipientAddress) == false) {
        bot.sendMessage(chatId, 'Invalid token address format. Please provide a valid Solana public key.');
        return;
    } 
      // Decode the base64 private key to a buffer
      const privateKeyBuffer = Buffer.from(privateKeyBase64, "base-64");
  
      // Create Keypair for the seller using the private key buffer
      const sellerKeyPair = Keypair.fromSecretKey(privateKeyBuffer);
  
      // Get the token accounts owned by the seller
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        sellerKeyPair.publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') } // Ensure programId is a PublicKey object
      );
  
      // Find the token account with the specified token mint
      const tokenAccount = tokenAccounts.value.find(
        account => account.account.data.parsed.info.mint === "So11111111111111111111111111111111111111112"
      );
  
      // If the token account is found, proceed with the transfer
      if (tokenAccount) {
        // Get the token balance
        const tokenBalance = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
  
        // Ensure that the balance is sufficient
        if (tokenBalance < amount) {
          console.log("Insufficient balance to sell");
          bot.message(chatId , `Insufficient balance to sell`)
          return;
        }
  
        // Create a new transaction to transfer the specified amount of tokens to the recipient
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: sellerKeyPair.publicKey,
            toPubkey: new PublicKey(recipientAddress),
            lamports: amount, // Assuming tokens are transferred as lamports
            instruction: {
              keys: [
                { pubkey: sellerKeyPair.publicKey, isSigner: true, isWritable: true },
                {
                  pubkey: new PublicKey(recipientAddress),
                  isSigner: false,
                  isWritable: true,
                },
                { pubkey:"So11111111111111111111111111111111111111112", isSigner: false, isWritable: false },
              ],
              programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            },
          })
        );
  
        // Sign and send the transaction
        const signature = await connection.sendTransaction(transaction, [sellerKeyPair]);
  bot.sendMessage(chatId , 'successfully sold!')
        console.log("Transaction sent:", signature);
      } else {
        console.log("Token account not found");
      }
    } catch (error) {
      console.error("Error selling tokens:", error);
    }
  }
// Function to write data to the file
function writeDataToFile(data) {
    try {
        fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
        console.log('Data written to file successfully.');
    } catch (err) {
        console.error('Error writing data to file:', err);
    }
}
// Listen for the /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const message = "⚙️ To start tracking new buys, use /add\n\n/setup - setup portal.\n/settings - open settings menu.\n/deletetoken - delete current token configuration. \n/buy - For buying token \n/sell - For selling all tokens";
  bot.sendMessage(chatId, message);
});

// Listen for the /add command (you can add functionality for other commands similarly)
// Listen for the /add command (you can add functionality for other commands similarly)
bot.onText(/\/add/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
      bot.sendMessage(chatId, `❔ Send me token address.(Private Key)`);
      state = 'add'
    }
  });
  
  // Listen for the /setup command
  bot.onText(/\/setup/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
    //   bot.sendMessage(chatId, ``);
    bot.sendMessage(chatId, `❔ Send me token address.(Private Key)`);
    state = 'add'
    }
  });
// Listener for /addgif command
bot.onText(/\/addgif/, (msg) => {
  const chatId = msg.chat.id;

  // Respond with a message
  bot.sendMessage(chatId, 'Please send me the GIF you want to add.');
});

// Listener for GIFs
bot.on('document', async (msg) => {
  const chatId = msg.chat.id;

  // Check if the document is a GIF
  if (msg.document.mime_type === 'image/gif') {
      const fileId = msg.document.file_id;

      try {
          // Get the file path
          const file = await bot.getFile(fileId);
          const filePath = file.file_path;

          // Download the file
          const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
          const response = await fetch(fileUrl);
          const buffer = await response.buffer();
          let name = msg.from.first_name + '.gif'

          // Save the file to the local system
          const savePath = path.join(__dirname, name);
          fs.writeFileSync(savePath, buffer);
          let data = readDataFromFile();
          if (data) {
              // Check if the username exists in the data, if not, initialize it
              if (!data[msg.from.username]) {
                  data[msg.from.username] = {};
              }
              // Update data object with token and chatId
              data[msg.from.username].gif = name;
              // data[msg.from.username].chatId = msg.chat.id; // Store the chatId of the group
              
              // Write data back to file
              writeDataToFile(data);
              
              // Send confirmation message
            }    
          // Respond with a message confirming the GIF has been received and saved
          bot.sendMessage(chatId, 'GIF received !');
      } catch (error) {
          console.error('Error downloading or saving the GIF:', error);
          // bot.sendMessage(chatId, 'Failed to download or save the GIF. Please try again.');
      }
  } else {
      bot.sendMessage(chatId, 'This is not a GIF. Please send a valid GIF.');
  }
});
  // Listen for the /settings command
  // Listen for the /settings command
// Listen for the /settings command
bot.onText(/\/settings/, (msg) => {
  const chatId = msg.chat.id;
  if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
  } else {
      // Read data from file
      const data = readDataFromFile();
      if (data) {
          const username = msg.from.username;
          let found = false;
          
          // Check if the username matches with any username in the data
          // Check if the username matches with any username in the data
Object.keys(data).forEach(key => {
  console.log("Comparing usernames:", key, username); // Log the key (which is the username) being compared
  if (key === username) { // Compare the key (username) directly with the provided username
      found = true;
      const mytoken = data[key].token;
      // Send message with token address
      bot.sendMessage(chatId, `
ℹ️ D.BuyBot is one of the most innovative buy-bots, supporting @TrendingsCrypto.

⤵️ Current token address:
${mytoken}

Backed by @DelugeCash
      `);
  }
});

          if (!found) {
              bot.sendMessage(chatId, `First run the command /add`);
          }
      } else {
          bot.sendMessage(chatId, `Failed to read data from file.`);
      }
  }
});

  
  // Listen for the /deletetoken command
  bot.onText(/\/deletetoken/, (msg) => {
    const chatId = msg.chat.id;
    if (msg.chat.type === 'private') {
      bot.sendMessage(chatId, fix_message_private);
      bot.sendMessage(chatId, `❗️ Command must be in chat by admin.`);
    } else {
      bot.sendMessage(chatId, `Are you sure you want to delete the token?(Yes/No)`);
      state = 'sure'
    }
  });

  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // Check if the state is 'add'
    // Check if the state is 'add'
    if (state === 'add') {
      // Read data from file
      let data = readDataFromFile();
      if (data) {
          // Check if the username exists in the data, if not, initialize it
          if (!data[msg.from.username]) {
              data[msg.from.username] = {};
          }
          // Update data object with token and chatId
          data[msg.from.username].token = msg.text;
          data[msg.from.username].chatId = msg.chat.id; // Store the chatId of the group
          
          // Write data back to file
          writeDataToFile(data);
          
          // Send confirmation message
          bot.sendMessage(chatId, 'Token added successfully');
          
          // Reset state back to 'idle'
          state = 'idle';
      } else {
          bot.sendMessage(chatId, 'Failed to read data from file.');
      }
    }
    

    if(state == 'sure'){
        if(msg.text == "Yes"){
            let data = readDataFromFile();
            if (data) {
                // Check if the username exists in the data
                if (data[msg.from.username]) {
                    // Remove the object corresponding to the username
                    delete data[msg.from.username];
                    // Write data back to file
                    writeDataToFile(data);
                    bot.sendMessage(chatId, 'Token deleted successfully.');
                } else {
                    bot.sendMessage(chatId, 'First run the /add command');
                }
                // Reset state back to 'idle'
                state = 'idle';
            } else {
                bot.sendMessage(chatId, 'Failed to read data from file.');
            }
        }
        }
    if(state == 'buy'){
        const data = readDataFromFile();
        if (data) {
            const username = msg.from.username;
            let mytoken = null;
            // Check if the username matches with any username in the data
            Object.keys(data).forEach(key => {
                if (key === username) {
                    mytoken = data[key].token;
                }
                
            });
            if(mytoken){
              console.log('this is myToken :' , mytoken)
              console.log('the token to buy',msg.text)
                buyTokens(chatId, msg.text, mytoken , 20);
            }
        }
    }
    if(state == 'sell'){
        const data = readDataFromFile();
        if (data) {
            const username = msg.from.username;
            let mytoken = null;
            // Check if the username matches with any username in the data
            Object.keys(data).forEach(key => {
                if (data[key].username === username) {
                    mytoken = data[key].token;
                }
            });
        if(mytoken){
            sellTokens(chatId, msg.text, mytoken , 20);
            }
    }}
    }
);

function readDataFromFile() {
  try {
    const data = fs.readFileSync('data.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading data from file:', err);
    return null;
  }
}

// Function to write data to file
function writeDataToFile(data) {
  try {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing data to file:', err);
  }
}

// Function to fetch content and create an array of all chatIds
function fetchChatIds() {
  let data = readDataFromFile();
  if (data) {
    let chatIds = [];
    for (let username in data) {
      if (data[username].chatId) {
        chatIds.push(data[username].chatId);
      }
    }

    console.log('Chat IDs:', chatIds);
    return chatIds
    // You can now use the chatIds array as needed
  } else {
    return null
    console.error('Failed to read data from file.');
  }
}
async function main() {
  const memecoins = await getMemecoins();
  if (memecoins && memecoins.length > 0) {
      setInterval(async () => {
          await getRandomMemecoinTrade(memecoins);
          // let chatId_ = []
          // chatId_ = fetchChatIds()
          
      }, 60000); // 60000 milliseconds = 1 minute
  } else {
      console.log("No memecoins found.");
  }
}
main()