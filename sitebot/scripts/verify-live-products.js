const DodoPayments = require('dodopayments');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY,
  environment: 'live_mode', // Explicitly use live_mode
});

async function verifyProducts() {
  console.log('Verifying Live Mode Products...');
  console.log('API Key present:', !!process.env.DODO_PAYMENTS_API_KEY);

  try {
    const response = await dodo.products.list({ limit: 100 });
    console.log('Products Response:', JSON.stringify(response, null, 2));
    const products = response.items || response.data || response; // Try to find array

    if (!Array.isArray(products)) {
        throw new Error('Products is not an array');
    }

    console.log(`Found ${products.length} products in Live Mode:`);
    
    products.forEach(p => {
      console.log(`- ${p.name} (${p.description || 'No description'})`);
      console.log(`  ID: ${p.product_id}`);
      console.log(`  Price: ${(p.price.price / 100).toFixed(2)} ${p.price.currency}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error verifying products:', error.message);
    if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

verifyProducts();
