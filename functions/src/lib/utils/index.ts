type ClassConstructor<T> = new (...args: any[]) => T;

export function singletonify<T extends ClassConstructor<any>>(jsClass: T): T {
  let instance: T | null = null;

  return new Proxy(jsClass, {
    construct(target, argumentsList) {
      if (!instance) {
        instance = new target(...argumentsList);
      }
      return instance as any;
    },
  });
}

export type GraphqlErrorItem = {
  message: string;
  extensions?: { code: string; requestId: string }[];
};

export class GraphqlError extends Error {
  errors?: GraphqlErrorItem[];
  constructor({
    message,
    errors,
  }: {
    errors: GraphqlErrorItem[];
    message?: string;
  }) {
    super(message ?? "GraphQL Error!");
    this.errors = errors;
  }
}

export function chunkify<T>(items: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}
