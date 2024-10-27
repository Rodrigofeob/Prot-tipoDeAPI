var Expense = require('../models/Expenses')

class ExpensesController {
    async create(req, res) {
        let { description, amount, date, category } = req.body
        let result = await Expense.new(description, amount, date, category)
        
        result.status
        ? res.status(200).json({ success: true, message: "Despesa registrada com sucesso!" })
        : res.status(400).json({ success: false, message: result.err })
    }

    async findAll(req, res) {
        let expenses = await Expense.findAll()
        
        expenses.status
        ? res.status(200).json({ success: true, values: expenses.values })
        : res.status(400).json({ success: false, message: expenses.err })
    }

    async findExpense(req, res) {
        let id = req.params.id
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Parâmetro inválido' })
        }

        let expense = await Expense.findById(id)
        
        expense.status
        ? res.status(200).json({ success: true, values: expense.values })
        : res.status(404).json({ success: false, message: 'Despesa não encontrada' })
    }

    async remove(req, res) {
        let id = req.params.id
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Parâmetro inválido' })
        }

        let result = await Expense.delete(id)
        
        result.status
        ? res.status(200).json({ success: true, message: "Despesa excluída com sucesso!" })
        : res.status(400).json({ success: false, message: result.err })
    }

    async editExpense(req, res) {
        let id = req.params.id
        let { description, amount, date, category } = req.body
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, message: 'Parâmetro inválido' })
        }

        let result = await Expense.update(id, description, amount, date, category)
        
        result.status
        ? res.status(200).json({ success: true, message: "Despesa atualizada com sucesso!" })
        : res.status(400).json({ success: false, message: result.err })
    }
}

module.exports = new ExpensesController()
