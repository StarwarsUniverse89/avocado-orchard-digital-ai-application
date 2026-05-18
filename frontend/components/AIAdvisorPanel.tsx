"use client";

import { useState, useRef, useEffect } from "react";
import { UICommandHandler } from "@/types/uiCommands";
import { parseAICommand, ParsedCommand } from "@/lib/aiCommandParser";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  impact: string;
  confidence: number;
  command?: string;
}

interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: string;
  command?: ParsedCommand;
}

interface AIAdvisorPanelProps {
  onCommand?: UICommandHandler;
}

export default function AIAdvisorPanel({ onCommand }: AIAdvisorPanelProps) {
  const [recommendations] = useState<Recommendation[]>([
    {
      id: "1",
      title: "Increase Irrigation in Zone B",
      description:
        "Soil moisture levels have dropped to 40% in Orchard B. Recommend increasing irrigation by 15% to prevent stress during fruit development phase.",
      priority: "high",
      impact: "+12% yield protection",
      confidence: 94,
      command: "navigate_to_orchard: orchard-002",
    },
    {
      id: "2",
      title: "Pest Monitoring Alert",
      description:
        "Persea mite activity detected at 15% leaf damage threshold. Consider preventive treatment to avoid reaching economic injury level (17% PLAD).",
      priority: "medium",
      impact: "Prevent 5-15% yield loss",
      confidence: 87,
      command: "show_stress_zones",
    },
    {
      id: "3",
      title: "Optimal Harvest Window",
      description:
        "Based on current fruit size and market prices, optimal harvest window is 14-21 days. Delaying harvest could increase fruit weight by 8%.",
      priority: "low",
      impact: "+$2,400 revenue potential",
      confidence: 91,
      command: "navigate_to_orchard: orchard-001",
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "system",
      content:
        "Gemini command chat active. Try: 'Show me the highest stress orchard' or 'Enter 3D twin'",
      timestamp: "Ready",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: inputValue,
      timestamp: new Date().toLocaleTimeString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsProcessing(true);

    // Simulate processing delay
    setTimeout(() => {
      // Parse the command
      const parsedCommand = parseAICommand(inputValue);

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: "ai",
        content: parsedCommand.message,
        timestamp: new Date().toLocaleTimeString(),
        command: parsedCommand,
      };

      setChatMessages((prev) => [...prev, aiMessage]);

      // Execute command if valid
      if (parsedCommand.confidence > 0.5 && onCommand) {
        // Map parsed command to UI command format
        const uiCommand = mapToUICommand(parsedCommand);
        if (uiCommand) {
          onCommand(uiCommand);

          // Add system confirmation
          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}`,
            type: "system",
            content: `✓ Command executed: ${parsedCommand.command}`,
            timestamp: new Date().toLocaleTimeString(),
          };
          setChatMessages((prev) => [...prev, systemMessage]);
        }
      }

      setIsProcessing(false);
      inputRef.current?.focus();
    }, 500);
  };

  const mapToUICommand = (parsed: ParsedCommand): any => {
    const { command, args } = parsed;

    switch (command) {
      // Mexico Network Commands
      case "navigate_to_municipality":
        return {
          type: "navigate_to_municipality",
          args: {
            municipality_id: args.municipality_id,
            lat: args.lat,
            lng: args.lng,
            highlight: args.highlight,
          },
        };
      case "show_avocado_belt":
        return {
          type: "show_avocado_belt",
        };
      case "show_production_clusters":
        return {
          type: "show_production_clusters",
        };
      case "create_orchard_network":
        return {
          type: "create_orchard_network",
        };
      case "scan_municipality_orchards":
        return {
          type: "scan_municipality_orchards",
          args: {
            municipality_id: args.municipality_id,
          },
        };
      case "select_largest_orchard_candidate":
        return {
          type: "select_largest_orchard_candidate",
        };
      case "select_highest_stress_parcel":
        return {
          type: "select_highest_stress_parcel",
        };
      case "save_orchard_to_archive":
        return {
          type: "save_orchard_to_archive",
        };
      case "run_vision_pipeline":
        return {
          type: "run_vision_pipeline",
        };
      case "generate_3d_twin_from_orchard":
        return {
          type: "generate_3d_twin_from_orchard",
        };
      case "show_gps_boundary":
        return {
          type: "show_gps_boundary",
        };
      case "show_orchard_archive":
        return {
          type: "show_orchard_archive",
        };
      case "select_orchard":
        return {
          type: "select_orchard",
          args: {
            orchard_id: args.orchard_id,
            lat: args.lat,
            lng: args.lng,
            highlight: args.highlight,
          },
        };
      // Legacy Orchard Commands
      case "navigate_to_orchard":
        return {
          type: "navigate_to_orchard",
          orchardId: args.orchard_id,
          flyDuration: 2,
        };
      case "show_network":
        return {
          type: "show_network",
          highlightStress: true,
        };
      case "show_stress_zones":
        return {
          type: "show_stress_zones",
          orchardId: args.orchard_id,
        };
      case "select_section":
        return {
          type: "select_section",
          orchardId: args.orchard_id,
          sectionId: args.section_id,
        };
      case "enter_3d_twin":
        return {
          type: "enter_3d_twin",
          orchardId: args.orchard_id || "",
          sectionId: args.section_id,
        };
      case "run_simulation":
        return {
          type: "run_simulation",
          orchardId: args.orchard_id || "",
          scenarioType: args.scenario_type || "irrigation",
          parameters: args.parameters,
        };
      case "apply_recommendation":
        return {
          type: "apply_recommendation",
          orchardId: args.orchard_id || "",
          recommendationId: args.recommendation_id,
          autoExecute: true,
        };
      case "show_financial_impact":
        return {
          type: "show_financial_impact",
          focus: args.focus || true,
        };
      case "create_analytics_summary":
        return {
          type: "create_analytics_summary",
          include_all: args.include_all || true,
        };
      
      // Data Query Commands
      case "show_belt_metric":
        return {
          type: "show_belt_metric",
          metric: args.metric || "total_hectares",
        };
      case "show_municipality_metric":
        return {
          type: "show_municipality_metric",
          municipality_id: args.municipality_id,
          metric: args.metric || "hectares",
        };
      case "show_detected_orchards":
        return {
          type: "show_detected_orchards",
          filter: args.filter || "all",
        };
      case "show_archived_orchards":
        return {
          type: "show_archived_orchards",
        };
      case "show_high_stress_parcels":
        return {
          type: "show_high_stress_parcels",
        };
      case "show_selected_context_summary":
        return {
          type: "show_selected_context_summary",
        };
      case "compare_municipalities":
        return {
          type: "compare_municipalities",
          municipality_id_1: args.municipality_id_1,
          municipality_id_2: args.municipality_id_2,
        };
      
      case "reset_view":
        return {
          type: "reset_view",
          zoomLevel: "global",
        };
      default:
        return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const priorityColors = {
    high: "border-error/50 bg-error/10",
    medium: "border-warning/50 bg-warning/10",
    low: "border-info/50 bg-info/10",
  };

  const priorityLabels = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Low Priority",
  };

  return (
    <div className="glass-elevated rounded-xl p-6 max-h-[420px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse-glow">
            <svg
              className="w-6 h-6 text-gray-950"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-50">AI Advisor</h2>
            <p className="text-sm text-gray-400">
              Command chat & recommendations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showChat
                ? "bg-primary text-gray-950"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {showChat ? "Chat" : "Cards"}
          </button>
        </div>
      </div>

      {showChat ? (
        /* Chat Interface */
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          {/* Chat History */}
          <div className="bg-gray-900/50 rounded-lg p-4 flex-1 overflow-y-auto space-y-3 border border-gray-800">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === "user"
                      ? "bg-primary text-gray-950"
                      : msg.type === "ai"
                      ? "bg-gray-800 text-gray-100"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {msg.command && msg.command.confidence > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-700 text-xs opacity-75">
                      Confidence: {Math.round(msg.command.confidence * 100)}%
                    </div>
                  )}
                  <div className="text-xs opacity-50 mt-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area - Sticky at bottom */}
          <div className="flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a command... (e.g., 'show highest stress orchard')"
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              disabled={isProcessing}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-gray-950 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {/* Quick Commands */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Quick commands:</span>
            {[
              "Show highest stress",
              "Enter 3D twin",
              "Show financial impact",
              "Create analytics summary",
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => setInputValue(cmd)}
                className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Recommendation Cards */
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`border rounded-lg p-4 ${priorityColors[rec.priority]} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {priorityLabels[rec.priority]}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">
                      {rec.confidence}% confidence
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-50 mb-2">
                    {rec.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary">
                    Impact: {rec.impact}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium transition-colors">
                    Details
                  </button>
                  <button
                    onClick={() => {
                      if (rec.command) {
                        setInputValue(rec.command);
                        setShowChat(true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-md bg-primary hover:bg-primary-dark text-gray-950 text-xs font-semibold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Powered by AMD MI300X GPU • Qwen/Llama Models
          </span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-400 text-xs">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
