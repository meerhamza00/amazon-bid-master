export interface Rule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  justification: string;
  generateJustification(): string;
}

export interface RuleCondition {
  metric: string;
  operator: Operator;
  threshold: number;
}

export enum Operator {
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",
  GREATER_THAN_OR_EQUAL_TO = "GREATER_THAN_OR_EQUAL_TO",
  LESS_THAN_OR_EQUAL_TO = "LESS_THAN_OR_EQUAL_TO",
  EQUAL_TO = "EQUAL_TO",
  NOT_EQUAL_TO = "NOT_EQUAL_TO",
}

export interface RuleAction {
  type: ActionType;
  bidAdjustment?: number; // e.g., percentage adjustment
}

export enum ActionType {
  ADJUST_BID = "ADJUST_BID",
  // You can add more action types later, e.g., NOTIFY, PAUSE_CAMPAIGN
}

// Example Rule Templates (can be expanded)

export class ACOSBasedRule implements Rule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  justification: string;

  constructor(id: string, name: string, conditions: RuleCondition[], actions: RuleAction[], isActive = true, description?: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = isActive;
    this.conditions = conditions;
    this.actions = actions;
    this.justification = this.generateJustification();
  }

  generateJustification(): string {
    let justification = `Rule '${this.name}' triggered. `;
    this.conditions.forEach(condition => {
      justification += `ACOS is ${Operator[condition.operator].replace(/_/g, ' ').toLowerCase()} ${condition.threshold}. `;
    });
    this.actions.forEach(action => {
      if (action.type === ActionType.ADJUST_BID && action.bidAdjustment !== undefined) {
        const adjustmentPercentage = action.bidAdjustment * 100;
        justification += `Action: Decrease bid by ${adjustmentPercentage.toFixed(0)}%.`;
      }
    });
    return justification;
  }
}

export class ROASBasedRule implements Rule {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    conditions: RuleCondition[];
    actions: RuleAction[];
    justification: string;

    constructor(id: string, name: string, conditions: RuleCondition[], actions: RuleAction[], isActive = true, description?: string) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.isActive = isActive;
      this.conditions = conditions;
      this.actions = actions;
      this.justification = this.generateJustification();
    }

    generateJustification(): string {
      let justification = `Rule '${this.name}' triggered. `;
      this.conditions.forEach(condition => {
        justification += `ROAS is ${Operator[condition.operator].replace(/_/g, ' ').toLowerCase()} ${condition.threshold}. `;
      });
      this.actions.forEach(action => {
        if (action.type === ActionType.ADJUST_BID && action.bidAdjustment !== undefined) {
          const adjustmentPercentage = action.bidAdjustment * 100;
          justification += `Action: Decrease bid by ${adjustmentPercentage.toFixed(0)}%.`;
        }
      });
      return justification;
  }
}

export class TestRule implements Rule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  justification: string;

  constructor(id: string, name: string, actions: RuleAction[], isActive = true, description?: string) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = isActive;
    this.conditions = []; // No conditions, always triggers
    this.actions = actions;
    this.justification = this.generateJustification();
  }

  generateJustification(): string {
    let justification = `Rule '${this.name}' triggered. Always triggers for testing. `;
    this.actions.forEach(action => {
      if (action.type === ActionType.ADJUST_BID && action.bidAdjustment !== undefined) {
        const adjustmentPercentage = action.bidAdjustment * 100;
        justification += `Action: Increase bid by ${adjustmentPercentage.toFixed(0)}%.`;
      }
    });
    return justification;
  }
}


// Add more rule templates as needed (e.g., ConversionRateBasedRule, CPCBasedRule)
