import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    amount: {
        type: Number,
        required: [true, 'Please provide an amount'],
    },
    category: {
        type: String,
        required: [true, 'Please provide a category'],
        enum: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'],
    },
    date: {
        type: Date,
        required: [true, 'Please provide a date'],
        default: Date.now,
    },
    note: {
        type: String,
        maxlength: [500, 'Note cannot be more than 500 characters'],
    },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
