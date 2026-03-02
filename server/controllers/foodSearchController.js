const axios = require('axios');

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/cgi';

// @desc    Search for foods in Open Food Facts database
exports.searchFoods = async (req, res) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const response = await axios.get(`${OPENFOODFACTS_API}/search.pl`, {
      params: {
        search_terms: query,
        page: page,
        page_size: pageSize,
        json: 1,
        fields: 'code,product_name,brands,nutriments,serving_size,serving_quantity,quantity,image_url,nutriscore_grade'
      }
    });

    const products = (response.data.products || []).map(product => ({
      barcode: product.code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      imageUrl: product.image_url,
      nutriScore: product.nutriscore_grade,
      servingSize: product.serving_size,
      servingQuantity: product.serving_quantity,
      quantity: product.quantity,
      nutrition: {
        // Per 100g values
        caloriesPer100g: product.nutriments['energy-kcal_100g'] || product.nutriments.energy_100g / 4.184 || 0,
        proteinPer100g: product.nutriments.proteins_100g || 0,
        carbsPer100g: product.nutriments.carbohydrates_100g || 0,
        fatPer100g: product.nutriments.fat_100g || 0,
        fiberPer100g: product.nutriments.fiber_100g || 0,
        sugarPer100g: product.nutriments.sugars_100g || 0,
        sodiumPer100g: product.nutriments.sodium_100g || 0,
        saltPer100g: product.nutriments.salt_100g || 0,
        
        // Per serving values (if available)
        caloriesPerServing: product.nutriments['energy-kcal_serving'] || 0,
        proteinPerServing: product.nutriments.proteins_serving || 0,
        carbsPerServing: product.nutriments.carbohydrates_serving || 0,
        fatPerServing: product.nutriments.fat_serving || 0,
        fiberPerServing: product.nutriments.fiber_serving || 0,
      }
    }));

    res.json({
      products,
      count: response.data.count,
      page: response.data.page,
      pageSize: response.data.page_size,
      pageCount: response.data.page_count
    });
  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ message: 'Error searching for foods' });
  }
};

// @desc    Get detailed food info by barcode
exports.getFoodByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    const response = await axios.get(`${OPENFOODFACTS_API}/product/${barcode}.json`);

    if (response.data.status === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = response.data.product;

    res.json({
      barcode: product.code,
      name: product.product_name || 'Unknown Product',
      brand: product.brands || '',
      imageUrl: product.image_url,
      nutriScore: product.nutriscore_grade,
      servingSize: product.serving_size,
      servingQuantity: product.serving_quantity,
      quantity: product.quantity,
      ingredients: product.ingredients_text,
      allergens: product.allergens,
      nutrition: {
        // Per 100g values
        caloriesPer100g: product.nutriments['energy-kcal_100g'] || product.nutriments.energy_100g / 4.184 || 0,
        proteinPer100g: product.nutriments.proteins_100g || 0,
        carbsPer100g: product.nutriments.carbohydrates_100g || 0,
        fatPer100g: product.nutriments.fat_100g || 0,
        fiberPer100g: product.nutriments.fiber_100g || 0,
        sugarPer100g: product.nutriments.sugars_100g || 0,
        sodiumPer100g: product.nutriments.sodium_100g || 0,
        saltPer100g: product.nutriments.salt_100g || 0,
        saturatedFatPer100g: product.nutriments['saturated-fat_100g'] || 0,
        
        // Per serving values (if available)
        caloriesPerServing: product.nutriments['energy-kcal_serving'] || 0,
        proteinPerServing: product.nutriments.proteins_serving || 0,
        carbsPerServing: product.nutriments.carbohydrates_serving || 0,
        fatPerServing: product.nutriments.fat_serving || 0,
        fiberPerServing: product.nutriments.fiber_serving || 0,
      }
    });
  } catch (error) {
    console.error('Get food by barcode error:', error);
    res.status(500).json({ message: 'Error fetching food details' });
  }
};
