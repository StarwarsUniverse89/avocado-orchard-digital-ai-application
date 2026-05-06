// AI Command Parser - Parses natural language commands into structured UI commands
// Works without a live LLM by using pattern matching

import { orchardNetwork } from './orchardNetwork';
import {
  mexicoAvocadoMunicipalities,
  michoacanAvocadoBelt,
  getHighestStressOrchard,
  getTopProductionMunicipality,
} from './mexicoAvocadoNetwork';

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
  // Show avocado belt
  {
    patterns: [
      /show\s+(?:me\s+)?(?:the\s+)?avocado\s+belt/i,
      /display\s+(?:the\s+)?avocado\s+belt/i,
      /show\s+(?:the\s+)?Michoacán\s+belt/i,
    ],
    command: 'show_avocado_belt',
    handler: (match, input) => {
      return {
        message: 'Displaying Michoacán avocado belt boundary and production municipalities.',
        command: 'show_avocado_belt',
        args: {
          belt: michoacanAvocadoBelt,
          municipalities: mexicoAvocadoMunicipalities,
        },
        confidence: 0.95,
      };
    },
  },
  
  // Show production clusters
  {
    patterns: [
      /show\s+(?:me\s+)?(?:the\s+)?production\s+clusters?/i,
      /display\s+(?:the\s+)?clusters?/i,
      /show\s+(?:the\s+)?avocado\s+clusters?/i,
    ],
    command: 'show_production_clusters',
    handler: (match, input) => {
      return {
        message: 'Displaying production clusters across the Michoacán avocado belt.',
        command: 'show_production_clusters',
        args: {},
        confidence: 0.95,
      };
    },
  },
  
  // Create avocado orchard network in Michoacán
  {
    patterns: [
      /create\s+(?:an?\s+)?(?:avocado\s+)?orchard\s+network\s+(?:in\s+)?Michoacán/i,
      /generate\s+(?:the\s+)?Michoacán\s+(?:orchard\s+)?network/i,
      /show\s+(?:the\s+)?synthetic\s+orchards?/i,
    ],
    command: 'create_orchard_network',
    handler: (match, input) => {
      return {
        message: 'Generating synthetic orchard network across Michoacán production clusters.',
        command: 'create_orchard_network',
        args: {
          region: 'michoacan',
        },
        confidence: 0.95,
      };
    },
  },
  
  // Navigate to specific municipalities
  {
    patterns: [
      /navigate\s+to\s+Tancítaro/i,
      /go\s+to\s+Tancítaro/i,
      /show\s+(?:me\s+)?Tancítaro/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'tancitaro');
      return {
        message: 'Flying to Tancítaro, the major avocado growing area near Pico de Tancítaro.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'tancitaro',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  {
    patterns: [
      /navigate\s+to\s+Uruapan/i,
      /go\s+to\s+Uruapan/i,
      /show\s+(?:me\s+)?Uruapan/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'uruapan');
      return {
        message: 'Flying to Uruapan, known as the Avocado Capital of the World.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'uruapan',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  {
    patterns: [
      /navigate\s+to\s+Peribán/i,
      /go\s+to\s+Peribán/i,
      /show\s+(?:me\s+)?Peribán/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'periban');
      return {
        message: 'Flying to Peribán, one of the major avocado-producing municipalities.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'periban',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  {
    patterns: [
      /navigate\s+to\s+Tacámbaro/i,
      /go\s+to\s+Tacámbaro/i,
      /show\s+(?:me\s+)?Tacámbaro/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'tacambaro');
      return {
        message: 'Flying to Tacámbaro, significant high-altitude orchard density area.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'tacambaro',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  {
    patterns: [
      /navigate\s+to\s+Ziracuaretiro/i,
      /go\s+to\s+Ziracuaretiro/i,
      /show\s+(?:me\s+)?Ziracuaretiro/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'ziracuaretiro');
      return {
        message: 'Flying to Ziracuaretiro, high demand for irrigation and satellite monitoring.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'ziracuaretiro',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  {
    patterns: [
      /navigate\s+to\s+Salvador\s+Escalante/i,
      /go\s+to\s+Salvador\s+Escalante/i,
      /show\s+(?:me\s+)?Salvador\s+Escalante/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'salvador_escalante');
      return {
        message: 'Flying to Salvador Escalante, high-density avocado production area.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'salvador_escalante',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  {
    patterns: [
      /navigate\s+to\s+Ario\s+de\s+Rosales/i,
      /go\s+to\s+Ario\s+de\s+Rosales/i,
      /show\s+(?:me\s+)?Ario\s+de\s+Rosales/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'ario_de_rosales');
      return {
        message: 'Flying to Ario de Rosales, significant avocado-producing municipality.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'ario_de_rosales',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  {
    patterns: [
      /navigate\s+to\s+Zitácuaro/i,
      /go\s+to\s+Zitácuaro/i,
      /show\s+(?:me\s+)?Zitácuaro/i,
    ],
    command: 'navigate_to_municipality',
    handler: (match, input) => {
      const municipality = mexicoAvocadoMunicipalities.find(m => m.id === 'zitacuaro');
      return {
        message: 'Flying to Zitácuaro, eastern avocado production cluster.',
        command: 'navigate_to_municipality',
        args: {
          municipality_id: 'zitacuaro',
          lat: municipality?.lat,
          lng: municipality?.lng,
        },
        confidence: 0.95,
      };
    },
  },
  
  // Show highest production municipality
  {
    patterns: [
      /show\s+(?:me\s+)?(?:the\s+)?highest\s+production\s+municipality/i,
      /(?:which|what)\s+(?:is\s+)?(?:the\s+)?top\s+(?:production\s+)?municipality/i,
      /show\s+(?:the\s+)?top\s+producer/i,
    ],
    command: 'show_top_municipality',
    handler: (match, input) => {
      const topMunicipality = getTopProductionMunicipality();
      return {
        message: `Flying to ${topMunicipality.name}, the highest production municipality with ${topMunicipality.estimated_hectares.toLocaleString()} hectares.`,
        command: 'navigate_to_municipality',
        args: {
          municipality_id: topMunicipality.id,
          lat: topMunicipality.lat,
          lng: topMunicipality.lng,
          highlight: true,
        },
        confidence: 0.95,
      };
    },
  },
  
  // Find highest stress orchard in avocado belt
  {
    patterns: [
      /find\s+(?:the\s+)?highest\s+stress\s+orchard\s+(?:in\s+)?(?:the\s+)?(?:avocado\s+)?belt/i,
      /show\s+(?:me\s+)?(?:the\s+)?highest\s+risk\s+orchard/i,
      /(?:which|what)\s+(?:is\s+)?(?:the\s+)?most\s+stressed\s+orchard/i,
    ],
    command: 'find_highest_stress_orchard',
    handler: (match, input) => {
      const highestStressOrchard = getHighestStressOrchard();
      return {
        message: `Found highest stress orchard: ${highestStressOrchard.name} with ${highestStressOrchard.stress_level} stress level and NDVI of ${highestStressOrchard.ndvi_average}.`,
        command: 'select_orchard',
        args: {
          orchard_id: highestStressOrchard.orchard_id,
          lat: highestStressOrchard.lat,
          lng: highestStressOrchard.lng,
          highlight: true,
        },
        confidence: 0.95,
      };
    },
  },
  
  // Compare municipalities
  {
    patterns: [
      /compare\s+Tancítaro\s+and\s+Uruapan/i,
      /compare\s+Uruapan\s+and\s+Tancítaro/i,
      /show\s+(?:me\s+)?(?:a\s+)?comparison\s+(?:of\s+)?Tancítaro\s+(?:and|vs)\s+Uruapan/i,
    ],
    command: 'compare_municipalities',
    handler: (match, input) => {
      const tancitaro = mexicoAvocadoMunicipalities.find(m => m.id === 'tancitaro');
      const uruapan = mexicoAvocadoMunicipalities.find(m => m.id === 'uruapan');
      return {
        message: 'Comparing Tancítaro and Uruapan production metrics and stress levels.',
        command: 'compare_municipalities',
        args: {
          municipality_ids: ['tancitaro', 'uruapan'],
          municipalities: [tancitaro, uruapan],
        },
        confidence: 0.95,
      };
    },
  },
  
  // Enter 3D twin for highest risk orchard
  {
    patterns: [
      /enter\s+3d\s+twin\s+(?:for\s+)?(?:the\s+)?highest\s+risk\s+orchard/i,
      /open\s+(?:the\s+)?3d\s+(?:twin\s+)?(?:for\s+)?(?:the\s+)?highest\s+risk/i,
      /show\s+(?:me\s+)?(?:the\s+)?3d\s+(?:view\s+)?(?:of\s+)?(?:the\s+)?highest\s+risk/i,
    ],
    command: 'enter_3d_twin_highest_risk',
    handler: (match, input) => {
      const highestStressOrchard = getHighestStressOrchard();
      return {
        message: `Opening 3D digital twin for ${highestStressOrchard.name}, the highest risk orchard.`,
        command: 'enter_3d_twin',
        args: {
          orchard_id: highestStressOrchard.orchard_id,
          orchard_name: highestStressOrchard.name,
        },
        confidence: 0.95,
      };
    },
  },
  
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
    
    Mexico Avocado Network:
    • "Show avocado belt"
    • "Show production clusters"
    • "Create avocado orchard network in Michoacán"
    • "Navigate to Tancítaro"
    • "Navigate to Uruapan"
    • "Show highest production municipality"
    • "Find highest stress orchard in the avocado belt"
    • "Compare Tancítaro and Uruapan"
    • "Enter 3D twin for the highest risk orchard"
    
    General Commands:
    • "Show me the highest stress orchard"
    • "Show stress zones"
    • "Enter 3D twin"
    • "Run water stress simulation"
    • "Apply the best recommendation"
    • "Show financial impact"`,
    command: 'unknown',
    args: {},
    confidence: 0.0,
  };
}

// Export for testing
export { commandPatterns };

// Made with Bob
