export class StyleAnalysisPromptBuilder {
  static buildSystemPrompt(): string {
    return `You are a sociolinguistic and storytelling style analyzer.
Analyze the parent's spoken voice transcript to extract their unique storytelling characteristics, vocabulary, pacing, warmth, and family expressions.

Return a strictly valid JSON object matching the following structure:
{
  "language": "string (e.g. English, Tamil, Hindi)",
  "dialect": "string or null",
  "accentDescription": { "value": "string", "confidence": 0.8, "source": "transcript_analysis" },
  "vocabularyComplexity": { "value": "simple | moderate | rich", "confidence": 0.85, "source": "transcript_analysis" },
  "preferredWords": { "value": ["word1", "word2"], "confidence": 0.8, "source": "transcript_analysis" },
  "avoidedWords": { "value": [], "confidence": 0.5, "source": "transcript_analysis" },
  "slang": { "value": ["slang1"], "confidence": 0.7, "source": "transcript_analysis" },
  "familyExpressions": { "value": ["phrase1"], "confidence": 0.8, "source": "transcript_analysis" },
  "codeSwitching": { "value": true, "confidence": 0.8, "source": "transcript_analysis" },
  "sentenceLength": { "value": "short | medium | varied", "confidence": 0.85, "source": "transcript_analysis" },
  "questionFrequency": { "value": "low | medium | high", "confidence": 0.8, "source": "transcript_analysis" },
  "repetition": { "value": "low | medium | high", "confidence": 0.8, "source": "transcript_analysis" },
  "directChildAddressing": { "value": true, "confidence": 0.9, "source": "transcript_analysis" },
  "warmth": { "value": 0.9, "confidence": 0.9, "source": "transcript_analysis" },
  "affection": { "value": 0.9, "confidence": 0.9, "source": "transcript_analysis" },
  "calmness": { "value": 0.85, "confidence": 0.85, "source": "transcript_analysis" },
  "playfulness": { "value": 0.7, "confidence": 0.7, "source": "transcript_analysis" },
  "humor": { "value": 0.6, "confidence": 0.6, "source": "transcript_analysis" },
  "pacing": { "value": "slow | moderate | dynamic", "confidence": 0.8, "source": "transcript_analysis" },
  "pauses": { "value": "long | moderate | short", "confidence": 0.8, "source": "transcript_analysis" },
  "emphasis": { "value": ["important words"], "confidence": 0.7, "source": "transcript_analysis" },
  "interactionStyle": { "value": "engaging and cozy", "confidence": 0.8, "source": "transcript_analysis" },
  "examplePhrases": { "value": ["extracted phrase 1"], "confidence": 0.9, "source": "transcript_analysis" },
  "forbiddenPhrases": { "value": [], "confidence": 0.5, "source": "transcript_analysis" },
  "rawSummary": "Brief overview of the parent's storytelling persona"
}

Do NOT output anything except valid JSON.`;
  }

  static buildUserPrompt(transcript: string, metadata?: Record<string, unknown>): string {
    return `Transcript of parent's voice recording:
"""
${transcript}
"""

Additional metadata:
${metadata ? JSON.stringify(metadata, null, 2) : "None"}

Please analyze and return the ParentStyleProfile JSON.`;
  }
}
