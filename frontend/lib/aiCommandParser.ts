// AI Command Parser - Parses natural language commands into structured UI commands
// Works without a live LLM by using pattern matching

import { orchardNetwork } from './orchardNetwork';

export interface ParsedCommand {
  message: string;
  command: string;
  args: Record<string, any>;
  confidence: number;
}

interface CommandPattern {
  patterns: RegExp[];
  command: string;
  handler: (match: RegExpMatchArray, input: string) => ParsedCommand;
}

// Helper to find orchard by name or stress level
function findOrchardByStress(level: 'highest' | 'lowest'): string | null {
  if (orchardNetwork.length === 0) return null;
  
  const sorted = [...orchardNetwork].sort((a, b) => {
    const stressMap = { low: 1, medium: 2, high: 3 };
    const aStress = stressMap[a.stressLevel as keyof typeof stressMap] || 0;
    const bStress = stressMap[b.stressLevel as keyof typeof stressMap] || 0;
    return level === 'highest' ? bStress - aStress : aStress - bStress;
  });
  
  return sorted[0].id;
}

function findOrchardByName(name: string): string | null {
  const orchard = orchardNetwork.find(o => 
    o.name.toLowerCase().includes(name.toLowerCase()) ||
    o.id.toLowerCase().includes(name.toLowerCase())
  );
  return orchard?.id || null;
}

function findSectionByName(orchardId: string, sectionName: string): string | null {
  const orchard = orchardNetwork.find(o => o.id === orchardId);
  if (!orchard) return null;
  
  const section = orchard.sections.find(s =>
    s.name.toLowerCase().includes(sectionName.toLowerCase()) ||
    s.id.toLowerCase().includes(sectionName.toLowerCase())
  );
  return section?.id || null;
}

