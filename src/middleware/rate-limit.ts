import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

interface Bucket {
  count: number;
  resetAt: number;
}

export function registerRateLimit(app: FastifyInstance, maxPerMinute = 120): void {
  const buckets = new Map<string, Bucket>();

  app.addHook("preHandler", async (req: FastifyRequest, reply: FastifyReply) => {
    const key = req.ip;
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + 60_000 };
      buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (bucket.count > maxPerMinute) {
      return reply.code(429).send({ error: "rate limit exceeded" });
    }
  });
}
