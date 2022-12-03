import mongoose from 'mongoose';

const RecipeSchema = new mongoose.Schema({
    user: {
        type: 'ObjectId',
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    ingredients: {
        type: String,
        required: true
    },
    garnish: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Recipe = mongoose.model('recipe', RecipeSchema);

export default Recipe;