// const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
/*******************************************************************************
* RECIPE MODEL
*******************************************************************************/
import axios from 'axios'

export default class Recipe {
  constructor(id) {
    this.id = id
  }

  async getRecipe() {
    try {
      const result = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`)

      this.title = result.data.recipe.title
      this.author = result.data.recipe.publisher
      this.image = result.data.recipe.image_url
      this.url = result.data.recipe.source_url
      this.ingredients = result.data.recipe.ingredients
    } catch (error) {
      alert(`Caught ${error}`)
    }
  }

  // We're assuming we need 15 minutes for every 3 ingredients
  calcCookingTime() {
    const numIng = this.ingredients.length
    const periods = Math.ceil(numIng / 3)
    this.cookingTime = periods * 15
  }

  calcServings() {
    this.servings = 4
  }

  parseIngredients() {
    const unitsLong = ['tablespoons', 'tablespoon',
      'ounces', 'ounce',
      'teaspoons', 'teaspoon',
      'cups',
      'pounds'
    ]
    const unitsShort = ['tbsp', 'tbsp',
      'oz', 'oz',
      'tsp', 'tsp',
      'cup',
      'lb'
    ]
    const units = [...unitsShort, 'kg', 'g']

    const newIngredients = this.ingredients.map(element => {
      // 1. Uniform units
      let ingredient = element.toLowerCase()
      unitsLong.forEach((unit, i) => {
        ingredient = ingredient.replace(unit, units[i])
      })

      // 2. Remove text inside parentheses, brackets and braces
      ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ')

      // 3. Parse ingredients into count, unit and ingredient
      const ingArray = ingredient.split(' ')
      const unitIndex = ingArray.findIndex(word => units.includes(word))

      let ingObject
      if (unitIndex > -1) {
        // A unit is found
        const amtArray = ingArray.slice(0, unitIndex)
        let amount
        if (amtArray.length === 1) {
          amount = eval(amtArray[0].replace('-', '+'))
        } else {
          amount = eval(ingArray.slice(0, unitIndex).join('+'))
        }

        ingObject = {
          amount,
          unit: ingArray[unitIndex],
          ingredient: ingArray.slice(unitIndex + 1).join()
        }
      } else if (parseInt(ingArray[0], 10)) {
        // NO unit but first element is a number
        ingObject = {
          amount: parseInt(ingArray[0], 10),
          unit: '',
          ingredient: ingArray.slice(1).join()
        }
      } else if (unitIndex === -1) {
        // There is NO unit and NO number in the first element
        ingObject = {
          amount: 1,
          unit: '',
          ingredient
        }
      }

      return ingObject
    })
    this.ingredients = newIngredients
  }

  // "type" -- will be "inc" or "dec"
  updateServings(type) {
    // 1. Update the servings
    const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1

    // 2. Update the ingredients
    this.ingredients.forEach(ing => {
      ing.amount *= newServings / this.servings
    })

    this.servings = newServings
  }
}
