// Search path: https://forkify-api.herokuapp.com/api/search
// Get path: https://forkify-api.herokuapp.com/api/get

// const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`);
/*******************************************************************************
* SEARCH MODEL
*******************************************************************************/

import axios from 'axios'

export default class Search {
  constructor(query) {
    this.query = query
  }

  async getResults() {
    try {
      const res = await axios(`https://forkify-api.herokuapp.com/api/search?&q=${this.query}`)
      this.result = res.data.recipes
      // console.log(this.result)
    } catch (error) {
      alert(`Caught ${error}`)
    }
  }
}
