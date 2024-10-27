const knex = require('../data/conection')

class Donation {
    async new(donorName, amount, date) {
        try {
            await knex.insert({
                donor_name: donorName,
                amount: amount,
                date: date
            }).table('donations')
            return { status: true }
        } catch (err) {
            return { status: false, err: err }
        }
    }

    async findAll() {
        try {
            let donations = await knex.select('*').table('donations')
            return { status: true, values: donations }
        } catch (err) {
            return { status: false, err: err }
        }
    }

    async findById(id) {
        try {
            let donation = await knex.select('*').where({ id: id }).table('donations')
            return donation.length > 0 ? { status: true, values: donation[0] } : { status: false }
        } catch (err) {
            return { status: false, err: err }
        }
    }

    async delete(id) {
        let donation = await this.findById(id)
        if (donation.status) {
            try {
                await knex.delete().where({ id: id }).table('donations')
                return { status: true, message: "Doação excluída com sucesso" }
            } catch (err) {
                return { status: false, err: err }
            }
        } else {
            return { status: false, err: "Doação não encontrada" }
        }
    }

    async update(id, donorName, amount, date) {
        let donation = await this.findById(id)
        if (donation.status) {
            let editDonation = {}
            if (donorName) editDonation.donor_name = donorName
            if (amount) editDonation.amount = amount
            if (date) editDonation.date = date

            try {
                await knex.update(editDonation).where({ id: id }).table('donations')
                return { status: true, message: "Doação atualizada com sucesso" }
            } catch (err) {
                return { status: false, err: err }
            }
        } else {
            return { status: false, err: "Doação não encontrada" }
        }
    }
}

module.exports = new Donation()
