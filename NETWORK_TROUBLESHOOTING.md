# Network & API Troubleshooting

## Open Food Facts API Issues

If you're experiencing timeout errors or connection issues with the food search:

### Common Issues and Solutions

#### 1. **Timeout Errors**
```
Error: timeout of 30000ms exceeded
```

**Possible Causes:**
- Slow internet connection
- Open Food Facts API is experiencing high load
- Firewall/proxy blocking the connection
- Network restrictions (corporate/school networks)

**Solutions:**
- Check your internet connection
- Try again in a few minutes (API may be busy)
- Check if you can access https://world.openfoodfacts.org in your browser
- Contact your network administrator if on corporate/school network

#### 2. **Connection Refused**
```
Error: ECONNREFUSED
```

**Solutions:**
- Verify internet connectivity
- Check firewall settings
- Ensure no VPN/proxy is blocking the connection

#### 3. **DNS Resolution Issues**
```
Error: ENOTFOUND
```

**Solutions:**
- Check DNS settings
- Try using Google DNS (8.8.8.8) or Cloudflare DNS (1.1.1.1)
- Restart your router/modem

### Offline Mode

The app now includes **offline fallback data** for popular foods. When the API is unavailable:

✅ You'll see a "📦 Offline Database" badge
✅ 12 common foods are available (chicken, eggs, rice, bananas, etc.)
✅ You can still log meals and track nutrition
✅ All nutrition data is accurate and sourced from USDA

**Offline Foods Included:**
1. Chicken Breast (Raw)
2. Banana
3. Brown Rice (Cooked)
4. Whole Eggs
5. Salmon (Raw)
6. Broccoli (Raw)
7. Sweet Potato
8. Greek Yogurt (Plain)
9. Oats (Dry)
10. Almonds
11. Apple
12. Whole Milk

### Testing API Connection

To test if you can reach the Open Food Facts API:

#### From Browser:
Visit: https://world.openfoodfacts.org/cgi/search.pl?search_terms=banana&json=1

You should see JSON data with product information.

#### From Command Line:
```bash
# Windows (PowerShell)
Invoke-WebRequest -Uri "https://world.openfoodfacts.org/cgi/search.pl?search_terms=banana&json=1"

# Linux/Mac
curl "https://world.openfoodfacts.org/cgi/search.pl?search_terms=banana&json=1"
```

### Timeout Settings

Current timeout settings in the app:
- **Food Search**: 30 seconds
- **Popular Foods**: 15 seconds
- **Barcode Lookup**: 30 seconds

These are reasonable values. If you're on a slow connection, searches may take time but should still work.

### Using Your Own Food Database (Advanced)

If you need consistent offline access, you can:

1. **Option A: Expand the fallback data**
   - Edit `server/controllers/foodSearchController.js`
   - Add more foods to the `FALLBACK_POPULAR_FOODS` array

2. **Option B: Set up a local Open Food Facts mirror**
   - Download the Open Food Facts database
   - Set up a local MongoDB instance
   - Update the API endpoint in the controller

3. **Option C: Use a different nutrition API**
   - USDA FoodData Central (free, US-focused)
   - Nutritionix API (paid)
   - Edamam API (freemium)

### Environment Variables

You can optionally set custom API endpoints:

Create a `.env` file:
```
FOOD_API_URL=https://world.openfoodfacts.org/cgi
FOOD_API_TIMEOUT=30000
```

Then update the controller to use these values.

### Performance Tips

To improve API response times:

1. **Be specific in searches**
   - ❌ "chicken" → Too broad, many results
   - ✅ "chicken breast raw" → Focused, faster

2. **Use barcodes when possible**
   - Barcode lookups are much faster than text searches

3. **Cache frequently used foods**
   - Save your favorite foods to the database
   - Create custom food entries

### Getting Help

If issues persist:

1. Check the server console logs for detailed error messages
2. Check browser console (F12) for client-side errors
3. Verify your `.env` configuration
4. Test API connectivity as described above

### API Status

Check Open Food Facts status:
- Website: https://world.openfoodfacts.org
- Status Page: https://status.openfoodfacts.org (if available)
- GitHub Issues: https://github.com/openfoodfacts/openfoodfacts-server/issues

### Alternative: Manual Food Entry

If API access is consistently unavailable, you can add a manual food entry feature:
- Allow users to enter food name and nutrition values manually
- Store in your database
- Build your own food library over time
