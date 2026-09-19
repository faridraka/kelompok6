export const healthController = {
  check: (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  },
};
