import { Campaign, Rule, Recommendation } from "@shared/schema";

function createRecommendation(campaign: Campaign, rule: Rule): Recommendation {
  // Placeholder recommendation logic - replace with actual logic
  const oldBid = parseFloat(campaign.budget); // Assuming budget is current bid
  let newBid = oldBid;

  switch (rule.action) {
    case "increase_bid":
      newBid += parseFloat(rule.adjustment.toString()); // Parse adjustment to number
      break;
    case "decrease_bid":
      newBid -= parseFloat(rule.adjustment.toString()); // Parse adjustment to number
      break;
    case "adjust_bid_percentage":
      newBid = oldBid * (1 + parseFloat(rule.adjustment.toString()) / 100); // Parse adjustment to number
      break;
    // Add other actions as needed
  }

  const justification = `Rule "${rule.name}" triggered. Action: ${rule.action}, Adjustment: ${rule.adjustment}`;

  return {
    campaignId: campaign.id,
    ruleId: rule.id,
    oldBid: oldBid.toString(),
    newBid: newBid.toString(),
    justification: justification,
    createdAt: new Date(), // Server-side timestamp
  } as Recommendation;
}


export function generateRecommendations(campaigns: Campaign[], rules: Rule[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const campaign of campaigns) {
    for (const rule of rules) {
      if (evaluateRule(campaign, rule)) {
        const recommendation = createRecommendation(campaign, rule);
        recommendations.push(recommendation);
      }
    }
  }

  return recommendations;
}

function evaluateRule(campaign: Campaign, rule: Rule): boolean {
  if (!rule.conditions) {
    return false;
  }
  for (const conditionGroup of rule.conditions) {
    if (!conditionGroup) continue; // Skip if conditionGroup is undefined
    let groupConditionMet = conditionGroup.operator === "AND" ? true : false;

    for (const condition of conditionGroup.conditions) {
      if (!condition) continue; // Skip if condition is undefined
      const metricValue = campaign.metrics[condition.metric as keyof Campaign["metrics"]];

      if (metricValue === undefined) {
        console.warn(\`Metric "\${condition.metric}" not found in campaign metrics.\`);
        continue; 
      }

      let conditionResult = false;

      switch (condition.operator) {
        case "greater_than":
          conditionResult = metricValue > condition.value;
          break;
        case "less_than":
          conditionResult = metricValue < condition.value;
          break;
        case "equal_to":
          conditionResult = metricValue === condition.value;
          break;
        case "not_equal_to":
          conditionResult = metricValue !== condition.value;
          break;
        case "between":
          conditionResult = condition.value2 !== undefined && metricValue >= condition.value && metricValue <= condition.value2;
          break;
        default:
          console.warn(\`Unknown operator: \${condition.operator}\`);
      }

      if (conditionGroup.operator === "AND") {
        groupConditionMet = groupConditionMet && conditionResult;
      } else { // OR
        groupConditionMet = groupConditionMet || conditionResult;
      }
    }

    if (groupConditionMet) {
      return true;
    }
  }
  return false;
}
