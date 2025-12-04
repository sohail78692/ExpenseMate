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
    tags: [{
        type: String,
        maxlength: [30, 'Tag cannot be more than 30 characters'],
    }],
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Other'],
        default: 'Cash',
    },
    isRecurring: {
        type: Boolean,
        default: false,
    },
    recurringFrequency: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    },
}, { timestamps: true });

// Add indexes for better query performance
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ user: 1, category: 1 });

export default mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
