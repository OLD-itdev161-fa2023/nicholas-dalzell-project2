import React from 'react';
import RecipeListItem from './RecipeListItem';

const RecipeList = props => {
    const { recipes, clickRecipe, deleteRecipe, editRecipe} = props;
    return recipes.map(recipe => (
        <RecipeListItem
            key={recipe._id}
            recipe={recipe}
            clickRecipe={clickRecipe}
            deleteRecipe={deleteRecipe}
            editRecipe={editRecipe}
        />
    ));
};

export default RecipeList;