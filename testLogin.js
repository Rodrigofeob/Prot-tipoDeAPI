const bcrypt = require('bcryptjs');
const User = require('./src/models/Users');

async function testLogin() {
    console.log('Starting login test...');
    
    const email = 'admin@test.com';
    const password = 'admin123';

    try {
        console.log('Looking for user with email:', email);
        
        const user = await User.findByEmail(email);
        console.log('Found user:', user);

        if (user.status) {
            console.log('\nTesting password comparison:');
            console.log('Input password:', password);
            console.log('Stored hash:', user.values.password);
            
            // Test password comparison
            const isValid = bcrypt.compareSync(password, user.values.password);
            console.log('\nPassword comparison result:', isValid);
            
            if (isValid) {
                console.log('✅ Password is correct!');
            } else {
                console.log('❌ Password is incorrect!');
                
                // Let's try creating a new hash for comparison
                const salt = bcrypt.genSaltSync(10);
                const newHash = bcrypt.hashSync(password, salt);
                console.log('\nNew hash generated:', newHash);
            }
        }
    } catch (error) {
        console.error('Test failed with error:', error);
    }
    
    console.log('\nTest completed');
}

testLogin().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
}); 