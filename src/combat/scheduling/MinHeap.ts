// ═══════════════════════════════════════════════════════════════════════════
// MONTRÉAL 2033 — MOTEUR DE COMBAT INSPIRÉ DE FINAL FANTASY
// Tas Binaire Min-Heap Générique pour File de Priorité CTB
// ═══════════════════════════════════════════════════════════════════════════

export interface HeapItem<T> {
  key: number; // Valeur de priorité (plus petit = plus prioritaire)
  data: T;
}

export class MinHeap<T> {
  private heap: HeapItem<T>[] = [];

  constructor(items?: HeapItem<T>[]) {
    if (items) {
      for (const item of items) {
        this.push(item.key, item.data);
      }
    }
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public peek(): HeapItem<T> | null {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  public push(key: number, data: T): void {
    this.heap.push({ key, data });
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): HeapItem<T> | null {
    if (this.heap.length === 0) return null;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  public toArray(): HeapItem<T>[] {
    return [...this.heap];
  }

  public clone(): MinHeap<T> {
    const next = new MinHeap<T>();
    next.heap = this.heap.map(item => ({ key: item.key, data: item.data }));
    return next;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].key >= this.heap[parentIndex].key) break;
      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left].key < this.heap[smallest].key) {
        smallest = left;
      }
      if (right < length && this.heap[right].key < this.heap[smallest].key) {
        smallest = right;
      }

      if (smallest === index) break;
      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }
}
