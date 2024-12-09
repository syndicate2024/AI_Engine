import { beforeAll, vi } from 'vitest';

const mockOpenAI = {
    chat: {
        completions: {
            create: vi.fn()
        }
    }
};

// Export for use in tests
export { mockOpenAI };

beforeAll(() => {
    vi.mock('openai', () => ({
        default: vi.fn().mockImplementation(() => mockOpenAI)
    }));
}); 