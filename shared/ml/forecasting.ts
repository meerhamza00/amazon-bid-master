import type { Campaign } from "@shared/schema";

interface ForecastMetrics {
  spend: number;
  sales: number;
  acos: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
}

export function generateForecast(campaign: Campaign, daysAhead: number = 30): ForecastMetrics[] {
  const metrics = campaign.metrics;
  const forecasts: ForecastMetrics[] = [];
  
  // Generate daily forecasts
  for (let day = 1; day <= daysAhead; day++) {
    // Apply seasonal factors and trend analysis
    const seasonalFactor = 1 + Math.sin(2 * Math.PI * day / 30) * 0.1; // Monthly seasonality
    const trendFactor = 1 + (day / daysAhead) * 0.2; // Upward trend
    
    // Calculate core metrics with seasonality and trend
    const spend = metrics.spend * seasonalFactor * trendFactor;
    const impressions = metrics.impressions * seasonalFactor * trendFactor;
    const clicks = metrics.clicks * seasonalFactor * trendFactor;
    const sales = metrics.sales * seasonalFactor * trendFactor;
    
    // Calculate derived metrics
    const acos = (spend / sales) * 100;
    const roas = sales / spend;
    const ctr = (clicks / impressions) * 100;
    const cpc = spend / clicks;
    
    forecasts.push({
      spend,
      sales,
      acos,
      roas,
      impressions,
      clicks,
      ctr,
      cpc
    });
  }
  
  return forecasts;
}

export function calculateConfidenceInterval(forecasts: ForecastMetrics[]): {
  upper: ForecastMetrics,
  lower: ForecastMetrics
} {
  const confidenceFactor = 0.15; // 15% confidence interval
  
  const upper = {} as ForecastMetrics;
  const lower = {} as ForecastMetrics;
  
  Object.keys(forecasts[0]).forEach((key) => {
    const metric = key as keyof ForecastMetrics;
    const lastValue = forecasts[forecasts.length - 1][metric];
    upper[metric] = lastValue * (1 + confidenceFactor);
    lower[metric] = lastValue * (1 - confidenceFactor);
  });
  
  return { upper, lower };
}

export interface ForecastPoint {
  date: string;
  spend: number;
  sales: number;
  acos: number;
  roas: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
}

export interface CampaignForecast {
  historicalData: ForecastPoint[];
  forecasts: ForecastPoint[];
  confidenceInterval: {
    upper: ForecastPoint[];
    lower: ForecastPoint[];
  };
  metrics: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
  };
}

// Simple exponential smoothing forecast
function exponentialSmoothing(data: number[], alpha: number): number[] {
  const smoothed = [data[0]];
  for (let i = 1; i < data.length; i++) {
    smoothed[i] = alpha * data[i] + (1 - alpha) * smoothed[i - 1];
  }
  return smoothed;
}

// Generate forecast points
function generateForecastPoints(lastValue: number, periods: number, trend: number): number[] {
  const forecasts = [];
  let currentValue = lastValue;
  
  for (let i = 0; i < periods; i++) {
    currentValue = currentValue * (1 + trend);
    forecasts.push(currentValue);
  }
  
  return forecasts;
}

// Calculate confidence intervals
function calculateConfidenceIntervals(
  forecasts: number[],
  standardDeviation: number,
  periods: number, // Add periods parameter
  confidenceLevel: number = 0.95
): { upper: number[]; lower: number[] } {
  const zScore = 1.96; // 95% confidence level

  return {
    upper: forecasts.map((f, i) => {
      // Scale margin by period (i+1)
      const margin = zScore * standardDeviation * (i + 1) / periods;
      return f + margin;
    }),
    lower: forecasts.map((f, i) => {
      // Scale margin by period (i+1)
      const margin = zScore * standardDeviation * (i + 1) / periods;
      return Math.max(0, f - margin);
    })
  };
}

