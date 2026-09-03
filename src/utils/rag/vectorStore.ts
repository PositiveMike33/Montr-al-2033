import fs from 'fs';
import path from 'path';

export interface VectorRecord {
  id: string;
  text: string;
  embedding: number[];
  metadata: any;
  timestamp: number;
}

export class SimpleVectorStore {
  private records: VectorRecord[] = [];
  private filePath: string;

  constructor(filename: string = 'memory_vault.json') {
    this.filePath = path.join(process.cwd(), filename);
    this.load();
  }

  private load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.records = JSON.parse(data);
        console.log('[VECTOR STORE] Loaded memories from vault.');
      } catch (e) {
        console.error('[VECTOR STORE] Error loading vault', e);
      }
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.records, null, 2));
    } catch (e) {
      console.error('[VECTOR STORE] Error saving vault', e);
    }
  }

  // Add a new memory
  public async addMemory(text: string, metadata: any = {}) {
    const embedding = await this.getEmbedding(text);
    if (!embedding) return;

    const record: VectorRecord = {
      id: Date.now().toString() + Math.random().toString(36).substring(7),
      text,
      embedding,
      metadata,
      timestamp: Date.now()
    };

    this.records.push(record);
    this.save();
    console.log('[VECTOR STORE] Memory saved.');
  }

  // Cosine Similarity
  private cosineSimilarity(vecA: number[], vecB: number[]) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Search memories
  public async search(query: string, topK: number = 3): Promise<VectorRecord[]> {
    if (this.records.length === 0) return [];
    
    const queryEmbedding = await this.getEmbedding(query);
    if (!queryEmbedding) return [];

    const scored = this.records.map(record => ({
      record,
      score: this.cosineSimilarity(queryEmbedding, record.embedding)
    }));

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    
    // Return top K that have a decent relevance score (>0.3)
    return scored.filter(s => s.score > 0.3).slice(0, topK).map(s => s.record);
  }

  // Fetch embedding from dedicated cluster container (Snowflake Arctic Embed on port 11436)
  private async getEmbedding(text: string): Promise<number[] | null> {
    const endpoints = [
      { url: 'http://127.0.0.1:11436/api/embeddings', model: 'snowflake-arctic-embed:latest' },
      { url: 'http://127.0.0.1:11438/api/embeddings', model: 'nomic-embed-text:latest' },
      { url: 'http://127.0.0.1:11434/api/embeddings', model: 'mxbai-embed-large' }
    ];

    for (const ep of endpoints) {
      try {
        const response = await fetch(ep.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: ep.model,
            prompt: text
          })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.embedding && Array.isArray(data.embedding)) {
            return data.embedding;
          }
        }
      } catch {
        // Fallback to next embedding node
      }
    }

    console.warn('[VECTOR STORE] All embedding endpoints unavailable.');
    return null;
  }
}

export const memoryVault = new SimpleVectorStore();
