import React from 'react';
import { useHistory} from 'react-router-dom';
import slugify from 'slugify';
import './styles.css';

const RecipeListItem = props => {
    const { recipe, clickRecipe, deleteRecipe, editRecipe} = props;
    const history = useHistory();

    const handleClickRecipe = recipe => {
        const slug = slugify(recipe.name, { lower: true });

        clickRecipe(recipe);
        history.push(`/recipes/${slug}`);
    };

    const handleEditRecipe = recipe => {
        editRecipe(recipe);
        history.push(`/edit-recipe/${recipe._id}`);
    };

    return (
        <div>
            <div className="recipeListItem" onClick={() => handleClickRecipe(recipe)}>
                <h2>{recipe.name}</h2>
            </div>
            <div className="recipeControls">
                <button onClick={() => deleteRecipe(recipe)}>Delete</button>
                <button onClick={() => handleEditRecipe(recipe)}>Edit</button>
            </div>
        </div>
    );
};

export default RecipeListItem;