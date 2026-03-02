const axios = require('axios');

const OPENFOODFACTS_API = 'https://world.openfoodfacts.org/cgi';

// Fallback popular foods data for offline/timeout scenarios
const FALLBACK_POPULAR_FOODS = [
  {
    barcode: '0000000000000',
    name: 'Chicken Breast (Raw)',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0 }
  },
  {
    barcode: '0000000000001',
    name: 'Banana',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6 }
  },
  {
    barcode: '0000000000002',
    name: 'Brown Rice (Cooked)',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 24, fatPer100g: 0.9, fiberPer100g: 1.8 }
  },
  {
    barcode: '0000000000003',
    name: 'Whole Eggs',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0 }
  },
  {
    barcode: '0000000000004',
    name: 'Salmon (Raw)',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0 }
  },
  {
    barcode: '0000000000005',
    name: 'Broccoli (Raw)',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6 }
  },
  {
    barcode: '0000000000006',
    name: 'Sweet Potato',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 3 }
  },
  {
    barcode: '0000000000007',
    name: 'Greek Yogurt (Plain)',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0 }
  },
  {
    barcode: '0000000000008',
    name: 'Oats (Dry)',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, fiberPer100g: 11 }
  },
  {
    barcode: '0000000000009',
    name: 'Almonds',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12 }
  },
  {
    barcode: '0000000000010',
    name: 'Apple',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4 }
  },
  {
    barcode: '0000000000011',
    name: 'Whole Milk',
    brand: 'Generic',
    imageUrl: null,
    nutrition: { caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, fiberPer100g: 0 }
  }
];

// @desc    Search for foods in Open Food Facts database
exports.searchFoods = async (req, res) => {
  const { query, page = 1, pageSize = 20 } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const response = await axios.get(`${OPENFOODFACTS_API}/search.pl`, {
      params: {
        search_terms: query,
        page: page,
        page_size: pageSize,
        json: 1,
        fields: 'code,product_name,brands,nutriments,serving_size,serving_quantity,quantity,image_url,nutriscore_grade'
      },
      timeout: 30000, // Increased to 30 seconds
      headers: {
        'User-Agent': 'SynergyFit - Fitness Tracking App'
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
    console.error('Food search error:', error.message);
    
    // Fallback to offline search in FALLBACK_POPULAR_FOODS
    const searchLower = query.toLowerCase();
    const offlineResults = FALLBACK_POPULAR_FOODS.filter(food => 
      food.name.toLowerCase().includes(searchLower) || 
      food.brand.toLowerCase().includes(searchLower)
    );

    if (offlineResults.length > 0) {
      console.log(`API failed, returning ${offlineResults.length} offline search results for "${query}"`);
      return res.json({
        products: offlineResults,
        count: offlineResults.length,
        page: 1,
        pageSize: offlineResults.length,
        pageCount: 1,
        offline: true
      });
    }

    // If no offline matches either, return error
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(503).json({ 
        message: 'Unable to connect to food database and no offline results found. Please check your internet connection or try again later.' 
      });
    }
    res.status(500).json({ 
      message: 'Error searching for foods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get popular/common foods
exports.getPopularFoods = async (req, res) => {
  try {
    // Try to get foods from Open Food Facts
    const response = await axios.get(`${OPENFOODFACTS_API}/search.pl`, {
      params: {
        search_terms: 'chicken',
        page: 1,
        page_size: 12,
        json: 1,
        sort_by: 'popularity',
        fields: 'code,product_name,brands,nutriments,serving_size,serving_quantity,quantity,image_url,nutriscore_grade'
      },
      timeout: 15000, // 15 seconds for popular foods
      headers: {
        'User-Agent': 'SynergyFit - Fitness Tracking App'
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
        caloriesPer100g: product.nutriments['energy-kcal_100g'] || product.nutriments.energy_100g / 4.184 || 0,
        proteinPer100g: product.nutriments.proteins_100g || 0,
        carbsPer100g: product.nutriments.carbohydrates_100g || 0,
        fatPer100g: product.nutriments.fat_100g || 0,
        fiberPer100g: product.nutriments.fiber_100g || 0,
      }
    })).filter(p => p.nutrition.caloriesPer100g > 0);

    // If we got results, return them
    if (products.length > 0) {
      return res.json({ products });
    }
    
    // Otherwise use fallback
    console.log('Using fallback popular foods data');
    res.json({ products: FALLBACK_POPULAR_FOODS });
  } catch (error) {
    console.error('Get popular foods error:', error.message);
    // Always return fallback data on error - don't break the UI
    console.log('API error, using fallback popular foods data');
    res.json({ products: FALLBACK_POPULAR_FOODS });
  }
};

// @desc    Get detailed food info by barcode
exports.getFoodByBarcode = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }

    const response = await axios.get(`${OPENFOODFACTS_API}/product/${barcode}.json`, {
      timeout: 30000, // 30 seconds
      headers: {
        'User-Agent': 'SynergyFit - Fitness Tracking App'
      }
    });

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
    console.error('Get food by barcode error:', error.message);
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({ 
        message: 'Unable to connect to food database. Please check your internet connection.' 
      });
    }
    res.status(500).json({ 
      message: 'Error fetching food details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
