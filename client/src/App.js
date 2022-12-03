import React from 'react';
import './App.css'; 
import axios from 'axios';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import RecipeList from './components/RecipeList/RecipeList';
import Recipe from './components/Recipe/Recipe';
import CreateRecipe from './components/Recipe/CreateRecipe';
import EditRecipe from './components/Recipe/EditRecipe';

class App extends React.Component {
  state = {
    recipes: [],
    recipe: null,
    token: null,
    user: null
  }

  componentDidMount() {
    axios.get('http://localhost:5000')
      .then((response) => {
        this.setState({
          data: response.data
        })
      })
      .catch((error) => {
        console.error(`Error fetching data: ${error}`);
      })

      this.authenticateUser();
  }

  authenticateUser = () => {
    const token = localStorage.getItem('token');

    if(!token) {
      localStorage.removeItem('user')
      this.setState({ user: null });
    }

    if(token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      }
      axios.get('http://localhost:5000/api/auth', config)
      .then((response) => {
        localStorage.setItem('user', response.data.name)
        this.setState(
          { 
            user: response.data.name,
            token: token
          },
          () => {
            this.loadData();
          }
        );
      })
      .catch((error) => {
        localStorage.removeItem('user');
        this.setState({ user: null });
        console.error(`Error logging in: ${error}`);
      })
    }
  }

  loadData = () => {
    const {token} = this.state;
    if(token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };
      axios
        .get('http://localhost:5000/api/recipes', config)
        .then(response => {
          this.setState({
            recipes: response.data
          });
        })
        .catch(error => {
          console.error(`Error fetching data: ${error}`);
        });
    }
  };

  viewRecipe = recipe => {
    console.log(`view ${recipe.name}`);
    this.setState({
      recipe: recipe
    });
  };

  deleteRecipe = recipe => {
    const { token } = this.state;

    if(token) {
      const config = {
        headers: {
          'x-auth-token': token
        }
      };

      axios
        .delete(`http://localhost:5000/api/recipes/${recipe._id}`, config)
        .then(response => {
          const newRecipes = this.state.recipes.filter(r => r._id !== recipe._id);
          this.setState({
            recipes: [...newRecipes]
          });
        })
        .catch(error => {
          console.error(`Error deleting post: ${error}`);
        })
    }
  };

  editRecipe = recipe => {
    this.setState({
      recipe: recipe
    });
  };

  onRecipeCreated = recipe => {
    const newRecipes = [...this.state.recipes, recipe];

    this.setState({
      recipes: newRecipes
    });
  };

  onRecipeUpdated = recipe => {
    console.log('updated recipe: ', recipe);
    const newRecipes = [...this.state.recipes];
    const index = newRecipes.findIndex(r => r._id === recipe._id);

    newRecipes[index] = recipe
    this.setState({
      recipes: newRecipes
    });
  };

  logOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.setState({ user: null, token: null});
  }

  render () {
    let {user, recipes, recipe, token } = this.state;
    const authProps = {
      authenticateUser: this.authenticateUser
    }
    return (
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>Cocktail Recipe List</h1>
              <ul>
                <li>
                  <Link to="/">Home</Link>
                </li>
                <li>
                  {user ? (
                    <Link to="/new-recipe">New Recipe</Link>
                  ) : (
                    <Link to="/register">Register</Link>
                  )}
                  
                </li>
                <li>
                {user ? (
                  <Link to="" onClick={this.logOut}>Log Out</Link>
                ) : (
                  <Link to="/login">Login</Link>
                )}
                </li>
              </ul>
          </header>
          <main>
            <Switch>
              <Route exact path ="/">
                {user ? (
                  <React.Fragment>
                    <div>Hello {user}!</div>
                    <div>Welcome to the cocktail list.</div>
                    <div>Click on one of the cocktails to see the recipe & garnish!</div>
                    <RecipeList 
                      recipes={recipes} 
                      clickRecipe={this.viewRecipe}
                      deleteRecipe={this.deleteRecipe}
                      editRecipe={this.editRecipe}
                    />
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    Please Register or Login
                  </React.Fragment>
                )}
              </Route>
              <Route path="/recipes/:recipeId">
                  <Recipe recipe={recipe}/>
              </Route>
              <Route path="/new-recipe">
                  <CreateRecipe token={token} onRecipeCreated={this.onRecipeCreated}/>
              </Route>
              <Route path="/edit-recipe/:recipeId">
                  <EditRecipe
                    token={token}
                    recipe={recipe}
                    onRecipeUpdated={this.onRecipeUpdated}
                  />
              </Route>
              <Route
                exact path="/Register"
                render={() => <Register {...authProps} />}
              />
              <Route
                exact path="/Login"
                render={() => <Login {...authProps} />}
              />
            </Switch>
          </main>        
        </div>
      </Router>      
    );
  }
}

export default App;