// Command patterns with handlers
const commandPatterns: CommandPattern[] = [
  // Navigate to orchard with highest/lowest stress
  {
    patterns: [
      /show\s+(?:me\s+)?(?:the\s+)?(?:orchard\s+)?(?:with\s+)?(?:the\s+)?(highest|lowest)\s+stress/i,
      /navigate\s+to\s+(?:the\s+)?(highest|lowest)\s+stress\s+orchard/i,
      /go\s+to\s+(?:the\s+)?(highest|lowest)\s+stress/i,
    ],
    command: 'navigate_to_orchard',
    handler: (match, input) => {
      const level = match[1].toLowerCase() as 'highest' | 'lowest';
      const orchardId = findOrchardByStress(level);
      
      return {
        message: orchardId 
          ? `Navigating to the ${level} stress orchard and showing stress zones.`
          : `Could not find orchard with ${level} stress.`,
        command: 'navigate_to_orchard',
        args: {
          orchard_id: orchardId || '',
          overlay: 'stress',
          show_stress_zones: true,
        },
        confidence: orchardId ? 0.95 : 0.3,
      };
    },
  },
  
  // Navigate to specific orchard by name
  {
    patterns: [
      /(?:navigate|go|show|fly)\s+to\s+(?:orchard\s+)?([a-z0-9\s-]+?)(?:\s+orchard)?$/i,
      /show\s+(?:me\s+)?(?:orchard\s+)?([a-z0-9\s-]+)/i,
    ],
    command: 'navigate_to_orchard',
    handler: (match, input) => {
      const orchardName = match[1].trim();
      const orchardId = findOrchardByName(orchardName);
      
      return {
        message: orchardId
          ? `Navigating to ${orchardName} orchard.`
          : `Could not find orchard "${orchardName}". Available orchards: ${orchardNetwork.map(o => o.name).join(', ')}`,
        command: 'navigate_to_orchard',
        args: {
          orchard_id: orchardId || '',
        },
        confidence: orchardId ? 0.9 : 0.4,
      };
    },
  },
  
  // Show stress zones
  {
    patterns: [
      /show\s+(?:me\s+)?(?:the\s+)?stress\s+zones?/i,
      /display\s+stress\s+(?:map|zones?|overlay)/i,
      /turn\s+on\s+stress\s+(?:zones?|overlay)/i,
    ],
    command: 'show_stress_zones',
    handler: (match, input) => {
      return {
        message: 'Displaying stress zones across all orchards.',
        command: 'show_stress_zones',
        args: {
          show_all: true,
        },
        confidence: 0.95,
      };
    },
  },
  
  // Show network view
  {
    patterns: [
      /show\s+(?:me\s+)?(?:the\s+)?(?:orchard\s+)?network/i,
      /show\s+all\s+orchards/i,
      /(?:view|display)\s+(?:full|entire)\s+network/i,
    ],
    command: 'show_network',
    handler: (match, input) => {
      return {
        message: 'Showing full orchard network view.',
        command: 'show_network',
        args: {
          zoom_level: 'global',
        },
        confidence: 0.95,
      };
    },
  },
  
  // Enter 3D twin
  {
    patterns: [
      /(?:enter|open|show|switch\s+to)\s+(?:the\s+)?3d\s+(?:twin|view|mode)/i,
      /(?:go\s+to|switch\s+to)\s+3d/i,
      /show\s+(?:me\s+)?(?:the\s+)?digital\s+twin/i,
    ],
    command: 'enter_3d_twin',
    handler: (match, input) => {
      // Try to extract orchard name if mentioned
      const orchardMatch = input.match(/(?:for|of)\s+([a-z0-9\s-]+?)(?:\s+orchard)?$/i);
      const orchardId = orchardMatch ? findOrchardByName(orchardMatch[1]) : null;
      
      return {
        message: orchardId
          ? `Entering 3D digital twin view for selected orchard.`
          : 'Switching to 3D digital twin view.',
        command: 'enter_3d_twin',
        args: {
          orchard_id: orchardId || '',
        },
        confidence: 0.9,
      };
    },
  },
  
  // Run simulation
  {
    patterns: [
      /run\s+(?:a\s+)?(?:water|irrigation)\s+(?:stress\s+)?simulation/i,
      /simulate\s+(?:water|irrigation)\s+stress/i,
      /test\s+irrigation\s+scenario/i,
    ],
    command: 'run_simulation',
    handler: (match, input) => {
      return {
        message: 'Running water stress simulation with current parameters.',
        command: 'run_simulation',
        args: {
          scenario_type: 'irrigation',
          parameters: {
            moisture_change: 20,
          },
        },
        confidence: 0.9,
      };
    },
  },
  
  // Apply recommendation
  {
    patterns: [
      /apply\s+(?:the\s+)?(?:top|best|first)\s+recommendation/i,
      /implement\s+(?:the\s+)?recommendation/i,
      /execute\s+(?:the\s+)?(?:top\s+)?recommendation/i,
    ],
    command: 'apply_recommendation',
    handler: (match, input) => {
      return {
        message: 'Applying the top AI recommendation.',
        command: 'apply_recommendation',
        args: {
          recommendation_id: 'top',
        },
        confidence: 0.95,
      };
    },
  },
  
  // Show financial impact
  {
    patterns: [
      /show\s+(?:me\s+)?(?:the\s+)?financial\s+(?:impact|analysis|projection)/i,
      /(?:display|view)\s+(?:financial|revenue|profit)\s+(?:data|impact)/i,
      /what(?:'s|\s+is)\s+the\s+financial\s+impact/i,
    ],
    command: 'show_financial_impact',
    handler: (match, input) => {
      return {
        message: 'Displaying financial impact analysis and projections.',
        command: 'show_financial_impact',
        args: {
          focus: true,
        },
        confidence: 0.95,
      };
    },
  },
  
  // Create analytics summary
  {
    patterns: [
      /(?:create|generate|show)\s+(?:an?\s+)?analytics\s+summary/i,
      /show\s+(?:me\s+)?(?:the\s+)?(?:full\s+)?analytics/i,
      /(?:give|show)\s+me\s+(?:a\s+)?summary/i,
    ],
    command: 'create_analytics_summary',
    handler: (match, input) => {
      return {
        message: 'Generating comprehensive analytics summary.',
        command: 'create_analytics_summary',
        args: {
          include_all: true,
        },
        confidence: 0.9,
      };
    },
  },
  
  // Reset view
  {
    patterns: [
      /reset\s+(?:the\s+)?view/i,
      /go\s+back\s+to\s+(?:default|home|start)/i,
      /clear\s+(?:the\s+)?(?:view|selection)/i,
    ],
    command: 'reset_view',
    handler: (match, input) => {
      return {
        message: 'Resetting to default view.',
        command: 'reset_view',
        args: {},
        confidence: 0.95,
      };
    },
  },
];

// Main parser function
export function parseAICommand(input: string): ParsedCommand {
  const trimmedInput = input.trim();
  
  // Try each pattern
  for (const pattern of commandPatterns) {
    for (const regex of pattern.patterns) {
      const match = trimmedInput.match(regex);
      if (match) {
        return pattern.handler(match, trimmedInput);
      }
    }
  }
  
  // No match found - return a helpful message
  return {
    message: `I'm not sure how to handle that command. Try commands like:
    • "Show me the highest stress orchard"
    • "Navigate to Orchard West"
    • "Show stress zones"
    • "Enter 3D twin"
    • "Run water stress simulation"
    • "Apply the best recommendation"
    • "Show financial impact"
    • "Create an analytics summary"`,
    command: 'unknown',
    args: {},
    confidence: 0.0,
  };
}

// Export for testing
export { commandPatterns };

// Made with Bob
