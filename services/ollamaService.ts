
export class OllamaService {
  private baseUrl = 'http://localhost:11434/api';

  async chat(prompt: string, systemInstruction: string, model: string = 'llama3') {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: systemInstruction,
          stream: false
        })
      });
      
      if (!response.ok) throw new Error('Ollama service unreachable');
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama connection failed. Is it running?', error);
      throw new Error('Please ensure Ollama is running locally on port 11434.');
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }
}
