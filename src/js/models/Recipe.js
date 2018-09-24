import axios from 'axios';
import { proxy, key } from '../config';

export default class Recipe {
	constructor(id) {
		this.id = id;
	}

	async getRecipe() {
		try {
			const result = await axios(
				`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${
					this.id
				}`
			);
			this.title = result.data.recipe.title;
			this.author = result.data.recipe.publisher;
			this.img = result.data.recipe.image_url;
			this.url = result.data.recipe.source_url;
			this.ingredients = result.data.recipe.ingredients;
		} catch (error) {
			console.log(error);
			alert('Something went wrong :( ');
		}
	};

	/** Assuming that we need 15 minutes for each 3 ingredients */
	calcTime() {
		const numberIngredient = this.ingredients.length;
		const periods = Math.ceil(numberIngredient / 3);

		this.time = periods * 15;
	};

	calcServings() {
		this.servings = 4;
	};
	/**
	 * Ingredients array
	 *
	 * 1:   "4 cloves Garlic Cloves, Minced Or Pressed"
	 * 2:   "1/2 whole Medium Onion, Finely Diced"
	 * ........
	 *
	 * 5:   "Semolina flour OR cornmeal for dusting"
	 *
	 * */
	parseIngredients() {
		const unitsLong = [
			'tablespoons',
			'tablespoon',
			'teaspoons',
			'teaspoon',
			'ouces',
			'ouce',
			'pounds',
			'cups'
		];
		const unitsShort = [
			'tbsp',
			'tbsp',
			'tsp',
			'tsp',
			'oz',
			'oz',
			'pound',
			'cup'
		];
		const units = [...unitsShort, 'kg', 'g'];

		const newIngredients = this.ingredients.map(el => { // el = "1/2 whole Medium Onion, Finely Diced"
			// Uniform units
			let ingredient = el.toLowerCase(); // ingredient = "1/2 whole medium onion, finely diced"
			unitsLong.forEach((unit, i) => {
				ingredient = ingredient.replace(unit, units[i]); // ingredient = "1/2 whole medium onion, finely diced"
			});

			// Remove parentheses
			
			ingredient = ingredient.replace(/ *\([^)]*\) */g, ' '); // ingredient = "1/2 whole medium onion, finely diced"

			// Parse ingredients into count, unit and ingredient
			
			const arrIng = ingredient.split(' '); // -> arrIng = (6) ["1/2", "whole", "medium", "onion,", "finely", "diced"]
			const unitIndex = arrIng.findIndex(el2 => units.includes(el2)); // unitIndex = -1

			let objIng;
			if (unitIndex > -1) { 
				// There is a unit
				// Ex. 4 1/2 cups, arrCount is [4, 1/2] --> eval("4+1/2") --> 4.5
				// Ex. 4 cups, arrCount is [4]

				const arrCount = arrIng.slice(0, unitIndex);
				let count;
				if (arrCount.length === 1) {
					count = (eval(arrIng[0].replace('-', '+')));
				} else {
					count = eval(arrIng.slice(0, unitIndex).join('+'));
				}

				objIng = {
					count,
					unit: arrIng[unitIndex],
					ingredient: arrIng.slice(unitIndex + 1).join(' ')
				};
			} else if (parseInt(arrIng[0], 10)) { 
				// There is NO unit, but 1st element is number
				
				objIng = {
					count: parseInt(arrIng[0], 10),
					unit: '',
					ingredient: arrIng.slice(1).join(' ')
				};
			} else if (unitIndex === -1) { // unitIndex = -1
				// There is NO unit and NO number in 1st position
				
				objIng = { // objIng = {count: 1, unit: "", ingredient: "whole medium onion, finely diced"}
					count: 1,
					unit: '',
					ingredient
				};
			}

			return objIng;
		});

		this.ingredients = newIngredients;
	};

	updateServings (type) {
		// Servings
		const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

		// Ingredients
		this.ingredients.forEach(ing => {
			ing.count *= (newServings / this.servings);
		});

		this.servings = newServings;
	};
}
