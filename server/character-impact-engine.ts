/**
 * Character Impact Calculation Engine
 * 
 * This module translates character personality traits into mechanical effects
 * that influence the simulation. When you change a character's personality,
 * these calculations automatically ripple through:
 * - Decision difficulty modifiers
 * - Stakeholder satisfaction thresholds
 * - Essay grading context
 * - Voicemail trigger sensitivity
 * - Phone-a-Friend advice quality
 */

// Impact categories that characters can affect
export type ImpactCategory = 
  | "labor" 
  | "finance" 
  | "technology" 
  | "culture" 
  | "operations" 
  | "strategy" 
  | "legal" 
  | "marketing" 
  | "executive" 
  | "external";

// Character trait profile
export interface CharacterTraits {
  influence: number;      // 1-10: How much sway they have
  hostility: number;      // 1-10: How antagonistic they are
  flexibility: number;    // 1-10: How open to change
  riskTolerance: number;  // 1-10: Comfort with uncertainty
  impactCategories: ImpactCategory[];
}

// Calculated impact for a decision category
export interface CategoryImpact {
  category: ImpactCategory;
  difficultyModifier: number;      // Multiplier for decision difficulty (0.5 - 2.0)
  stakeholderSensitivity: number;  // How carefully this stakeholder must be considered
  conflictPotential: number;       // Likelihood of pushback (0-1)
  characterContext: string;        // Narrative context for LLM grading
}

// Full impact calculation result
export interface SimulationImpact {
  categoryImpacts: Map<ImpactCategory, CategoryImpact>;
  overallDifficulty: number;       // Average difficulty modifier
  stakeholderComplexity: number;   // Number of high-influence stakeholders
  llmGradingContext: string;       // Context to inject into essay grading
  voicemailSensitivity: number;    // Threshold for triggering voicemails
}

/**
 * Calculate the impact of a single character on a specific category
 */
export function calculateCharacterCategoryImpact(
  character: { name: string; role: string } & CharacterTraits,
  category: ImpactCategory
): CategoryImpact {
  // Base difficulty modifier from hostility and influence
  // High hostility + high influence = harder decisions
  const hostilityFactor = (character.hostility - 5) / 5; // -1 to 1
  const influenceFactor = character.influence / 10;       // 0 to 1
  
  // Difficulty ranges from 0.7 (easy) to 1.5 (hard)
  const difficultyModifier = 1.0 + (hostilityFactor * influenceFactor * 0.5);
  
  // Stakeholder sensitivity based on influence and hostility
  // High influence characters must always be considered
  const stakeholderSensitivity = (character.influence * 0.7 + character.hostility * 0.3) / 10;
  
  // Conflict potential: high hostility + low flexibility = high conflict
  const conflictPotential = (character.hostility / 10) * ((10 - character.flexibility) / 10);
  
  // Generate narrative context for LLM grading
  const characterContext = generateCharacterContext(character, category);
  
  return {
    category,
    difficultyModifier: Math.max(0.5, Math.min(2.0, difficultyModifier)),
    stakeholderSensitivity: Math.max(0, Math.min(1, stakeholderSensitivity)),
    conflictPotential: Math.max(0, Math.min(1, conflictPotential)),
    characterContext,
  };
}

/**
 * Generate narrative context for LLM essay grading
 */
function generateCharacterContext(
  character: { name: string; role: string } & CharacterTraits,
  category: ImpactCategory
): string {
  const hostilityDesc = character.hostility >= 7 ? "highly resistant" :
                        character.hostility >= 5 ? "cautiously skeptical" :
                        character.hostility >= 3 ? "relatively open" : "very supportive";
  
  const influenceDesc = character.influence >= 8 ? "extremely influential" :
                        character.influence >= 6 ? "significant authority" :
                        character.influence >= 4 ? "moderate influence" : "limited direct power";
  
  const flexibilityDesc = character.flexibility >= 7 ? "adaptable and open to new approaches" :
                          character.flexibility >= 5 ? "willing to consider alternatives" :
                          character.flexibility >= 3 ? "prefers established methods" : "strongly resists change";
  
  return `${character.name} (${character.role}) has ${influenceDesc} over ${category} decisions. ` +
         `They are ${hostilityDesc} to changes and ${flexibilityDesc}. ` +
         `Student responses should demonstrate awareness of this stakeholder's perspective.`;
}

/**
 * Calculate combined simulation impact from all characters
 */
