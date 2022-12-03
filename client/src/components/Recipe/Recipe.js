import React from 'react';

const Recipe = props => {
    const { recipe } = props;

    return (
        <div>
            <p>{recipe.name}</p>
            <p>{recipe.ingredients}</p>
            <p>{recipe.garnish}</p>
        </div>
    )
}

export default Recipe;