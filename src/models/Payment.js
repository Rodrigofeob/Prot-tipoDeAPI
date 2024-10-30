const knex = require('../database/connection');
const { v4: uuidv4 } = require('uuid');

class Payment {
    async new(userId, amount, paymentMethod, status = 'pending', paymentId = null) {
        try {
            const payment = {
                user_id: userId,
                amount: amount,
                payment_method: paymentMethod,
                status: status,
                payment_id: paymentId || uuidv4(),
                created_at: new Date()
            };

            await knex('payments').insert(payment);
            return { status: true, paymentId: payment.payment_id };
        } catch (err) {
            console.error('Payment creation error:', err);
            return { status: false, err: "Erro ao criar pagamento" };
        }
    }

    async updateStatus(paymentId, status) {
        try {
            await knex('payments')
                .where({ payment_id: paymentId })
                .update({ 
                    status: status,
                    updated_at: new Date()
                });
            return { status: true };
        } catch (err) {
            console.error('Payment status update error:', err);
            return { status: false, err: "Erro ao atualizar status" };
        }
    }

    async findByPaymentId(paymentId) {
        try {
            const payment = await knex('payments')
                .where({ payment_id: paymentId })
                .first();
            return payment ? { status: true, payment } : { status: false };
        } catch (err) {
            console.error('Find payment error:', err);
            return { status: false, err: "Erro ao buscar pagamento" };
        }
    }
}

module.exports = new Payment(); 