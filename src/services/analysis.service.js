// consumptionAnalyzer.service.js

import axios from 'axios'; 
import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

// Configuration
const config = {
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: process.env.OPENROUTER_API_KEY,
  model: 'deepseek/deepseek-chat',
  
  categoryPriorities: {
    'Vegetable': 10,
    'Fruit': 9,
    'Dairy': 7,
    'Meat': 6,
    'Drinks': 5,
    'Snacks': 3,
    'Fast_Food': 2
  },
  
  recommendedServings: {
    'Vegetable': 5,
    'Fruit': 3,
    'Dairy': 2,
    'Meat': 2,
    'Drinks': 8,
    'Snacks': 1,
    'Fast_Food': 0.5
  }
};

/**
 * Fetch consumption data from database using Prisma
 */
const fetchConsumptionData = async (userId, days = 30) => {
  try {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);
    
    // Query consumption table with Prisma
    const consumptionData = await prisma.consumption.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        id: 'desc'
      }
    });
    
    // If you have created_at field in consumption table, use this instead:
    // const consumptionData = await prisma.consumption.findMany({
    //   where: {
    //     user_id: userId,
    //     created_at: {
    //       gte: dateFrom
    //     }
    //   },
    //   orderBy: {
    //     created_at: 'desc'
    //   }
    // });
    
    return consumptionData;
  } catch (error) {
    console.error('Error fetching consumption data:', error);
    throw error;
  }
};

/**
 * Process raw consumption data and add timestamps
 */
const processConsumptionData = (rawData) => {
  const now = new Date();
  
  return rawData.map((item, index) => ({
    ...item,
    // If you add created_at to consumption table, use: timestamp: item.created_at
    // For now, simulate timestamps distributed over last 30 days
    timestamp: new Date(now.getTime() - ((rawData.length - index) * 86400000 / rawData.length))
  }));
};

/**
 * Generate weekly insights from data
 */
const generateWeeklyInsights = (weeklyData) => {
  const insights = [];
  const dayNames = Object.keys(weeklyData);
  const categoryPeaks = {};
  
  dayNames.forEach(day => {
    Object.keys(weeklyData[day]).forEach(category => {
      if (!categoryPeaks[category]) {
        categoryPeaks[category] = { day: day, quantity: 0 };
      }
      
      const quantity = weeklyData[day][category].totalQuantity;
      if (quantity > categoryPeaks[category].quantity) {
        categoryPeaks[category] = { day, quantity };
      }
    });
  });
  
  Object.keys(categoryPeaks).forEach(category => {
    insights.push({
      type: 'peak_day',
      category,
      day: categoryPeaks[category].day,
      message: `Highest ${category} consumption on ${categoryPeaks[category].day}s`
    });
  });
  
  return insights;
};

/**
 * Analyze weekly trends
 */
const getWeeklyTrends = async (userId) => {
  const data = await fetchConsumptionData(userId, 30);
  const processedData = processConsumptionData(data);
  
  const weeklyData = {
    Sunday: {},
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {}
  };
  
  const dayNames = Object.keys(weeklyData);
  
  processedData.forEach(item => {
    const dayIndex = new Date(item.timestamp).getDay();
    const dayName = dayNames[dayIndex];
    
    if (!weeklyData[dayName][item.category]) {
      weeklyData[dayName][item.category] = {
        totalQuantity: 0,
        totalCost: 0,
        count: 0
      };
    }
    
    weeklyData[dayName][item.category].totalQuantity += item.quantity;
    weeklyData[dayName][item.category].totalCost += item.cost;
    weeklyData[dayName][item.category].count += 1;
  });
  
  // Calculate averages
  Object.keys(weeklyData).forEach(day => {
    Object.keys(weeklyData[day]).forEach(category => {
      const stats = weeklyData[day][category];
      stats.avgQuantity = parseFloat((stats.totalQuantity / stats.count).toFixed(2));
      stats.avgCost = parseFloat((stats.totalCost / stats.count).toFixed(2));
    });
  });
  
  return {
    weeklyBreakdown: weeklyData,
    insights: generateWeeklyInsights(weeklyData)
  };
};

