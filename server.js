import express from 'express';
import connectDatabase from './config/db';
import { check, validationResult } from 'express-validator';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import User from './models/User';
import auth from './middleware/auth';
import Recipe from './models/Recipe';

//init express app
const app = express();

//connect db
connectDatabase();

//configure middleware
app.use(express.json({ extended: false }));
app.use(
    cors({
        origin: 'http://localhost:3000'
    })
);

//api endpoints
/**
 * @route GET /
 * @desc Text endpoints
 */
app.get('/', (req, res) => 
    res.send('http get request sent to root api endpoint')
);

/**
 * @route POST api/users
 * @desc Register user
 */
app.post(
    '/api/users', 
    [
        check('name', 'Please enter your name')
            .not()
            .isEmpty(),
        check('email', 'Please enter a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const { name, email, password} = req.body;
            try {
                //check if user exists
                let user = await User.findOne({ email: email });
                if (user) {
                    return res
                        .status(400)
                        .json({ errors: [{ msg: 'User already exists' }] });
                }

                user = new User({
                    name: name,
                    email: email,
                    password: password
                });

                //encrypt password
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);

                //save to db and return
                await user.save();

                returnToken(user, res);
            } catch (error) {
                res.status(500).send('Server error');
            }
        }
    }

/**
 * @route GET api/auth
 * @desc Authenticate user
 */
);
app.get('/api/auth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Unknown server error');
    }
});

/**
 * @route POST api/login
 * @desc Login user
 */
app.post(
    '/api/login',
    [
        check('email', 'Please enter a valid email').isEmail(),
        check('password', 'A password is required').exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        } else {
            const { email, password } = req.body;
            try {
                //check if user exists
                let user = await User.findOne({ email: email });
                if (!user) {
                    return res 
                        .status(400)
                        .json({ errors: [{msg: 'Invalid email or password' }] });
                }

                //check password
                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    return res
                        .status(400)
                        .json({ errors: [{ msg: 'Invalid email or password' }] });
                }

                returnToken(user, res);
            } catch(error) {
                res.status(500).send('Server error');
            }
        }
    }
);

const returnToken = (user, res) => {
    //generate and return jwt token
    const payload = {
        user: {
            id: user.id
        }
    };

    jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: '10hr'},
        (err, token) => {
            if (err) throw err;
            res.json({ token: token });
        }
    );
};

/**
 * @route POST api/recipe
 * @desc Create recipe
 */
app.post(
    '/api/recipes',
    [
        auth,
        [
            check('name', 'Name text is required')
            .not()
            .isEmpty(),
            check('ingredients', 'Ingredients text is required')
            .not()
            .isEmpty(),
            check('garnish', 'Garnish text is required')
            .not()
            .isEmpty()
        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
        } else {
            const { name, ingredients, garnish} = req.body;
            try {
                //get the user who created the recipe
                const user = await User.findById(req.user.id);

                //create new recipe
                const recipe = new Recipe({
                    user: user.id,
                    name: name,
                    ingredients: ingredients,
                    garnish: garnish
                });

                //save to the db and return
                await recipe.save();

                res.json(recipe);
            } catch (error) {
                console.error(error);
                res.status(500).send('Server error');
            }
        }
    }
);

/**
     * @route GET api/recipes
     * @desc Get recipes
     */
app.get('/api/recipes', auth, async (req, res) => {
    try {
        const recipes = await Recipe.find().sort({ date: -1 });

        res.json(recipes);
    } catch(error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

/**
 * @route GET api/recipes/:id
 * @desc Get recipe
 */
app.get('/api/recipes/:id', auth, async(req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        //make sure the recipe was found
        if(!recipe) {
            return res.status(404).json({ msg: 'Recipe not found'});
        }

        res.json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

/**
 * @route DELETE api/recipe/:id
 * @desc Delete recipe
 */

app.delete('/api/recipes/:id', auth, async(req,res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);

        //make sure post was found
        if(!recipe) {
            return res.status(404).json({ msg: 'Recipe not found'});
        }

        //make sure request user created post
        if(recipe.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized'});
        }

        await recipe.remove();

        res.json({ msg: 'Recipe Removed '});
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

/**
 * @route PUT api/recipes/:id
 * @desc Update recipe
 */
app.put('/api/recipes/:id', auth, async (req, res) => {
    try {
        const { name, ingredients, garnish } = req.body;
        const recipe = await Recipe.findById(req.params.id);

        //make sure recipe was found
        if(!recipe) {
            return res.status(404).json({ msg: 'Recipe not found'});
        }

        //make sure request user created recipe
        if(recipe.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized'});
        }

        //update recipe and return
        recipe.name = name || recipe.name;
        recipe.ingredients = ingredients || recipe.ingredients;
        recipe.garnish = garnish || recipe.garnish;

        await recipe.save();

        res.json(recipe);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

//connection listener
const port = 5000;
app.listen(port, () => console.log(`Express server running on port ${port}`));