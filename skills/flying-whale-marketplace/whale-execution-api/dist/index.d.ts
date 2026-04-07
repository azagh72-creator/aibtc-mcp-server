import { Hono } from 'hono';
import type { X402Context } from './x402-middleware';
type Env = {
    RECIPIENT_ADDRESS: string;
    NETWORK: string;
    RELAY_URL: string;
};
type Variables = {
    x402?: X402Context;
};
declare const app: Hono<{
    Bindings: Env;
    Variables: Variables;
}, import("hono/types").BlankSchema, "/">;
export default app;
//# sourceMappingURL=index.d.ts.map