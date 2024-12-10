import { beforeAll, vi } from 'vitest';
import { ResponseType } from '../src/types';

interface Message {
    role: string;
    content: string;
}

// Mock environment variables
const mockEnv = {
    // OpenAI Configuration
    OPENAI_API_KEY: 'sk-test-key-12345',

    // Environment
    NODE_ENV: 'test',
    PORT: '3000',

    // API Configuration
    MAX_REQUESTS_PER_MINUTE: '60',
    ENABLE_RATE_LIMITING: 'true',

    // Model Configuration
    DEFAULT_MODEL: 'gpt-4',
    FALLBACK_MODEL: 'gpt-3.5-turbo',
    MODEL_TEMPERATURE: '0.7',
    MAX_TOKENS: '2048',

    // Logging
    LOG_LEVEL: 'debug',
    LOG_FORMAT: 'text',

    // Security
    CORS_ORIGINS: 'http://localhost:3000',

    // Cache Configuration
    CACHE_TTL: '3600',
    ENABLE_CACHE: 'true'
};

// Mock responses for different scenarios
const mockResponses = {
    default: {
        content: 'Here is a detailed explanation of React hooks and context. Hooks like useEffect are commonly used for side effects, while context provides a way to share state across components without prop drilling. Redux is another popular state management solution that works well with React.',
        type: ResponseType.CONCEPT_EXPLANATION,
        followUpQuestions: ['How do hooks compare to class lifecycle methods?', 'When should you use Context vs Redux?'],
        additionalResources: ['React Hooks Documentation', 'Redux vs Context API'],
        codeSnippets: [
            'const [state, setState] = useState(initialState);',
            'useEffect(() => { /* effect */ }, [dependency]);',
            'const MyContext = React.createContext(defaultValue);'
        ]
    },
    error: {
        error: new Error('API Error')
    },
    timeout: {
        error: new Error('Network timeout')
    }
};

// Mock OpenAI client
const mockOpenAI = {
    chat: {
        completions: {
            create: vi.fn().mockImplementation(({ messages }: { messages: Message[] }) => {
                const userMessage = messages.find(m => m.role === 'user')?.content || '';
                const systemMessage = messages.find(m => m.role === 'system')?.content || '';
                const response = {
                    content: mockResponses.default.content,
                    type: ResponseType.CONCEPT_EXPLANATION,
                    followUpQuestions: mockResponses.default.followUpQuestions,
                    additionalResources: mockResponses.default.additionalResources,
                    codeSnippets: mockResponses.default.codeSnippets
                };

                // Handle security-related queries
                if (userMessage.toLowerCase().includes('xss') || userMessage.toLowerCase().includes('security') || systemMessage.toLowerCase().includes('security')) {
                    response.content = 'When handling user input in React, always sanitize and escape content to prevent XSS attacks. Use dangerouslySetInnerHTML with caution as it can expose security risks. Consider using DOMPurify or other sanitization libraries.';
                    response.codeSnippets = [
                        '// Dangerous - avoid this\nconst MyComponent = () => {\n  return <div dangerouslySetInnerHTML={{ __html: userInput }} />;\n}',
                        '// Safe - use sanitization\nimport DOMPurify from "dompurify";\n\nconst MyComponent = () => {\n  const sanitizedHtml = DOMPurify.sanitize(userInput);\n  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;\n}'
                    ];
                }

                // Handle eval security warning
                if (userMessage.toLowerCase().includes('eval')) {
                    response.content = 'Using eval() in JavaScript poses serious security risks and should be avoided. It can execute malicious code and create vulnerabilities in your application.';
                }

                // Handle performance optimization
                if (userMessage.toLowerCase().includes('optimize') || userMessage.toLowerCase().includes('performance')) {
                    response.content = 'To optimize React performance, use memoization techniques like useMemo and useCallback. React.memo can prevent unnecessary re-renders of components.';
                    response.codeSnippets = [
                        'const memoizedValue = useMemo(() => computeExpensive(a, b), [a, b]);',
                        'const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);'
                    ];
                }

                // Handle complexity analysis
                if (userMessage.toLowerCase().includes('complexity') || userMessage.toLowerCase().includes('sorting')) {
                    response.content = 'Array sorting in JavaScript typically uses a hybrid sorting algorithm with O(n log n) complexity. Understanding complexity helps in performance optimization.';
                }

                // Handle async/await pitfalls
                if (userMessage.toLowerCase().includes('mistake') || userMessage.toLowerCase().includes('async/await')) {
                    response.content = 'Common mistakes with async/await include forgetting error handling, not using try/catch blocks, and creating race conditions. Avoid these pitfalls for robust code.';
                }

                // Handle promise error handling
                if (userMessage.toLowerCase().includes('error') && userMessage.toLowerCase().includes('promise')) {
                    response.content = 'Always handle Promise rejections properly using try/catch or .catch()';
                    response.codeSnippets = [
                        'try {\n  const result = await asyncFunction();\n} catch (error) {\n  handleError(error);\n}',
                        'asyncFunction()\n  .then(result => handleSuccess(result))\n  .catch(error => handleError(error));'
                    ];
                }

                // Handle browser compatibility
                if (userMessage.toLowerCase().includes('browser') || userMessage.toLowerCase().includes('fetch')) {
                    response.content = 'The Fetch API has broad browser support but may need polyfills for older browsers. Check browser compatibility and provide fallbacks.';
                }

                // Handle polyfills and transpilation
                if (userMessage.toLowerCase().includes('javascript features')) {
                    response.content = 'When using new JavaScript features, use Babel for transpilation and include necessary polyfills to ensure cross-browser compatibility.';
                }

                // Handle empty responses
                if (userMessage === '') {
                    return {
                        choices: [{ message: { content: '' } }]
                    };
                }

                // Handle malformed responses
                if (userMessage.includes('malformed')) {
                    return {
                        choices: [{ message: { content: 'invalid json' } }]
                    };
                }

                // Default response structure
                return {
                    choices: [{
                        message: {
                            content: `Here's the explanation:
                                ${response.content}
                                
                                Code examples:
                                ${response.codeSnippets?.map(snippet => '```typescript\n' + snippet + '\n```').join('\n\n') || ''}`
                        }
                    }]
                };
            })
        }
    }
};

