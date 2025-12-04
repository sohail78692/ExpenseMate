import mongoose from 'mongoose';

const SavingsGoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a goal name'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    targetAmount: {
        type: Number,
        required: [true, 'Please provide a target amount'],
        min: 0,
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0,
    },
    deadline: {
        type: Date,
        required: [true, 'Please provide a deadline'],
    },
    category: {
        type: String,
        enum: ['Vacation', 'Emergency Fund', 'Education', 'Investment', 'Purchase', 'Other', 'Car', 'House', 'Retirement', 'Electronics', 'Wedding'],
        default: 'Other',
    },
    icon: {
        type: String,
        default: '🎯',
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

// Index for better query performance
SavingsGoalSchema.index({ user: 1, isCompleted: 1 });

export default mongoose.models.SavingsGoal || mongoose.model('SavingsGoal', SavingsGoalSchema);
