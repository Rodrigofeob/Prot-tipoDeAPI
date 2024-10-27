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
}

module.exports = new DonationsController()
