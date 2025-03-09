import { Rule, RuleCondition, RuleAction, Operator, ActionType, ACOSBasedRule, ROASBasedRule } from '../../../shared/rules/rule-templates';

interface RuleWithJustification extends Rule {
  generateJustification(): string;
}

export class RuleEngine {
  private rules: RuleWithJustification[] = []; // Initially store rules in memory

  constructor() {
    // In a real application, rules might be loaded from a database or config file
    this.loadRules();
  }

  private loadRules(): void {
    // Example: Load some predefined rules (replace with actual loading logic)
    this.rules = [
      new ACOSBasedRule(
        'rule1',
        'High ACOS Rule',
        [{ metric: 'acos', operator: Operator.GREATER_THAN, threshold: 0.4 }],
        [{ type: ActionType.ADJUST_BID, bidAdjustment: -0.05 }],
        true,
        'Adjust bid if ACOS is too high'
      ),
      new ROASBasedRule(
        'rule2',
        'Low ROAS Rule',
        [{ metric: 'roas', operator: Operator.LESS_THAN, threshold: 2.0 }],
        [{ type: ActionType.ADJUST_BID, bidAdjustment: -0.03 }],
        true,
        'Adjust bid if ROAS is too low'
      ),
      // Add more predefined rules here
    ];
  }

  public evaluateRules(performanceData: any): Rule[] {
    const triggeredRules: Rule[] = [];
    for (const rule of this.rules) {
      if (rule.isActive && this.isRuleTriggered(rule, performanceData)) {
        triggeredRules.push(rule);
      }
    }
    return triggeredRules;
  }

  private isRuleTriggered(rule: Rule, performanceData: any): boolean {
    for (const condition of rule.conditions) {
      const metricValue = performanceData[condition.metric]; // Assumes performanceData has metrics like 'acos', 'roas'
      if (metricValue === undefined) {
        console.warn(`Metric '${condition.metric}' not found in performance data.`);
        return false; // Skip rule if metric is missing
      }

      if (!this.checkCondition(metricValue, condition.operator, condition.threshold)) {
        return false; // If any condition fails, rule is not triggered
      }
    }
    return true; // All conditions met, rule is triggered
  }

  private checkCondition(metricValue: number, operator: Operator, threshold: number): boolean {
    switch (operator) {
      case Operator.GREATER_THAN:
        return metricValue > threshold;
      case Operator.LESS_THAN:
        return metricValue < threshold;
      case Operator.GREATER_THAN_OR_EQUAL_TO:
        return metricValue >= threshold;
      case Operator.LESS_THAN_OR_EQUAL_TO:
        return metricValue <= threshold;
      case Operator.EQUAL_TO:
        return metricValue === threshold;
      case Operator.NOT_EQUAL_TO:
        return metricValue !== threshold;
      default:
        return false;
    }
  }

  public applyActions(triggeredRules: RuleWithJustification[]): BidRecommendation[] {
    const recommendations: BidRecommendation[] = [];
    for (const rule of triggeredRules) {
      rule.actions.forEach(action => {
        if (action.type === ActionType.ADJUST_BID && action.bidAdjustment !== undefined) {
          recommendations.push({
            ruleId: rule.id,
            bidAdjustment: action.bidAdjustment,
            justification: rule.generateJustification() // Generate justification when applying action
          });
        }
        // Handle other action types if added later
      });
    }
    return recommendations;
  }
}

export interface BidRecommendation {
  ruleId: string;
  bidAdjustment: number;
  justification: string;
}