export function generateCampaignForecast(campaign: Campaign, daysToForecast: number = 14): CampaignForecast {
  const metrics = campaign.metrics;
  
  // Convert campaign metrics to time series
  const historicalData: ForecastPoint[] = Array(14).fill(null).map((_, i) => {
    const noise = 0.95 + Math.random() * 0.1; // random factor between 0.95 and 1.05
    return {
      date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0],
      spend: (metrics.spend / 14) * noise,
      sales: (metrics.sales / 14) * noise,
      acos: metrics.acos,
      roas: metrics.roas,
      impressions: (metrics.impressions / 14) * noise,
      clicks: (metrics.clicks / 14) * noise,
      ctr: metrics.ctr,
      cpc: metrics.cpc
    };
  });

  // Calculate trends
  const spendTrend = 0.02; // Assuming 2% daily growth
  const salesTrend = 0.025; // Assuming 2.5% daily growth
  const impressionsTrend = 0.015; // Assuming 1.5% daily growth for impressions
  const clicksTrend = 0.02; // Assuming 2% daily growth for clicks

  // Generate forecasts
  const futureSpend = generateForecastPoints(metrics.spend / 14, daysToForecast, spendTrend);
  const futureSales = generateForecastPoints(metrics.sales / 14, daysToForecast, salesTrend);
  const futureImpressions = generateForecastPoints(metrics.impressions / 14, daysToForecast, impressionsTrend);
  const futureClicks = generateForecastPoints(metrics.clicks / 14, daysToForecast, clicksTrend);

  // Generate forecast points
  const forecasts: ForecastPoint[] = Array(daysToForecast).fill(null).map((_, i) => {
    const spend = futureSpend[i];
    const sales = futureSales[i];
    const impressions = futureImpressions[i];
    const clicks = futureClicks[i];
    const ctr = (clicks / impressions) * 100;
    const cpc = spend / clicks;

    return {
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      spend,
      sales,
      acos: (spend / sales) * 100,
      roas: sales / spend,
      impressions,
      clicks,
      ctr,
      cpc
    };
  });

  // Calculate confidence intervals
  const spendStdDev = Math.sqrt(
    historicalData.reduce((acc, point) => 
      acc + Math.pow(point.spend - metrics.spend / 14, 2), 0) / historicalData.length
  );

  const salesStdDev = Math.sqrt(
    historicalData.reduce((acc, point) => 
      acc + Math.pow(point.sales - metrics.sales / 14, 2), 0) / historicalData.length
  );

  const impressionsStdDev = Math.sqrt(
    historicalData.reduce((acc, point) => 
      acc + Math.pow(point.impressions - metrics.impressions / 14, 2), 0) / historicalData.length
  );

  const clicksStdDev = Math.sqrt(
    historicalData.reduce((acc, point) => 
      acc + Math.pow(point.clicks - metrics.clicks / 14, 2), 0) / historicalData.length
  );


  const confidenceIntervals = {
    upper: forecasts.map((f, i) => ({
      ...f,
      spend: f.spend + 1.96 * spendStdDev,
      sales: f.sales + 1.96 * salesStdDev,
      impressions: f.impressions + 1.96 * impressionsStdDev,
      clicks: f.clicks + 1.96 * clicksStdDev,
      acos: ((f.spend + 1.96 * spendStdDev) / (f.sales + 1.96 * salesStdDev)) * 100,
      roas: (f.sales + 1.96 * salesStdDev) / (f.spend + 1.96 * spendStdDev),
      ctr: ((f.clicks + 1.96 * clicksStdDev) / (f.impressions + 1.96 * impressionsStdDev)) * 100,
      cpc: (f.spend + 1.96 * spendStdDev) / (f.clicks + 1.96 * clicksStdDev)
    })),
    lower: forecasts.map((f, i) => ({
      ...f,
      spend: Math.max(0, f.spend - 1.96 * spendStdDev),
      sales: Math.max(0, f.sales - 1.96 * salesStdDev),
      impressions: Math.max(0, f.impressions - 1.96 * impressionsStdDev),
      clicks: Math.max(0, f.clicks - 1.96 * clicksStdDev),
      acos: ((f.spend - 1.96 * spendStdDev) / (f.sales - 1.96 * salesStdDev)) * 100,
      roas: (f.sales - 1.96 * salesStdDev) / (f.spend - 1.96 * spendStdDev),
      ctr: ((f.clicks - 1.96 * clicksStdDev) / (f.impressions - 1.96 * impressionsStdDev)) * 100,
      cpc: (f.spend - 1.96 * spendStdDev) / (f.clicks - 1.96 * clicksStdDev)
    }))
  };

  // Calculate error metrics
  const mape = historicalData.reduce((acc, point, i) => 
    acc + Math.abs((point.spend - metrics.spend / 14) / (metrics.spend / 14)), 0) / historicalData.length * 100;

  const rmse = Math.sqrt(
    historicalData.reduce((acc, point) => 
      acc + Math.pow(point.spend - metrics.spend / 14, 2), 0) / historicalData.length
  );

  return {
    historicalData,
    forecasts,
    confidenceInterval: confidenceIntervals,
    metrics: {
      mape,
      rmse
    }
  };
}
