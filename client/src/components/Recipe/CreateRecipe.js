import React, {useState} from 'react';
import axios from 'axios';
import {useHistory} from 'react-router-dom';
import './styles.css';

const CreateRecipe = ({ token, onRecipeCreated }) => {
    let history = useHistory();
    const [recipeData, setRecipeData] = useState ({
        name: '',
        ingredients: '',
        garnish: ''
    });
    const { name, ingredients, garnish} = recipeData;

    const onChange = e => {
        const { name, value } = e.target;

        setRecipeData({
            ...recipeData,
            [name]: value
        });
    };

    const create = async () => {
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

                //Create the recipe
                const body = JSON.stringify(newRecipe);
                const res = await axios.post(
                    'http://localhost:5000/api/recipes',
                    body,
                    config
                );

                //call the handler and re-direct
                onRecipeCreated(res.data);
                history.push('/');
            } catch(error) {
                console.error(`Error creating recipe: ${error.response.data}`);
            }
        }
    };

    return (
        <div className="form-container">
            <h2>Create New Recipe</h2>
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
            <button onClick={() => create()}>Submit</button>
        </div>
    );
};

export default CreateRecipe;