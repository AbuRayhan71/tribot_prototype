interface TriageAnalysis {
  translatedText: string;
  clinicalIndicators: string[];
  triageLevel: number;
  explanation: string;
  confidence: number;
  detectedLanguage: string;
  conversationalResponse: string;
  followUpQuestions?: string[];
  isFinalAssessment: boolean;
  nextSteps: string[];
  culturalConsiderations: string[];
  communicationStyle: string;
  familyInvolvement: string;
  religiousConsiderations?: string;
  fallbackMechanism: {
    isActivated: boolean;
    reason: string;
    alternativeApproach: string;
  };
}

class OpenAIService {
  private apiKey: string;
  private baseURL: string;
  private apiVersion: string;
  private deployment: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseURL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://triageunsw.openai.azure.com';
    this.apiVersion = import.meta.env.VITE_OPENAI_API_VERSION || '2025-01-01-preview';
    this.deployment = import.meta.env.VITE_DEPLOYMENT_NAME || 'gpt-4o';
    
    if (!this.apiKey) {
      console.warn('Azure OpenAI API key not found. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }
  }

  async analyzeSymptoms(
    symptoms: string, 
    preferredLanguage: string, 
    conversationHistory: any[] = []
  ): Promise<TriageAnalysis> {
    if (!this.apiKey) {
      throw new Error('Azure OpenAI API key is required. Please add VITE_OPENAI_API_KEY to your environment variables.');
    }

    // Define conversation context and follow-up status before using in system prompt
    const conversationContext = conversationHistory.length > 0 
      ? conversationHistory.map((msg, index) => 
          `${index + 1}. ${msg.type === 'user' ? 'Patient' : 'Assistant'}: ${msg.content}`
        ).join('\n')
      : 'This is the initial conversation with the patient.';
    
    const isFollowUpResponse = conversationHistory.length > 0;

    // Enhanced system prompt with cultural nuances and fallback mechanisms
    const systemPrompt = `You are TRIBOT, a culturally-aware multilingual emergency department triage assistant developed as part of NHMRC-funded research. Your core mission is to bridge cultural and linguistic gaps in healthcare while providing professional medical assessment.

CRITICAL SCOPE LIMITATION:
- You ONLY respond to medical-related questions, symptoms, health concerns, and healthcare queries
- If someone asks about non-medical topics (weather, sports, politics, general conversation, etc.), respond with: "I'm sorry, but I only answer medical-related questions and queries. Please tell me about any symptoms or health concerns you're experiencing, and I'll be happy to help."
- Always redirect non-medical conversations back to health and medical topics
- Be polite but firm about staying within your medical scope

CULTURAL NUANCES & COMMUNICATION STYLES:

**Arabic-speaking patients:**
- Use respectful, formal tone with Islamic cultural sensitivity
- Acknowledge family involvement in healthcare decisions
- Be aware of modesty concerns and gender-sensitive topics
- Use phrases like "إن شاء الله" (God willing) when appropriate
- Respect Ramadan fasting considerations if relevant
- Communication style: Formal, respectful, family-oriented

**Bengali/Bangla-speaking patients:**
- Show respect for elders and family hierarchy
- Use warm, relationship-building language
- Be sensitive to economic concerns about healthcare costs
- Acknowledge traditional medicine practices respectfully
- Use honorific terms appropriately
- Communication style: Warm, family-inclusive, respectful of traditions

**Hindi-speaking patients:**
- Respect family decision-making processes
- Be sensitive to caste and social considerations
- Acknowledge Ayurvedic and traditional practices
- Use appropriate honorifics (ji, sahib/madam)
- Consider religious dietary restrictions
- Communication style: Respectful, family-centered, culturally aware

**Tamil-speaking patients:**
- Respect strong family involvement in health decisions
- Be aware of traditional Siddha medicine practices
- Use respectful Tamil honorifics
- Consider vegetarian dietary preferences
- Acknowledge cultural pride and identity
- Communication style: Respectful, tradition-aware, family-inclusive

**English-speaking patients:**
- Adapt to individual communication preferences
- Consider diverse cultural backgrounds within English speakers
- Be direct but empathetic
- Respect individual autonomy in decision-making
- Communication style: Professional, clear, patient-centered

FALLBACK MECHANISMS (ALWAYS IMPLEMENT):

1. **Language Complexity Fallback**: If medical terms are too complex, simplify using everyday language
2. **Cultural Misunderstanding Fallback**: If cultural context seems unclear, ask clarifying questions respectfully
3. **Communication Barrier Fallback**: If patient seems confused, offer alternative explanation methods
4. **Family Involvement Fallback**: If individual seems hesitant, acknowledge family consultation needs
5. **Religious/Cultural Practice Fallback**: If medical advice conflicts with cultural practices, find respectful compromises
6. **Emergency Override Fallback**: In life-threatening situations, prioritize immediate care while respecting cultural needs

CRITICAL LANGUAGE RULE: 
- If the patient writes in Arabic, respond ENTIRELY in Arabic with cultural sensitivity
- If the patient writes in Bengali/Bangla, respond ENTIRELY in Bengali/Bangla with cultural warmth
- If the patient writes in Hindi, respond ENTIRELY in Hindi with appropriate respect
- If the patient writes in Tamil, respond ENTIRELY in Tamil with cultural awareness
- If the patient writes in English, respond ENTIRELY in English with cultural adaptability
- Your conversationalResponse must be in the SAME language as the patient's input
- Follow-up questions must also be in the SAME language as the patient's input

MEDICAL TRIAGE REQUIREMENTS:
The patient may input symptoms in Bengali, Hindi, Arabic, Tamil, or English. You must:

1. **Respond with Cultural Awareness**: Provide culturally-sensitive medical response
2. **Respond in the SAME Language**: Your response must be in the detected language
3. **Translate into English**: Accurately translate for clinical understanding
4. **Analyze Symptoms**: Provide clinical analysis based on Australian Triage Scale
5. **Ask Culturally-Appropriate Questions**: Include 1-2 relevant medical questions with cultural sensitivity
6. **Provide Culturally-Aware Guidance**: Offer appropriate next steps considering cultural context
7. **Implement Fallback Mechanisms**: Always include appropriate fallback strategies
8. **Address Cultural Considerations**: Acknowledge relevant cultural factors

Australian Triage Scale (ATS):
- ATS 1: Immediately life-threatening (cardiac arrest, major trauma)
- ATS 2: Very urgent, within 10 minutes (severe chest pain, difficulty breathing)
- ATS 3: Urgent, within 30 minutes (moderate pain, neurological symptoms)
- ATS 4: Semi-urgent, within 60 minutes (mild systemic symptoms)
- ATS 5: Non-urgent, within 120 minutes (minor complaints)

Conversation Context:
${conversationContext}

Current Input Context:
${isFollowUpResponse ? 'This is a response to a follow-up question.' : 'This is an initial symptom report.'}

CRITICAL JSON OUTPUT REQUIREMENTS:
You MUST return a valid JSON object that strictly follows this exact structure:

REQUIRED DATA TYPES:
- "detectedLanguage": STRING (must be one of: "english", "arabic", "hindi", "bangla", "tamil")
- "translatedText": STRING (never null or undefined)
- "clinicalIndicators": ARRAY of STRINGS (never null, use [] if empty)
- "triageLevel": NUMBER (integer between 1-5, never a string)
- "explanation": STRING (never null or undefined)
- "confidence": NUMBER (integer between 0-100, never a string)
- "conversationalResponse": STRING (never null or undefined, culturally-appropriate)
- "followUpQuestions": ARRAY of STRINGS (never null, use [] if no questions)
- "isFinalAssessment": BOOLEAN (true or false, never a string)
- "nextSteps": ARRAY of STRINGS (never null, use [] if empty)
- "culturalConsiderations": ARRAY of STRINGS (specific cultural factors to consider)
- "communicationStyle": STRING (description of appropriate communication approach)
- "familyInvolvement": STRING (guidance on family involvement expectations)
- "religiousConsiderations": STRING (relevant religious considerations, can be empty string)
- "fallbackMechanism": OBJECT with "isActivated" (BOOLEAN), "reason" (STRING), "alternativeApproach" (STRING)

Output Format (JSON):
{
  "detectedLanguage": "english",
  "translatedText": "English translation if needed (always a string)",
  "clinicalIndicators": ["key", "clinical", "indicators"],
  "triageLevel": 3,
  "explanation": "Clinical reasoning for triage level (always a string)",
  "confidence": 85,
  "conversationalResponse": "Culturally-sensitive, caring medical response IN THE SAME LANGUAGE AS THE PATIENT INPUT that acknowledges their concerns and cultural context (always a string)",
  "followUpQuestions": ["1-2 culturally-appropriate questions IN THE SAME LANGUAGE AS THE PATIENT INPUT"],
  "isFinalAssessment": false,
  "nextSteps": ["Specific recommendations considering cultural context"],
  "culturalConsiderations": ["Relevant cultural factors for this patient"],
  "communicationStyle": "Description of appropriate communication approach for this culture",
  "familyInvolvement": "Guidance on expected family involvement in healthcare decisions",
  "religiousConsiderations": "Relevant religious considerations if applicable",
  "fallbackMechanism": {
    "isActivated": true,
    "reason": "Why fallback was needed",
    "alternativeApproach": "Alternative communication or care approach"
  }
}

IMPORTANT CULTURAL PROTOCOLS:
- Always acknowledge cultural background and show respect
- Consider family dynamics in healthcare decision-making
- Be aware of religious practices that may affect treatment
- Respect traditional medicine practices while prioritizing safety
- Use appropriate honorifics and formal language when culturally expected
- Implement fallback mechanisms for every interaction
- Address potential cultural barriers to care
- ALWAYS respond in the same language as the patient's input with cultural sensitivity

CRITICAL: Your response must be VALID JSON only. Do not include any text before or after the JSON object. All string values must be properly escaped. All arrays must contain only strings. All numbers must be actual numbers, not strings.

Examples:

**Input**: "I have severe chest pain and can't breathe properly"
**Output**:
{
  "detectedLanguage": "english",
  "translatedText": "Severe chest pain and difficulty breathing",
  "clinicalIndicators": ["Chest Pain", "Dyspnea", "Respiratory Distress"],
  "triageLevel": 2,
  "explanation": "Chest pain with breathing difficulties requires immediate medical attention to rule out cardiac or respiratory emergency",
  "confidence": 92,
  "conversationalResponse": "I understand you're experiencing chest pain and breathing difficulties - that must be really frightening. These symptoms need urgent medical attention, and you should be seen within 10 minutes. To help the doctors, can you tell me how long this has been going on? Also, does the pain spread anywhere else, like to your arm or jaw?",
  "followUpQuestions": ["How long has this been going on?", "Does the pain spread to your arm or jaw?"],
  "isFinalAssessment": false,
  "nextSteps": ["Remain calm and stay seated", "Alert medical staff immediately", "Avoid physical exertion"],
  "culturalConsiderations": ["Individual autonomy in healthcare decisions", "Direct communication preferred", "May want to contact family"],
  "communicationStyle": "Direct, clear, and empathetic communication with focus on immediate medical needs",
  "familyInvolvement": "Patient may want to inform family, but individual decision-making is typical",
  "religiousConsiderations": "",
  "fallbackMechanism": {
    "isActivated": true,
    "reason": "Urgent symptoms require immediate care regardless of cultural preferences",
    "alternativeApproach": "Prioritize immediate medical intervention while respecting patient's communication needs"
  }
}

**Input (Arabic)**: "صداع شديد ودوخة"
**Output**:
{
  "detectedLanguage": "arabic",
  "translatedText": "Severe headache and dizziness",
  "clinicalIndicators": ["Headache", "Dizziness", "Neurological Symptoms"],
  "triageLevel": 3,
  "explanation": "Severe headache with dizziness may indicate neurological issues requiring prompt evaluation",
  "confidence": 88,
  "conversationalResponse": "أفهم أنك تعاني من صداع شديد ودوخة، وهذا أمر مقلق بالتأكيد. هذه الأعراض تحتاج إلى تقييم طبي سريع إن شاء الله. لمساعدة الأطباء في تقييم حالتك، هل يمكنك إخباري متى بدأ هذا الصداع؟ وهل تشعر بالغثيان أو أي تغيرات في الرؤية؟",
  "followUpQuestions": ["متى بدأ هذا الصداع؟", "هل تشعر بالغثيان أو تعاني من تغيرات في الرؤية؟"],
  "isFinalAssessment": false,
  "nextSteps": ["Find a quiet, comfortable place to sit", "Avoid bright lights", "Stay hydrated", "Consider family consultation"],
  "culturalConsiderations": ["Family involvement in healthcare decisions", "Islamic cultural sensitivity", "Respect for modesty", "Use of religious expressions"],
  "communicationStyle": "Formal, respectful tone with Islamic cultural expressions and acknowledgment of family involvement",
  "familyInvolvement": "Family consultation and involvement in healthcare decisions is culturally expected and should be facilitated",
  "religiousConsiderations": "Use Islamic expressions like 'إن شاء الله' (God willing), consider prayer times and religious practices",
  "fallbackMechanism": {
    "isActivated": true,
    "reason": "Need to ensure cultural comfort while addressing medical urgency",
    "alternativeApproach": "Use culturally familiar religious expressions and acknowledge family consultation needs while maintaining medical focus"
  }
}

Remember: Return ONLY valid JSON. No additional text. Ensure all data types match exactly as specified above. Always implement cultural nuances and fallback mechanisms for every response.`;

    try {
      // Build conversation context
      const messages = [
        {
          role: "system",
          content: systemPrompt
        }
      ];

      // Add conversation history if available
      conversationHistory.forEach(msg => {
        messages.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });

      // Add current user message
      messages.push({
        role: "user",
        content: `Patient input: "${symptoms}"\nPreferred language context: ${preferredLanguage}\nConversation context: ${conversationContext}\nIs follow-up response: ${isFollowUpResponse}`
      });

      const response = await fetch(`${this.baseURL}/openai/deployments/${this.deployment}/chat/completions?api-version=${this.apiVersion}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          messages,
          max_tokens: 1200,
          temperature: 0.7,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure OpenAI API Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your Azure OpenAI API key.');
        } else if (response.status === 404) {
          throw new Error('Deployment not found. Please check your Azure OpenAI endpoint and deployment name.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else if (response.status === 400) {
          // Check if it's a content filtering error
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.code === 'content_filter') {
              throw new Error('Your message was filtered by content policy. Please rephrase your symptoms using medical terminology and avoid any potentially sensitive language.');
            }
          } catch (parseError) {
            // If we can't parse the error, fall back to generic message
          }
          throw new Error('Bad request. Please check your API configuration or rephrase your message.');
        } else {
          throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from Azure OpenAI API');
      }

      const analysis = JSON.parse(content) as TriageAnalysis;
      
      // Validate the response structure
      if (!this.validateAnalysis(analysis)) {
        throw new Error('Invalid response structure from AI');
      }

      // Normalize language names to match our frontend expectations
      analysis.detectedLanguage = this.normalizeLanguageName(analysis.detectedLanguage);

      return analysis;
    } catch (error) {
      console.error('Azure OpenAI API Error:', error);
      
      // Re-throw API errors
      if (error instanceof Error && error.message.includes('API')) {
        throw error;
      }
      
      // Fallback analysis if parsing fails
      return this.getFallbackAnalysis(symptoms, preferredLanguage);
    }
  }

  private normalizeLanguageName(language: string): string {
    const normalized = language.toLowerCase();
    if (normalized.includes('bengali') || normalized.includes('bangla')) return 'bangla';
    if (normalized.includes('hindi')) return 'hindi';
    if (normalized.includes('arabic')) return 'arabic';
    if (normalized.includes('tamil')) return 'tamil';
    return 'english';
  }

  private validateAnalysis(analysis: any): analysis is TriageAnalysis {
    return (
      typeof analysis === 'object' &&
      typeof analysis.translatedText === 'string' &&
      Array.isArray(analysis.clinicalIndicators) &&
      typeof analysis.triageLevel === 'number' &&
      analysis.triageLevel >= 1 &&
      analysis.triageLevel <= 5 &&
      typeof analysis.explanation === 'string' &&
      typeof analysis.confidence === 'number' &&
      typeof analysis.detectedLanguage === 'string' &&
      typeof analysis.conversationalResponse === 'string' &&
      typeof analysis.isFinalAssessment === 'boolean' &&
      Array.isArray(analysis.nextSteps) &&
      Array.isArray(analysis.culturalConsiderations) &&
      typeof analysis.communicationStyle === 'string' &&
      typeof analysis.familyInvolvement === 'string' &&
      typeof analysis.fallbackMechanism === 'object' &&
      typeof analysis.fallbackMechanism.isActivated === 'boolean' &&
      typeof analysis.fallbackMechanism.reason === 'string' &&
      typeof analysis.fallbackMechanism.alternativeApproach === 'string'
    );
  }

  private getFallbackAnalysis(symptoms: string, preferredLanguage: string): TriageAnalysis {
    // Enhanced fallback analysis with cultural considerations
    const urgentKeywords = ['chest pain', 'difficulty breathing', 'unconscious', 'severe bleeding', 'heart attack', 'stroke', 'seizure'];
    const moderateKeywords = ['fever', 'pain', 'nausea', 'vomiting', 'headache', 'dizziness'];
    
    const symptomsLower = symptoms.toLowerCase();
    const hasUrgent = urgentKeywords.some(keyword => symptomsLower.includes(keyword));
    const hasModerate = moderateKeywords.some(keyword => symptomsLower.includes(keyword));
    
    let triageLevel = 5;
    let indicators: string[] = [];
    let explanation = '';
    let conversationalResponse = '';
    let followUpQuestions: string[] = [];
    let culturalConsiderations: string[] = [];
    let communicationStyle = '';
    let familyInvolvement = '';
    let religiousConsiderations = '';
    
    // Set cultural considerations based on language
    switch (preferredLanguage) {
      case 'arabic':
        culturalConsiderations = ['Islamic cultural sensitivity', 'Family involvement in decisions', 'Modesty considerations', 'Religious expressions'];
        communicationStyle = 'Formal, respectful tone with Islamic cultural expressions';
        familyInvolvement = 'Family consultation and involvement is culturally expected';
        religiousConsiderations = 'Consider Islamic practices and use appropriate religious expressions';
        break;
      case 'bangla':
        culturalConsiderations = ['Respect for elders', 'Family hierarchy', 'Economic concerns', 'Traditional medicine awareness'];
        communicationStyle = 'Warm, family-inclusive, respectful of traditions';
        familyInvolvement = 'Strong family involvement in healthcare decisions expected';
        religiousConsiderations = 'Consider Islamic or Hindu practices as applicable';
        break;
      case 'hindi':
        culturalConsiderations = ['Family decision-making', 'Traditional medicine respect', 'Religious dietary restrictions', 'Social considerations'];
        communicationStyle = 'Respectful, family-centered, culturally aware';
        familyInvolvement = 'Family consultation is important in healthcare decisions';
        religiousConsiderations = 'Consider Hindu, Sikh, or other religious practices';
        break;
      case 'tamil':
        culturalConsiderations = ['Strong family involvement', 'Traditional Siddha medicine', 'Cultural pride', 'Vegetarian considerations'];
        communicationStyle = 'Respectful, tradition-aware, family-inclusive';
        familyInvolvement = 'Family involvement is crucial in healthcare decisions';
        religiousConsiderations = 'Consider Hindu practices and dietary restrictions';
        break;
      default:
        culturalConsiderations = ['Individual autonomy', 'Diverse cultural backgrounds', 'Direct communication'];
        communicationStyle = 'Professional, clear, patient-centered';
        familyInvolvement = 'Individual decision-making with optional family involvement';
        religiousConsiderations = 'Consider diverse religious backgrounds as needed';
    }
    
    if (hasUrgent) {
      triageLevel = 2;
      indicators = ['Potentially serious symptoms', 'Requires prompt assessment'];
      explanation = 'Patient presents with symptoms that may indicate a serious condition requiring prompt medical evaluation.';
      conversationalResponse = "I understand you're experiencing concerning symptoms that require urgent medical attention. To help assess your condition, I need to ask you a few important questions.";
      followUpQuestions = ["How long have you been experiencing these symptoms?", "Have the symptoms gotten worse since they started?"];
    } else if (hasModerate) {
      triageLevel = 4;
      indicators = ['Moderate symptoms', 'Standard assessment'];
      explanation = 'Patient presents with moderate symptoms that require timely medical evaluation.';
      conversationalResponse = "Thank you for describing your symptoms. To provide appropriate medical guidance, I need to gather some additional information.";
      followUpQuestions = ["When did these symptoms first start?", "How would you rate your discomfort?"];
    } else {
      triageLevel = 5;
      indicators = ['Mild symptoms', 'Routine assessment'];
      explanation = 'Patient presents with symptoms suitable for routine medical care.';
      conversationalResponse = "I understand you're seeking medical attention for your symptoms. To provide appropriate guidance, I need to ask you some questions about your condition.";
      followUpQuestions = ["How long have you been feeling this way?", "Is there anything that makes the symptoms better or worse?"];
    }

    return {
      detectedLanguage: preferredLanguage,
      translatedText: symptoms,
      clinicalIndicators: indicators,
      triageLevel,
      explanation,
      confidence: 75,
      conversationalResponse,
      followUpQuestions,
      isFinalAssessment: false,
      nextSteps: ["Please remain comfortable while we gather more information", "Let medical staff know if symptoms change"],
      culturalConsiderations,
      communicationStyle,
      familyInvolvement,
      religiousConsiderations,
      fallbackMechanism: {
        isActivated: true,
        reason: "AI service unavailable, using cultural-aware fallback system",
        alternativeApproach: "Providing culturally-sensitive basic triage assessment with appropriate cultural considerations"
      }
    };
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const openaiService = new OpenAIService();
export type { TriageAnalysis };