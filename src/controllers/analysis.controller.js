
import consumptionAnalyzerService from "../services/analysis.service.js";

/**
 * Analyze consumption patterns
 * GET /api/consumption/analyze/:userId
 */
const analyzeConsumption = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const analysis = await consumptionAnalyzerService.analyzeUserConsumption(
      parseInt(userId),
      parseInt(days)
    );

    return res.status(200).json({
      success: true,
      message: 'Consumption analysis completed successfully',
      data: analysis
    });

  } catch (error) {
    console.error('Analyze Consumption Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze consumption patterns',
      error: error.message
    });
  }
};

/**
 * Get weekly trends
 * GET /api/consumption/trends/:userId
 */
const getWeeklyTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const trends = await consumptionAnalyzerService.getWeeklyTrends(
      parseInt(userId)
    );

    return res.status(200).json({
      success: true,
      message: 'Weekly trends fetched successfully',
      data: trends
    });

  } catch (error) {
    console.error('Get Weekly Trends Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly trends',
      error: error.message
    });
  }
};

/**
 * Detect waste prediction
 * GET /api/consumption/waste-prediction/:userId
 */
const predictWaste = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const wastePrediction = await consumptionAnalyzerService.predictWaste(
      parseInt(userId)
    );

    return res.status(200).json({
      success: true,
      message: 'Waste prediction completed successfully',
      data: wastePrediction
    });

  } catch (error) {
    console.error('Predict Waste Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to predict waste',
      error: error.message
    });
  }
};

/**
 * Get heatmap data
 * GET /api/consumption/heatmap/:userId
 */
const getHeatmapData = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const heatmapData = await consumptionAnalyzerService.generateHeatmapData(
      parseInt(userId)
    );

    return res.status(200).json({
      success: true,
      message: 'Heatmap data generated successfully',
      data: heatmapData
    });

  } catch (error) {
    console.error('Get Heatmap Data Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate heatmap data',
      error: error.message
    });
  }
};

/**
 * Get comprehensive insights with AI analysis
 * GET /api/consumption/insights/:userId
 */
const getComprehensiveInsights = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const insights = await consumptionAnalyzerService.getComprehensiveInsights(
      parseInt(userId)
    );

    return res.status(200).json({
      success: true,
      message: 'Comprehensive insights generated successfully',
      data: insights
    });

  } catch (error) {
    console.error('Get Comprehensive Insights Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate comprehensive insights',
      error: error.message
    });
  }
};

export default {
  analyzeConsumption,
  getWeeklyTrends,
  predictWaste,
  getHeatmapData,
  getComprehensiveInsights
};