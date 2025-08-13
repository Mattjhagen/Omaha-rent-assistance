const express = require('express');
const stripe = require('stripe');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe with your secret key
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"]
    }
  }
}));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage for demo (use a database in production)
let campaignData = {
  currentAmount: 12750,
  goal: 1000000,
  donorCount: 47,
  familiesHelped: 5
};

// Routes
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Error loading page');
    }
    const htmlWithKey = data.replace('{{STRIPE_PUBLISHABLE_KEY}}', process.env.STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY');
    res.send(htmlWithKey);
  });
});

// Get campaign stats
app.get('/api/campaign-stats', (req, res) => {
  res.json(campaignData);
});

// Create payment intent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    // Validate amount
    if (!amount || amount < 50) { // Minimum $0.50
      return res.status(400).json({ 
        error: 'Invalid amount. Minimum donation is $0.50' 
      });
    }

    // Create payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency,
      metadata: {
        campaign: 'omaha-housing-initiative',
        timestamp: new Date().toISOString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      error: 'Unable to create payment intent' 
    });
  }
});

// Handle successful payment
app.post('/api/payment-success', async (req, res) => {
  try {
    const { paymentIntentId, amount } = req.body;

    // Verify the payment intent with Stripe
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update campaign stats
      const donationAmount = Math.round(amount / 100); // Convert from cents
      campaignData.currentAmount += donationAmount;
      campaignData.donorCount += 1;
      campaignData.familiesHelped = Math.floor(campaignData.currentAmount / 2500);

      // Log the donation (in production, save to database)
      console.log(`New donation: $${donationAmount} - Total: $${campaignData.currentAmount}`);

      res.json({
        success: true,
        message: 'Thank you for your donation!',
        campaignData: campaignData
      });
    } else {
      res.status(400).json({ 
        error: 'Payment not completed' 
      });
    }

  } catch (error) {
    console.error('Error processing payment success:', error);
    res.status(500).json({ 
      error: 'Unable to process payment confirmation' 
    });
  }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    campaign: campaignData 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Omaha Housing Initiative server running on port ${PORT}`);
  console.log(`📊 Current campaign total: $${campaignData.currentAmount.toLocaleString()}`);
  console.log(`👥 Total donors: ${campaignData.donorCount}`);
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('⚠️  Warning: STRIPE_SECRET_KEY not set in environment variables');
  }
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️  Warning: STRIPE_PUBLISHABLE_KEY not set in environment variables');
  }
});