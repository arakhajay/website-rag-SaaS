const DodoPayments = require('dodopayments'); // Warning: might need to be 'dodopayments' or similar import
// The project uses 'dodopayments' package.

const apiKey = "JiMjXf-I2FSgF2VK.H52twPf1SwFu0OEMy09IFd2ChpvKZYiZuymXrB7u-mk1sZBY"; // Hardcoded from .env.local for script
const isLive = true;

const client = new DodoPayments({
    bearerToken: apiKey,
    environment: isLive ? 'live_mode' : 'test_mode',
});

async function main() {
    console.log('Listing Live Mode Products...');
    try {
        const response = await client.products.list();
        const products = response.items || response;
        console.log(`Found ${products.length} products.`);
        products.forEach(p => console.log(`- ${p.name}: ${p.product_id}`));

        // We need: Starter, Growth, Professional, Enterprise (Monthly & Yearly)
        const plans = [
            { name: 'Starter', price: 1500, desc: 'For individuals and merchants new to selling online' },
            { name: 'Growth', price: 4900, desc: 'For growing businesses needing core e-commerce features' },
            { name: 'Professional', price: 12900, desc: 'For power users and small teams' },
            { name: 'Enterprise', price: 39900, desc: 'For large organizations and corporations' },
            { name: 'Starter (Yearly)', price: 14400, desc: 'For individuals and merchants - Annual billing', interval: 'Year' },
            { name: 'Growth (Yearly)', price: 46800, desc: 'For growing businesses - Annual billing', interval: 'Year' },
            { name: 'Professional (Yearly)', price: 123600, desc: 'For power users and small teams - Annual billing', interval: 'Year' },
            { name: 'Enterprise (Yearly)', price: 382800, desc: 'For large organizations - Annual billing', interval: 'Year' },
        ];

        for (const plan of plans) {
            const existing = products.find(p => p.name === plan.name);
            if (existing) {
                console.log(`✅ ${plan.name} exists: ${existing.product_id}`);
            } else {
                console.log(`creating ${plan.name}...`);
                const newProduct = await client.products.create({
                    name: plan.name,
                    description: plan.desc,
                    price: {
                        type: 'recurring_price',
                        price: plan.price,
                        currency: 'USD',
                        payment_frequency_interval: plan.interval || 'Month',
                        payment_frequency_count: 1,
                        subscription_period_interval: plan.interval || 'Month',
                        subscription_period_count: 1,
                        discount: 0,
                        purchasing_power_parity: false
                    },
                    tax_category: 'digital_products'
                });
                console.log(`✅ Created ${plan.name}: ${newProduct.product_id}`);
            }
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

main();