export function calculateSimulationImpact(
  characters: Array<{ name: string; role: string } & CharacterTraits>
): SimulationImpact {
  const categoryImpacts = new Map<ImpactCategory, CategoryImpact>();
  const allCategories: ImpactCategory[] = [
    "labor", "finance", "technology", "culture", "operations",
    "strategy", "legal", "marketing", "executive", "external"
  ];
  
  // Calculate aggregate impact for each category
  for (const category of allCategories) {
    // Find all characters that impact this category
    const relevantCharacters = characters.filter(
      c => c.impactCategories?.includes(category)
    );
    
    if (relevantCharacters.length === 0) {
      // No characters affect this category - use neutral defaults
      categoryImpacts.set(category, {
        category,
        difficultyModifier: 1.0,
        stakeholderSensitivity: 0.3,
        conflictPotential: 0.2,
        characterContext: `No specific stakeholders have strong opinions on ${category} decisions.`,
      });
      continue;
    }
    
    // Calculate combined impact from all relevant characters
    const impacts = relevantCharacters.map(c => calculateCharacterCategoryImpact(c, category));
    
    // Aggregate: use max difficulty, average sensitivity, max conflict
    const aggregatedImpact: CategoryImpact = {
      category,
      difficultyModifier: Math.max(...impacts.map(i => i.difficultyModifier)),
      stakeholderSensitivity: impacts.reduce((sum, i) => sum + i.stakeholderSensitivity, 0) / impacts.length,
      conflictPotential: Math.max(...impacts.map(i => i.conflictPotential)),
      characterContext: impacts.map(i => i.characterContext).join("\n\n"),
    };
    
    categoryImpacts.set(category, aggregatedImpact);
  }
  
  // Calculate overall metrics
  const allImpacts = Array.from(categoryImpacts.values());
  const overallDifficulty = allImpacts.reduce((sum, i) => sum + i.difficultyModifier, 0) / allImpacts.length;
  
  // Count high-influence stakeholders (influence >= 7)
  const stakeholderComplexity = characters.filter(c => c.influence >= 7).length;
  
  // Generate combined LLM grading context
  const llmGradingContext = generateLLMGradingContext(characters);
  
  // Calculate voicemail trigger sensitivity (more hostile characters = more sensitive triggers)
  const avgHostility = characters.reduce((sum, c) => sum + c.hostility, 0) / characters.length;
  const voicemailSensitivity = avgHostility / 10;
  
  return {
    categoryImpacts,
    overallDifficulty,
    stakeholderComplexity,
    llmGradingContext,
    voicemailSensitivity,
  };
}

/**
 * Generate comprehensive LLM grading context from all characters
 */
function generateLLMGradingContext(
  characters: Array<{ name: string; role: string } & CharacterTraits>
): string {
  if (characters.length === 0) {
    return "Consider general stakeholder perspectives when evaluating responses.";
  }
  
  const sortedByInfluence = [...characters].sort((a, b) => b.influence - a.influence);
  const topStakeholders = sortedByInfluence.slice(0, 5); // Top 5 most influential
  
  const stakeholderDescriptions = topStakeholders.map(c => {
    const stance = c.hostility >= 7 ? "likely to oppose" :
                   c.hostility >= 5 ? "cautiously watching" :
                   c.hostility >= 3 ? "potentially supportive" : "generally supportive of";
    
    return `- ${c.name} (${c.role}): ${stance} changes that affect their domain`;
  }).join("\n");
  
  return `STAKEHOLDER CONTEXT FOR GRADING:
The following key stakeholders should be considered when evaluating student responses:

${stakeholderDescriptions}

When scoring "Stakeholder Consideration" (25 points), assess whether the student:
- Acknowledges perspectives of high-influence stakeholders
- Addresses concerns of hostile/resistant stakeholders
- Demonstrates understanding of stakeholder relationships and dynamics`;
}

/**
 * Calculate difficulty modifier for a specific decision based on its category
 */
export function getDecisionDifficultyModifier(
  simulationImpact: SimulationImpact,
  decisionCategories: ImpactCategory[]
): number {
  if (decisionCategories.length === 0) return 1.0;
  
  const modifiers = decisionCategories.map(cat => {
    const impact = simulationImpact.categoryImpacts.get(cat);
    return impact?.difficultyModifier ?? 1.0;
  });
  
  // Return the maximum difficulty modifier (hardest stakeholder wins)
  return Math.max(...modifiers);
}

/**
 * Get stakeholder context for Phone-a-Friend advice
 */
export function getPhoneAFriendContext(
  characters: Array<{ name: string; role: string } & CharacterTraits>,
  advisorSpecialty: string
): string {
  // Map advisor specialty to relevant impact categories
  const specialtyToCategories: Record<string, ImpactCategory[]> = {
    finance: ["finance", "executive"],
    hr: ["labor", "culture"],
    operations: ["operations", "technology"],
    legal: ["legal", "external"],
    union: ["labor"],
    technology: ["technology", "operations"],
    marketing: ["marketing", "external"],
    strategy: ["strategy", "executive"],
    ethics: ["culture", "external"],
  };
  
  const relevantCategories = specialtyToCategories[advisorSpecialty] || [];
  const relevantCharacters = characters.filter(c => 
    c.impactCategories?.some(cat => relevantCategories.includes(cat))
  );
  
  if (relevantCharacters.length === 0) {
    return "No specific stakeholder dynamics to consider for this advice area.";
  }
  
  const stakeholderWarnings = relevantCharacters
    .filter(c => c.hostility >= 6 || c.influence >= 7)
    .map(c => {
      const warning = c.hostility >= 7 
        ? `${c.name} is highly resistant and may actively oppose this decision`
        : c.hostility >= 5
        ? `${c.name} has reservations that should be addressed`
        : `${c.name} has significant influence and should be consulted`;
      return warning;
    });
  
  return stakeholderWarnings.length > 0 
    ? `Key stakeholder considerations:\n${stakeholderWarnings.map(w => `- ${w}`).join("\n")}`
    : "Stakeholders in this area appear generally receptive.";
}

/**
 * Calculate voicemail trigger probability boost based on character traits
 */
export function getVoicemailTriggerBoost(
  character: CharacterTraits,
  baseProbability: number
): number {
  // High hostility and high influence = more likely to leave voicemails
  const hostilityBoost = (character.hostility - 5) / 10; // -0.5 to 0.5
  const influenceBoost = (character.influence - 5) / 20; // -0.25 to 0.25
  
  const adjustedProbability = baseProbability * (1 + hostilityBoost + influenceBoost);
  return Math.max(0, Math.min(1, adjustedProbability));
}
