const axios = require('axios');
require('dotenv').config();

async function testAdminLogin() {
    const email = process.env.ROOT_ADMIN_EMAIL?.trim();
    const password = process.env.ROOT_ADMIN_PASSWORD?.trim();

    if (!email || !password) {
        console.error('ROOT_ADMIN_EMAIL or ROOT_ADMIN_PASSWORD not set in .env');
        return;
    }

    try {
        console.log(`Attempting login for admin: ${email}...`);
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email,
            password
        });
        console.log('Login success!');
        console.log('User Details:', response.data);
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
}

testAdminLogin();
