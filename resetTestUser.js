const bcrypt = require('bcryptjs');
const knex = require('./src/data/conection');

async function resetTestUser() {
    try {
        // Delete existing test user
        await knex('users').where('email', 'admin@test.com').del();
        
        // Create new password hash
        const password = 'admin123';
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        
        // Insert new user
        await knex('users').insert({
            name: 'Admin Test',
            email: 'admin@test.com',
            password: hash,
            phone: '1234567890',
            role: 1
        });
        
        console.log('Test user reset successfully');
        console.log('Email: admin@test.com');
        console.log('Password: admin123');
        
        // Verify the user
        const user = await knex('users')
            .where('email', 'admin@test.com')
            .first();
            
        console.log('\nVerification:');
        console.log('User in database:', user);
        
        // Test password
        const isValid = bcrypt.compareSync('admin123', user.password);
        console.log('Password verification:', isValid);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetTestUser(); 