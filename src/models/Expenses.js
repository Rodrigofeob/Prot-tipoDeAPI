const knex = require('../data/conection')

class Expense {
    async new(description, amount, date, category) {
        try {
            await knex.insert({
                description: description,
                amount: amount,
                date: date,
                category: category
            }).table('expenses')
            return { status: true }
        } catch (err) {
            return { status: false, err: err }
        }
    }

    async findAll() {
        try {
            let expenses = await knex.select('*').table('expenses')
            return { status: true, values: expenses }
        } catch (err) {
            return { status: false, err: err }
        }
    }

    async findById(id) {
        try {
            let expense = await knex.select('*').where({ id: id }).table('expenses')
            return expense.length > 0 ? { status: true, values: expense[0] } : { status: false }
        } catch (err) {
            return { status: false, err: err }
        }
    }

    async delete(id) {
        let expense = await this.findById(id)
        if (expense.status) {
            try {
                await knex.delete().where({ id: id }).table('expenses')
                return { status: true, message: "Despesa excluída com sucesso" }
            } catch (err) {
                return { status: false, err: err }
            }
        } else {
            return { status: false, err: "Despesa não encontrada" }
        }
    }

    async update(id, description, amount, date, category) {
        let expense = await this.findById(id)
        if (expense.status) {
            let editExpense = {}
            if (description) editExpense.description = description
            if (amount) editExpense.amount = amount
            if (date) editExpense.date = date
            if (category) editExpense.category = category

            try {
                await knex.update(editExpense).where({ id: id }).table('expenses')
                return { status: true, message: "Despesa atualizada com sucesso" }
            } catch (err) {
                return { status: false, err: err }
            }
        } else {
            return { status: false, err: "Despesa não encontrada" }
        }
    }
}

module.exports = new Expense()
