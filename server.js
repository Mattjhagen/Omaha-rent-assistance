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
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://images.simplycodes.com", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://www.youtube.com"],
      mediaSrc: ["'self'", "https://www.youtube.com"]
    }
  }
}));

app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('public'));
app.use('/images', express.static('images'));
app.use('/styles.css', express.static('public/styles.css'));

// Stripe webhook endpoint
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Error message: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      const amount = session.amount_total / 100; // Convert from cents
      
      // Update campaign data
      campaignData.currentAmount += amount;
      campaignData.donorCount += 1;
      campaignData.familiesHelped = Math.floor(campaignData.currentAmount / 2500);
      campaignData.averageDonation = campaignData.currentAmount / campaignData.donorCount;
      campaignData.lastDonation = new Date().toISOString();
      
      // Check for milestones
      const percentage = (campaignData.currentAmount / campaignData.goal) * 100;
      if (percentage >= 10 && !campaignData.milestones['10%']) {
        campaignData.milestones['10%'] = true;
        console.log('🎉 Milestone reached: 10% of goal!');
      }
      if (percentage >= 25 && !campaignData.milestones['25%']) {
        campaignData.milestones['25%'] = true;
        console.log('🎉 Milestone reached: 25% of goal!');
      }
      if (percentage >= 50 && !campaignData.milestones['50%']) {
        campaignData.milestones['50%'] = true;
        console.log('🎉 Milestone reached: 50% of goal!');
      }
      if (percentage >= 75 && !campaignData.milestones['75%']) {
        campaignData.milestones['75%'] = true;
        console.log('🎉 Milestone reached: 75% of goal!');
      }
      if (percentage >= 100 && !campaignData.milestones['100%']) {
        campaignData.milestones['100%'] = true;
        console.log('🎉 GOAL ACHIEVED: 100% of $1M goal reached!');
      }
      
      console.log(`✅ New donation: $${amount} - Total: $${campaignData.currentAmount.toLocaleString()} (${percentage.toFixed(1)}%)`);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});


// In-memory storage for demo (use a database in production)
let campaignData = {
  currentAmount: 12750,
  goal: 1000000,
  donorCount: 47,
  familiesHelped: 5,
  averageDonation: 271.28,
  lastDonation: new Date().toISOString(),
  milestones: {
    '10%': false,
    '25%': false,
    '50%': false,
    '75%': false,
    '100%': false
  }
};

// Routes
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'index.html');
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

// Get Stripe publishable key
app.get('/api/stripe-key', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Get detailed campaign metrics
app.get('/api/campaign-metrics', (req, res) => {
  const percentage = (campaignData.currentAmount / campaignData.goal) * 100;
  const remaining = campaignData.goal - campaignData.currentAmount;
  const daysSinceStart = Math.ceil((new Date() - new Date('2025-01-01')) / (1000 * 60 * 60 * 24));
  const averageDaily = campaignData.currentAmount / Math.max(1, daysSinceStart);
  const projectedCompletion = remaining / Math.max(1, averageDaily);
  
  res.json({
    ...campaignData,
    percentage: Math.min(100, percentage),
    remaining: Math.max(0, remaining),
    daysSinceStart: Math.max(1, daysSinceStart),
    averageDaily: averageDaily,
    projectedCompletionDays: Math.ceil(projectedCompletion),
    isOnTrack: percentage >= (daysSinceStart / 365) * 100
  });
});

// Create payment intent


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
      campaignData.averageDonation = campaignData.currentAmount / campaignData.donorCount;
      campaignData.lastDonation = new Date().toISOString();

      // Check for milestones
      const percentage = (campaignData.currentAmount / campaignData.goal) * 100;
      if (percentage >= 10 && !campaignData.milestones['10%']) {
        campaignData.milestones['10%'] = true;
        console.log('🎉 Milestone reached: 10% of goal!');
      }
      if (percentage >= 25 && !campaignData.milestones['25%']) {
        campaignData.milestones['25%'] = true;
        console.log('🎉 Milestone reached: 25% of goal!');
      }
      if (percentage >= 50 && !campaignData.milestones['50%']) {
        campaignData.milestones['50%'] = true;
        console.log('🎉 Milestone reached: 50% of goal!');
      }
      if (percentage >= 75 && !campaignData.milestones['75%']) {
        campaignData.milestones['75%'] = true;
        console.log('🎉 Milestone reached: 75% of goal!');
      }
      if (percentage >= 100 && !campaignData.milestones['100%']) {
        campaignData.milestones['100%'] = true;
        console.log('🎉 GOAL ACHIEVED: 100% of $1M goal reached!');
      }

      // Log the donation (in production, save to database)
      console.log(`✅ New donation: $${donationAmount} - Total: $${campaignData.currentAmount.toLocaleString()} (${percentage.toFixed(1)}%)`);

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

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount. Minimum donation is $1.' });
    }

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Omaha Housing Initiative Donation',
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Unable to create checkout session' });
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
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
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
