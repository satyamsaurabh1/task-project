const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login on port 5001...');
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'satyamsaurabh34@gmail.com',
            password: 'AnyPassword'
        });
        console.log('Login success:', response.data);
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
    }
}

testLogin();
