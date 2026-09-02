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
        console.log(`[VECTOR STORE] Loaded ${this.records.length} memories from vault.`);
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
    console.log(`[VECTOR STORE] Memory saved: "${text.substring(0, 30)}..."`);
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

  // Fetch embedding from local Ollama
  private async getEmbedding(text: string): Promise<number[] | null> {
    try {
      const response = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mxbai-embed-large',
          prompt: text
        })
      });
      if (!response.ok) throw new Error('Ollama embedding failed');
      
      const data = await response.json();
      return data.embedding;
    } catch (error) {
      console.error('[VECTOR STORE] Failed to fetch embedding:', error);
      return null;
    }
  }
}

export const memoryVault = new SimpleVectorStore();