/**
 * Detect over/under consumption patterns
 */
const detectConsumptionPatterns = (data) => {
  const processedData = processConsumptionData(data);
  const categoryTotals = {};
  const totalDays = 30;
  
  processedData.forEach(item => {
    if (!categoryTotals[item.category]) {
      categoryTotals[item.category] = 0;
    }
    categoryTotals[item.category] += item.quantity;
  });
  
  const patterns = {
    overConsumption: [],
    underConsumption: [],
    balanced: []
  };
  
  Object.keys(config.recommendedServings).forEach(category => {
    const actual = (categoryTotals[category] || 0) / totalDays;
    const recommended = config.recommendedServings[category];
    const ratio = actual / recommended;
    
    const pattern = {
      category,
      dailyAverage: parseFloat(actual.toFixed(2)),
      recommended: recommended,
      ratio: parseFloat(ratio.toFixed(2)),
      status: ''
    };
    
    if (ratio > 1.5) {
      pattern.status = 'Over-consuming';
      pattern.severity = ratio > 2 ? 'high' : 'medium';
      patterns.overConsumption.push(pattern);
    } else if (ratio < 0.5) {
      pattern.status = 'Under-consuming';
      pattern.severity = ratio < 0.3 ? 'high' : 'medium';
      patterns.underConsumption.push(pattern);
    } else {
      pattern.status = 'Balanced';
      patterns.balanced.push(pattern);
    }
  });
  
  return patterns;
};

/**
 * Predict waste based on consumption patterns
 */
const predictWaste = async (userId) => {
  const data = await fetchConsumptionData(userId, 30);
  const processedData = processConsumptionData(data);
  
  const itemVelocity = {};
  
  processedData.forEach(item => {
    const key = `${item.food_item_id}_${item.category}`;
    if (!itemVelocity[key]) {
      itemVelocity[key] = {
        food_item_id: item.food_item_id,
        category: item.category,
        totalQuantity: 0,
        purchases: [],
        lastPurchase: null
      };
    }
    
    itemVelocity[key].totalQuantity += item.quantity;
    itemVelocity[key].purchases.push({
      quantity: item.quantity,
      date: item.timestamp
    });
    
    if (!itemVelocity[key].lastPurchase || 
        new Date(item.timestamp) > new Date(itemVelocity[key].lastPurchase)) {
      itemVelocity[key].lastPurchase = item.timestamp;
    }
  });
  
  const predictions = [];
  const now = new Date();
  
  Object.values(itemVelocity).forEach(item => {
    const avgQuantity = item.totalQuantity / item.purchases.length;
    const daysSinceLastPurchase = (now - new Date(item.lastPurchase)) / (1000 * 60 * 60 * 24);
    
    // Predict waste based on patterns
    if (avgQuantity > 5 && daysSinceLastPurchase > 7) {
      predictions.push({
        food_item_id: item.food_item_id,
        category: item.category,
        riskLevel: daysSinceLastPurchase > 14 ? 'high' : 'medium',
        daysUntilWaste: Math.max(3, Math.floor(10 - daysSinceLastPurchase)),
        recommendation: 'Consider consuming or freezing soon',
        avgPurchaseQuantity: parseFloat(avgQuantity.toFixed(2)),
        daysSinceLastPurchase: parseInt(daysSinceLastPurchase)
      });
    }
  });
  
  predictions.sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 };
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
  });
  
  return {
    totalItemsAtRisk: predictions.length,
    predictions: predictions.slice(0, 10),
    summary: {
      highRisk: predictions.filter(p => p.riskLevel === 'high').length,
      mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length
    }
  };
};

/**
 * Generate heatmap data for visualization
 */
