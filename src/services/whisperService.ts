interface WhisperTranscription {
  text: string;
  language?: string;
}

class WhisperService {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_WHISPER_API_KEY || '';
    this.endpoint = import.meta.env.VITE_WHISPER_API_ENDPOINT || '';
    
    if (!this.apiKey || !this.endpoint) {
      console.warn('Azure Whisper API credentials not found. Voice transcription will not be available.');
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<WhisperTranscription> {
    if (!this.apiKey || !this.endpoint) {
      throw new Error('Azure Whisper API credentials are required for voice transcription.');
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Azure Whisper API Error:', response.status, errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid Whisper API key. Please check your Azure Whisper API credentials.');
        } else if (response.status === 404) {
          throw new Error('Whisper endpoint not found. Please check your Azure Whisper API endpoint.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(`Azure Whisper API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      
      return {
        text: data.text || '',
        language: data.language
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.endpoint);
  }
}

export const whisperService = new WhisperService();
export type { WhisperTranscription };