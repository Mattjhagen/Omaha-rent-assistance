# Omaha Housing Initiative 🏠

A modern fundraising website for building affordable housing solutions in Omaha, Nebraska.

## 🚀 Live Demo

Visit the deployed site: [Your Render URL Here]

## 📋 Features

- **Modern, Responsive Design** - Beautiful UI that works on all devices
- **Stripe Payment Integration** - Secure donation processing
- **Real-time Progress Tracking** - Live campaign statistics
- **Glass Morphism Effects** - Modern visual design
- **Smooth Animations** - Engaging user experience
- **Mobile-First Design** - Optimized for mobile devices

## 🛠 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Payments**: Stripe API
- **Deployment**: Render
- **Security**: Helmet.js, CORS

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js (v16 or higher)
- A Stripe account
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/omaha-housing-initiative.git
   cd omaha-housing-initiative
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Stripe keys:
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Visit** `http://localhost:3000`

## 🚀 Deployment on Render

### Step 1: Prepare Your Repository

1. Push your code to GitHub
2. Make sure all environment variables are set up

### Step 2: Deploy on Render

1. Go to [render.com](https://render.com) and sign up/log in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `omaha-housing-initiative`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### Step 3: Set Environment Variables

In Render's dashboard, add these environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `NODE_ENV`: `production`

### Step 4: Deploy

Click "Create Web Service" and wait for deployment to complete.

## 🔧 Configuration

### Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. For testing, use the test keys (they start with `sk_test_` and `pk_test_`)
4. For production, use live keys (they start with `sk_live_` and `pk_live_`)

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Your Stripe secret key | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Your Stripe publishable key | Yes |
| `PORT` | Server port (auto-set by Render) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 📁 Project Structure

```
omaha-housing-initiative/
├── public/
│   ├── index.html          # Main website
│   └── styles.css          # (included in index.html)
├── server.js               # Express server
├── package.json            # Dependencies
├── .env.example            # Environment template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🎨 Customization

### Update Campaign Information

Edit `server.js` to modify the initial campaign data:

```javascript
let campaignData = {
  currentAmount: 12750,    // Starting amount
  goal: 1000000,          // Campaign goal
  donorCount: 47,         // Initial donor count
  familiesHelped: 5       // Families helped so far
};
```

### Modify Content

Edit `public/index.html` to update:
- Campaign description
- Contact information
- Donation amounts
- Personal testimony

### Style Changes

All styles are embedded in `index.html`. Look for the `<style>` section to make design changes.

## 🔒 Security Features

- **Helmet.js** - Sets security headers
- **CORS** - Configured for secure cross-origin requests
- **Environment Variables** - Secrets stored securely
- **Stripe Security** - PCI-compliant payment processing
- **Input Validation** - Server-side validation for all inputs

## 📊 Analytics & Monitoring

The application includes:
- Health check endpoint (`/health`)
- Server-side logging
- Error handling
- Campaign statistics tracking

## 🐛 Troubleshooting

### Common Issues

1. **"Stripe key not found"**
   - Make sure environment variables are set correctly
   - Check that your `.env` file has the right keys

2. **Payment not working**
   - Verify Stripe keys are correct
   - Check browser console for errors
   - Ensure you're using test keys in development

3. **Deployment fails**
   - Check build logs in Render dashboard
   - Verify `package.json` is correct
   - Make sure all environment variables are set in Render

### Getting Help

- Check the [Stripe Documentation](https://stripe.com/docs)
- Review [Render Documentation](https://render.com/docs)
- Check browser console for JavaScript errors

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Contact

**PacMac Mobile LLC**
- Email: housing@pacmacmobile.com
- Phone: 402.915.1434
- Address: 1402 Jones Street, Omaha, NE 68901

---

**Building Dreams, One Home at a Time** 🏠✨