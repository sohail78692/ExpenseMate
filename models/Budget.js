import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Transport', 'Housing', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other', 'Total'],
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    year: {
        type: Number,
        required: true,
    },
    alertThreshold: {
        type: Number,
        default: 80, // Alert when 80% of budget is reached
        min: 0,
        max: 100,
    },
}, { timestamps: true });

// Compound index to ensure one budget per category per month per user
BudgetSchema.index({ user: 1, category: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);
