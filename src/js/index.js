// Global app controller
import Search from './models/Search'
import Recipe from './models/Recipe'
import List from './models/List'
import Likes from './models/Likes'
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
import {
  elements,
  renderLoader,
  clearLoader
} from './views/base'

/*******************************************************************************
* Global State of App
* - Search Object
* - Current Recipe Object
* - Shopping likes Object
* - Likes Object
*******************************************************************************/
const state = {}

/*******************************************************************************
* SEARCH CONTROLLER
*******************************************************************************/
const controlSearch = async () => {
  // 1. Get input query from the view
  const query = searchView.getInput()

  // 2. If query exists, then create new "Search" object and add it to State
  if (query) {
    state.search = new Search(query)

    // 3. Prepare UI for results
    searchView.clearInput()
    searchView.clearResults()
    renderLoader(elements.searchResult)

    try {
      // 4. Search for recipes
      await state.search.getResults()

      // 5. Render results on UI
      clearLoader()
      searchView.renderResults(state.search.result)
    } catch (error) {
      alert(`Caught ${error}`)
      clearLoader()
    }
  }
}

elements.searchForm.addEventListener('submit', event => {
  event.preventDefault()
  controlSearch()
})

elements.searchResultsPages.addEventListener('click', event => {
  const button = event.target.closest('.btn-inline')

  if (button) {
    const goToPage = parseInt(button.dataset.goto, 10)
    searchView.clearResults()
    searchView.renderResults(state.search.result, goToPage)
  }
})

/*******************************************************************************
* RECIPE CONTROLLER
*******************************************************************************/
const controlRecipe = async () => {
  // 1. Get ID from the URL
  const id = window.location.hash.replace('#', '')

  if (id) {
    // 2. Prepare the UI for changes
    recipeView.clearRecipe()
    renderLoader(elements.recipe)

    // Highlight selected
    if (state.search) searchView.highlightSelected(id)

    // 3. Create a new recipe object
    state.recipe = new Recipe(id)

    try {
      // 4. Get recipe data and parse ingredients
      await state.recipe.getRecipe()
      state.recipe.parseIngredients()

      // 5. Calculate servings and cooking time
      state.recipe.calcCookingTime()
      state.recipe.calcServings()

      // 6. Render the recipe
      clearLoader()
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      )
    } catch (error) {
      alert(`Caught ${error}`)
    }
  }
}

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe))

const controlList = () => {
  // 1. Create a new list if there is none yet
  if (!state.shoppingList) state.shoppingList = new List()

  // 2. Add each ingredient to the list and add it to the UI
  state.recipe.ingredients.forEach(ing => {
    const item = state.shoppingList.addItem(ing.amount, ing.unit, ing.ingredient)
    listView.renderItem(item)
  })
}

// Handle delete and update list
elements.shoppingList.addEventListener('click', event => {
  const id = event.target.closest('.shopping__item').dataset.itemid

  if (event.target.matches('.shopping__delete, .shopping__delete *')) {
    state.shoppingList.deleteItem(id)
    listView.deleteItem(id)
  } else if (event.target.matches('.shopping__amount-value')) {
    const val = parseFloat(event.target.value)
    state.shoppingList.updateAmount(id, val)
  }
})

/*******************************************************************************
* LIKES CONTROLLER
*******************************************************************************/
const controlLikes = () => {
  if (!state.likes) state.likes = new Likes()
  const currentID = state.recipe.id

  if (!state.likes.isLiked(currentID)) {
    // User has NOT liked current recipe
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.image
    )
    // Toggle the like button
    likesView.toggleLikeBtn(true)

    // Add like to the UI list
    likesView.renderLike(newLike)
  } else {
    // User has liked current recipe
    state.likes.deleteLike(currentID)

    // Toggle the like button
    likesView.toggleLikeBtn(false)

    // Remove like from the UI list
    likesView.deleteLike(currentID)
  }

  likesView.toggleLikeMenu(state.likes.getNumberOfLikes())
}

// Restore liked recipes on the page load
window.addEventListener('load', () => {
  state.likes = new Likes()
  state.likes.readStorage()
  likesView.toggleLikeMenu(state.likes.getNumberOfLikes())
  state.likes.likes.forEach(like => {
    likesView.renderLike(like)
  })
})

// Handling recipe button clicks
elements.recipe.addEventListener('click', event => {
  if (event.target.matches(`button[data-serv="dec"] *`)) {
    // Decrease button
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec')
      recipeView.updateServsAndIngs(state.recipe)
    }
  } else if (event.target.matches(`button[data-serv="inc"] *`)) {
    // Increase button
    state.recipe.updateServings('inc')
    recipeView.updateServsAndIngs(state.recipe)
  } else if (event.target.matches('.recipe__btn, .recipe__btn *, .recipe__btn--add, .recipe__btn--add *')) {
    // Add ingredients to shopping list
    controlList()
  } else if (event.target.matches('.recipe__love, .recipe__love *')) {
    // Call the Likes controller
    controlLikes()
  }
})
