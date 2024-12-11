// @ai-protected
// Test Environment Setup

import { vi } from 'vitest';

export function setupTestEnv() {
    // Mock environment variables
    process.env.NODE_ENV = 'test';
    process.env.AI_MODEL = 'test-model';
    
    // Reset all mocks before each test
    vi.resetAllMocks();
    
    // Mock global objects if needed
    global.console = {
        ...console,
        error: vi.fn(),
        warn: vi.fn(),
        log: vi.fn(),
    };
    
    // Return cleanup function
    return () => {
        vi.resetAllMocks();
        delete process.env.AI_MODEL;
    };
}