// Mock environment setup
beforeAll(() => {
    // Mock environment variables
    process.env = { ...mockEnv };

    // Mock OpenAI client
    vi.mock('openai', () => ({
        default: class {
            constructor() {
                return mockOpenAI;
            }
        }
    }));

    // Mock environment module
    vi.mock('../src/config/env', () => ({
        default: mockEnv,
        envSchema: {
            safeParse: (input: Record<string, unknown>) => {
                const errors: Array<{ message: string }> = [];
                const data: Record<string, unknown> = {
                    NODE_ENV: 'development',
                    PORT: 3000,
                    MAX_REQUESTS_PER_MINUTE: 60,
                    DEFAULT_MODEL: 'gpt-4',
                    FALLBACK_MODEL: 'gpt-3.5-turbo',
                    MODEL_TEMPERATURE: 0.7,
                    MAX_TOKENS: 2048,
                    LOG_LEVEL: 'info',
                    LOG_FORMAT: 'text',
                    ENABLE_RATE_LIMITING: true,
                    CORS_ORIGINS: ['http://localhost:3000'],
                    CACHE_TTL: 3600,
                    ENABLE_CACHE: true
                };

                // Validate OpenAI API Key
                if (!input.OPENAI_API_KEY) {
                    errors.push({ message: 'Required' });
                } else {
                    const apiKey = input.OPENAI_API_KEY;
                    if (typeof apiKey !== 'string' || 
                        apiKey.trim() !== apiKey || 
                        !apiKey.startsWith('sk-') || 
                        !/^sk-[a-zA-Z0-9-]+$/.test(apiKey) ||
                        apiKey.length < 20 || 
                        apiKey.length > 100) {
                        errors.push({ message: 'Invalid OpenAI API key format' });
                    } else {
                        data.OPENAI_API_KEY = apiKey;
                    }
                }

                // Validate NODE_ENV
                if (input.NODE_ENV !== undefined) {
                    if (!['development', 'test', 'production'].includes(input.NODE_ENV as string)) {
                        errors.push({ message: 'Invalid NODE_ENV' });
                    } else {
                        data.NODE_ENV = input.NODE_ENV;
                    }
                }

                // Validate MAX_REQUESTS_PER_MINUTE
                if (input.MAX_REQUESTS_PER_MINUTE !== undefined) {
                    const rate = Number(input.MAX_REQUESTS_PER_MINUTE);
                    if (isNaN(rate) || rate <= 0 || rate > 1000) {
                        errors.push({ message: 'Invalid MAX_REQUESTS_PER_MINUTE' });
                    } else {
                        data.MAX_REQUESTS_PER_MINUTE = rate;
                    }
                }

                // Validate MODEL_TEMPERATURE
                if (input.MODEL_TEMPERATURE !== undefined) {
                    const temp = Number(input.MODEL_TEMPERATURE);
                    if (isNaN(temp) || temp < 0 || temp > 2) {
                        errors.push({ message: 'Invalid MODEL_TEMPERATURE' });
                    } else {
                        data.MODEL_TEMPERATURE = temp;
                    }
                }

                // Validate DEFAULT_MODEL
                if (input.DEFAULT_MODEL !== undefined) {
                    if (!['gpt-4', 'gpt-3.5-turbo'].includes(input.DEFAULT_MODEL as string)) {
                        errors.push({ message: 'Invalid DEFAULT_MODEL' });
                    } else {
                        data.DEFAULT_MODEL = input.DEFAULT_MODEL;
                    }
                }

                if (errors.length > 0) {
                    return {
                        success: false,
                        error: { issues: errors }
                    };
                }

                return {
                    success: true,
                    data
                };
            }
        }
    }));
});

// Export mocks for test usage
export { mockOpenAI, mockResponses }; 