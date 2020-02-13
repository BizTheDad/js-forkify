// Global app controller
import Search from './models/Search'

/*******************************************************************************
* Global State of App
* - Search Object
* - Current Recipe Object
* - Shopping List Object
* - Liked Recipes
*******************************************************************************/
const state = {}

const controlSearch = async () => {
  // 1. Get input query from the view
  const query = 'pizza'

  // 2. If query exists, then create new "Search" object and add it to State
  if (query) {
    state.search = new Search(query)

    // 3. Prepare UI for results
    // 4. Search for recipes
    await state.search.getResults()

    // 5. Render results on UI
    console.log(state.search.result)
  }
}

document.querySelector('.search').addEventListener('submit', e => {
  e.preventDefault()
  controlSearch()
})
