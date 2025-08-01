import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validServiceConfig, validTeamResponse } from "../../mocks.js";
import { rateLimit } from "./index.js";

const SLIDING_WINDOW_SECONDS = 10;

const mockRedis = {
  expire: vi.fn(),
  incrby: vi.fn(),
  mget: vi.fn(),
};

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current time to a fixed value
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not rate limit if limitPerSecond is 0", async () => {
    const result = await rateLimit({
      limitPerSecond: 0,
      redis: mockRedis,
      serviceConfig: validServiceConfig,
      team: validTeamResponse,
    });

    expect(result).toEqual({
      rateLimit: 0,
      rateLimited: false,
      requestCount: 1,
    });
    expect(mockRedis.mget).not.toHaveBeenCalled();
  });

  it("should check last 10 seconds of requests", async () => {
    const currentSecond = Math.floor(Date.now() / 1000);
    mockRedis.mget.mockResolvedValue([
      null, // current second
      "5",
      null,
      "3",
      "1",
      null,
      "17",
      null,
      "5",
      null,
    ]);

    const result = await rateLimit({
      limitPerSecond: 10,
      redis: mockRedis,
      serviceConfig: validServiceConfig,
      team: validTeamResponse,
    });

    // Verify correct keys are checked
    const expectedKeys = Array.from(
      { length: SLIDING_WINDOW_SECONDS },
      (_, i) => `rate-limit:storage:1:s_${currentSecond - i}`,
    );
    expect(mockRedis.mget).toHaveBeenCalledWith(expectedKeys);

    expect(result.requestCount).toBe(32);
    expect(result.rateLimit).toBe(100);
    expect(result.rateLimited).toBe(false);
  });

  it("should rate limit when total count exceeds limit", async () => {
    // 101 total requests
    mockRedis.mget.mockResolvedValue(["50", "51"]);

    const result = await rateLimit({
      limitPerSecond: 10,
      redis: mockRedis,
      serviceConfig: validServiceConfig,
      team: validTeamResponse,
    });

    expect(result).toMatchObject({
      errorCode: "RATE_LIMIT_EXCEEDED",
      rateLimit: 100,
      rateLimited: true,
      requestCount: 101,
      status: 429,
    });
  });

  it("should set expiry only when current second count is 0", async () => {
    // First case: current second has no requests
    mockRedis.mget.mockResolvedValueOnce([null, ...Array(9).fill("5")]);
    await rateLimit({
      limitPerSecond: 10,
      redis: mockRedis,
      serviceConfig: validServiceConfig,
      team: validTeamResponse,
    });
    expect(mockRedis.expire).toHaveBeenCalled();

    mockRedis.expire.mockClear();

    // Second case: current second already has requests
    mockRedis.mget.mockResolvedValueOnce(["5", ...Array(9).fill("5")]);
    await rateLimit({
      limitPerSecond: 10,
      redis: mockRedis,
      serviceConfig: validServiceConfig,
      team: validTeamResponse,
    });
    expect(mockRedis.expire).not.toHaveBeenCalled();
  });

  it("should increment by the amount provided", async () => {
    mockRedis.mget.mockResolvedValueOnce(["5"]);
    const result = await rateLimit({
      increment: 3,
      limitPerSecond: 10,
      redis: mockRedis,
      serviceConfig: validServiceConfig,
      team: validTeamResponse,
    });
    expect(mockRedis.incrby).toHaveBeenCalledWith(expect.anything(), 3);
    expect(result.requestCount).toBe(8);
  });
});