const generateHeatmapData = async (userId) => {
  const data = await fetchConsumptionData(userId, 30);
  const processedData = processConsumptionData(data);
  
  const categoryHeatmaps = {};
  const categories = [...new Set(processedData.map(item => item.category))];
  
  categories.forEach(category => {
    categoryHeatmaps[category] = Array(7).fill(null).map(() => Array(4).fill(0));
  });
  
  processedData.forEach(item => {
    const date = new Date(item.timestamp);
    const dayOfWeek = date.getDay();
    const weekOfMonth = Math.floor((date.getDate() - 1) / 7);
    
    if (weekOfMonth < 4 && categoryHeatmaps[item.category]) {
      categoryHeatmaps[item.category][dayOfWeek][weekOfMonth] += item.quantity;
    }
  });
  
  Object.keys(categoryHeatmaps).forEach(category => {
    const maxValue = Math.max(...categoryHeatmaps[category].flat());
    categoryHeatmaps[category] = categoryHeatmaps[category].map(week =>
      week.map(day => maxValue > 0 ? parseFloat((day / maxValue).toFixed(2)) : 0)
    );
  });
  
  return {
    heatmaps: categoryHeatmaps,
    metadata: {
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weeks: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      categories: categories
    }
  };
};

/**
 * Call OpenRouter DeepSeek API for AI insights
 */
