export const baseSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "BaseAgentCharacter",
    "type": "object",
    "required": [
        "agent_type",
        "identity",
        "purpose",
        "character",
        "behavior",
        "interaction",
        "constraints"
    ],
    "properties": {
        "agent_type": {
            "type": "string",
            "enum": [
                "financial_agent",
                "social_agent",
                "operational_agent"
            ]
        },
        "identity": {
            "type": "object",
            "required": ["name", "role", "description"],
            "properties": {
                "name": { "type": "string", "minLength": 1 },
                "role": { "type": "string", "minLength": 1 },
                "description": { "type": "string", "minLength": 1 },
                "version": { "type": "string", "default": "1.0.0" }
            },
            "additionalProperties": false
        },
        "purpose": {
            "type": "object",
            "required": ["primary_goal"],
            "properties": {
                "primary_goal": { "type": "string", "minLength": 1 },
                "secondary_goals": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "non_goals": {
                    "type": "array",
                    "items": { "type": "string" }
                }
            },
            "additionalProperties": false
        },
        "character": {
            "type": "object",
            "required": ["bio", "tone", "traits"],
            "properties": {
                "bio": { "type": "string", "minLength": 1 },
                "tone": { "type": "string", "minLength": 1 },
                "traits": {
                    "type": "array",
                    "minItems": 1,
                    "items": { "type": "string" }
                },
                "values": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "communication_style": {
                    "type": "array",
                    "items": { "type": "string" }
                }
            },
            "additionalProperties": false
        },
        "behavior": {
            "type": "object",
            "required": ["clarification_policy", "fallback_behavior"],
            "properties": {
                "clarification_policy": { "type": "string" },
                "ambiguity_policy": { "type": "string" },
                "fallback_behavior": { "type": "string" },
                "initiative_level": {
                    "type": "string",
                    "enum": ["low", "moderate", "high", "Low", "Moderate", "High"]
                }
            },
            "additionalProperties": false
        },
        "interaction": {
            "type": "object",
            "required": ["response_style", "verbosity"],
            "properties": {
                "response_style": { "type": "string" },
                "verbosity": {
                    "type": "string",
                    "enum": ["concise", "balanced", "detailed", "Concise", "Balanced", "Detailed"]
                },
                "confirmation_style": { "type": "string" },
                "status_reporting": {
                    "type": "boolean"
                }
            },
            "additionalProperties": false
        },
        "constraints": {
            "type": "object",
            "required": ["must_not_do"],
            "properties": {
                "must_not_do": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "safety_rules": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "human_in_the_loop": {
                    "type": "boolean"
                }
            },
            "additionalProperties": false
        }
    },
    "additionalProperties": false
};
