import React, {useState} from 'react';
import axios from 'axios';
import {useHistory} from 'react-router-dom';
import './styles.css';

const EditRecipe = ({ token, recipe, onRecipeUpdated}) => {
    let history = useHistory();
    const [recipeData, setRecipeData] = useState({
        name: recipe.name,
        ingredients: recipe.ingredients,
        garnish: recipe.garnish
    });
    const { name, ingredients, garnish } = recipeData;

    const onChange = e => {
        const {name, value} = e.target;

        setRecipeData({
            ...recipeData,
            [name]: value
        });
    };

    const update = async() => {
        if(!name || !ingredients || !garnish) {
            console.log('Name, ingredients, and garnish are required');
        } else {
            const newRecipe = {
                name: name,
                ingredients: ingredients,
                garnish: garnish
            };

            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                };

                //create the recipe
                const body = JSON.stringify(newRecipe);
                const res = await axios.put(
                    `http://localhost:5000/api/recipes/${recipe._id}`,
                    body,
                    config
                );

                //call handler and re-direct
                onRecipeUpdated(res.data);
                history.push('/');
            } catch(error) {
                console.error(`Error creating recipe: ${error.response.data}`);
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Edit Recipe</h2>
            <input
                name="name"
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => onChange(e)}
            />
            <input
                name="ingredients"
                type="text"
                placeholder="Ingredients"
                value={ingredients}
                onChange={e => onChange(e)}
            />
            <input
                name="garnish"
                type="text"
                placeholder="Garnish"
                value={garnish}
                onChange={e => onChange(e)}
            />
            <button onClick={() => update()}>Submit</button>
        </div>
    );
};

export default EditRecipe;