const callDeepSeekAPI = async (prompt, data) => {
  try {
    const response = await axios.post(
      config.apiUrl,
      {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition and consumption pattern analyst. Provide clear, actionable insights based on user food consumption data. Be concise and specific. Format your response in clear sections with bullet points.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nData: ${JSON.stringify(data, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://your-app-url.com',
          'X-Title': 'Consumption Pattern Analyzer'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    throw new Error('Failed to get AI insights: ' + (error.response?.data?.error?.message || error.message));
  }
};

/**
 * Get category breakdown statistics
 */
const getCategoryBreakdown = (data) => {
  const breakdown = {};
  
  data.forEach(item => {
    if (!breakdown[item.category]) {
      breakdown[item.category] = {
        totalQuantity: 0,
        totalCost: 0,
        itemCount: 0,
        uniqueItems: new Set()
      };
    }
    
    breakdown[item.category].totalQuantity += item.quantity;
    breakdown[item.category].totalCost += item.cost;
    breakdown[item.category].itemCount += 1;
    breakdown[item.category].uniqueItems.add(item.food_item_id);
  });
  
  Object.keys(breakdown).forEach(category => {
    breakdown[category].uniqueItemCount = breakdown[category].uniqueItems.size;
    delete breakdown[category].uniqueItems;
    breakdown[category].avgCost = parseFloat(
      (breakdown[category].totalCost / breakdown[category].itemCount).toFixed(2)
    );
    breakdown[category].avgQuantity = parseFloat(
      (breakdown[category].totalQuantity / breakdown[category].itemCount).toFixed(2)
    );
  });
  
  return breakdown;
};

/**
 * Generate recommendations based on consumption patterns
 */
const generateRecommendations = (data) => {
  const recommendations = [];
  const patterns = detectConsumptionPatterns(data);
  
  // Under-consumption recommendations
  patterns.underConsumption.forEach(pattern => {
    if (pattern.severity === 'high') {
      recommendations.push({
        type: 'health',
        priority: 'high',
        category: pattern.category,
        message: `Increase ${pattern.category} intake. Currently at ${pattern.dailyAverage} servings/day, recommended is ${pattern.recommended}.`
      });
    }
  });
  
  // Over-consumption recommendations
  patterns.overConsumption.forEach(pattern => {
    if (pattern.category === 'Fast_Food' || pattern.category === 'Snacks') {
      recommendations.push({
        type: 'health',
        priority: pattern.severity,
        category: pattern.category,
        message: `Reduce ${pattern.category} consumption. Currently at ${pattern.dailyAverage} servings/day, recommended is ${pattern.recommended}.`
      });
    }
  });
  
  // Cost recommendations
  const totalCost = data.reduce((sum, item) => sum + item.cost, 0);
  const avgDailyCost = totalCost / 30;
  
  if (avgDailyCost > 500) {
    recommendations.push({
      type: 'cost',
      priority: 'medium',
      message: `High daily food cost (${avgDailyCost.toFixed(2)}). Consider meal planning and bulk buying.`
    });
  }
  
  // Variety recommendations
  const categoryBreakdown = getCategoryBreakdown(data);
  const activeCategories = Object.keys(categoryBreakdown).length;
  
  if (activeCategories < 4) {
    recommendations.push({
      type: 'variety',
      priority: 'medium',
      message: `Low food variety detected. Consider adding more diverse food categories to your diet.`
    });
  }
  
  return recommendations;
};

/**
 * Get comprehensive insights with AI analysis
 */
const getComprehensiveInsights = async (userId) => {
  const data = await fetchConsumptionData(userId, 30);
  
  if (!data || data.length === 0) {
    return {
      message: 'No consumption data available for analysis',
      hasData: false
    };
  }
  
  const weeklyTrends = await getWeeklyTrends(userId);
  const consumptionPatterns = detectConsumptionPatterns(data);
  const wastePrediction = await predictWaste(userId);
  const heatmapData = await generateHeatmapData(userId);
  const categoryBreakdown = getCategoryBreakdown(data);
  
  const summary = {
    totalItems: data.length,
    totalCost: data.reduce((sum, item) => sum + item.cost, 0),
    avgDailyCost: parseFloat((data.reduce((sum, item) => sum + item.cost, 0) / 30).toFixed(2)),
    categories: [...new Set(data.map(item => item.category))],
    categoryBreakdown,
    topCategories: Object.entries(categoryBreakdown)
      .sort((a, b) => b[1].totalQuantity - a[1].totalQuantity)
      .slice(0, 3)
      .map(([cat, data]) => ({ category: cat, quantity: data.totalQuantity })),
    weeklyTrends: weeklyTrends.insights,
    consumptionPatterns,
    wastePrediction: wastePrediction.summary
  };
  
  let aiInsights = null;
  
  // Try to get AI insights, but don't fail if API is unavailable
  try {
    aiInsights = await callDeepSeekAPI(
      `Analyze this user's food consumption patterns and provide:
      1. Key health concerns or positive patterns
      2. Specific recommendations to improve diet balance
      3. Cost optimization suggestions
      4. Waste reduction strategies
      Keep it actionable and specific to their data.`,
      summary
    );
  } catch (error) {
    console.error('Failed to get AI insights:', error.message);
    aiInsights = 'AI insights temporarily unavailable. Basic analysis provided in other sections.';
  }
  
  return {
    summary,
    weeklyTrends,
    consumptionPatterns,
    wastePrediction,
    heatmapData,
    aiInsights,
    recommendations: generateRecommendations(data),
    timestamp: new Date().toISOString()
  };
};

/**
 * Main analysis function
 */
const analyzeUserConsumption = async (userId, days = 30) => {
  const data = await fetchConsumptionData(userId, days);
  
  if (!data || data.length === 0) {
    return {
      message: 'No consumption data available for analysis',
      hasData: false
    };
  }
  
  const analysis = {
    overview: {
      totalRecords: data.length,
      totalCost: data.reduce((sum, item) => sum + item.cost, 0),
      totalQuantity: data.reduce((sum, item) => sum + item.quantity, 0),
      avgDailyCost: parseFloat((data.reduce((sum, item) => sum + item.cost, 0) / days).toFixed(2)),
      avgDailyQuantity: parseFloat((data.reduce((sum, item) => sum + item.quantity, 0) / days).toFixed(2)),
      dateRange: {
        from: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
      }
    },
    categoryBreakdown: getCategoryBreakdown(data),
    consumptionPatterns: detectConsumptionPatterns(data),
    weeklyTrends: await getWeeklyTrends(userId),
    wastePrediction: await predictWaste(userId),
    recommendations: generateRecommendations(data)
  };
  
  return analysis;
};

export default {
  analyzeUserConsumption,
  getWeeklyTrends,
  predictWaste,
  generateHeatmapData,
  getComprehensiveInsights,
  fetchConsumptionData,
  detectConsumptionPatterns,
  getCategoryBreakdown
};