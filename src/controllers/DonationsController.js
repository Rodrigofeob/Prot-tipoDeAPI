var Donation = require('../models/Donations')

class DonationsController {
    async create(req, res) {
        let { donorName, amount, date } = req.body
        let result = await Donation.new(donorName, amount, date)
        
        result.status
        ? res.status(200).json({ success: true, message: "Doação registrada com sucesso!" })
        : res.status(400).json({ success: false, message: result.err })
    }

    async findAll(req, res) {
        let donations = await Donation.findAll()
        
        donations.status
        ? res.status(200).json({ success: true, values: donations.values })
        : res.status(400).json({ success: false, message: donations.err })
    }

    async findDonation(req, res) {
        let id = req.params.id
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Parâmetro inválido' })
        }

        let donation = await Donation.findById(id)
        
        donation.status
        ? res.status(200).json({ success: true, values: donation.values })
        : res.status(404).json({ success: false, message: 'Doação não encontrada' })
    }

    async remove(req, res) {
        let id = req.params.id
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Parâmetro inválido' })
        }

        let result = await Donation.delete(id)
        
        result.status
        ? res.status(200).json({ success: true, message: "Doação excluída com sucesso!" })
        : res.status(400).json({ success: false, message: result.err })
    }

    async editDonation(req, res) {
        let id = req.params.id
        let { donorName, amount, date } = req.body
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Parâmetro inválido' })
        }

        let result = await Donation.update(id, donorName, amount, date)
        
        result.status
        ? res.status(200).json({ success: true, message: "Doação atualizada com sucesso!" })
        : res.status(400).json({ success: false, message: result.err })
    }

    async userDonation(req, res) {
        try {
            const { amount, paymentMethod, message } = req.body;
            const userId = req.userId; // This comes from the Auth middleware
            
            // Validate amount
            if (!amount || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor da doação inválido'
                });
            }

            // For now, we'll just store the donation with the user's name
            // In a real implementation, you'd integrate with a payment processor here
            const result = await Donation.new(
                `Doação via ${paymentMethod}`, // donorName
                amount,
                new Date().toISOString().split('T')[0] // current date
            );
            
            if (result.status) {
                return res.status(200).json({
                    success: true,
                    message: "Doação registrada com sucesso! Obrigado pela sua contribuição."
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.err || "Erro ao processar doação"
                });
            }
        } catch (error) {
            console.error('User donation error:', error);
            return res.status(500).json({
                success: false,
                message: "Erro interno ao processar doação"
            });
        }
    }
}

module.exports = new DonationsController()
