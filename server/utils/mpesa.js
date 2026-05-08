const axios = require('axios');

const MPESA_BASE_URL =
  process.env.MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

// Get OAuth access token
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  );

  return response.data.access_token;
};

// Generate password (base64 of shortcode + passkey + timestamp)
const generatePassword = (timestamp) => {
  const str = `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`;
  return Buffer.from(str).toString('base64');
};

// Format phone number to 2547XXXXXXXX
const formatPhone = (phone) => {
  let p = phone.replace(/\s+/g, '');
  if (p.startsWith('+')) p = p.substring(1);
  if (p.startsWith('0')) p = `254${p.substring(1)}`;
  return p;
};

// Initiate STK Push (Lipa Na M-Pesa Online)
const initiateStkPush = async ({ phone, amount, orderId, description }) => {
  const token = await getAccessToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14);
  const password = generatePassword(timestamp);
  const formattedPhone = formatPhone(phone);

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount), // M-Pesa requires integers
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: `CH-${orderId}`,
    TransactionDesc: description || 'Chai Heritage Purchase',
  };

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

// Query STK Push status
const queryStkStatus = async (checkoutRequestId) => {
  const token = await getAccessToken();
  const timestamp = new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, '')
    .slice(0, 14);
  const password = generatePassword(timestamp);

  const response = await axios.post(
    `${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`,
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

module.exports = { initiateStkPush, queryStkStatus, formatPhone };
