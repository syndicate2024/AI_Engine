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
                let response = {
                    content: mockResponses.default.content,
                    type: ResponseType.CONCEPT_EXPLANATION,
                    followUpQuestions: mockResponses.default.followUpQuestions,
                    additionalResources: mockResponses.default.additionalResources,
                    codeSnippets: mockResponses.default.codeSnippets
                };

                // Simulate different response scenarios based on input
                if (userMessage.includes('error')) {
                    throw mockResponses.error.error;
                }
                if (userMessage.includes('timeout')) {
                    throw mockResponses.timeout.error;
                }

                // Handle advanced/expert content
                if (userMessage.toLowerCase().includes('advanced') || userMessage.includes('ADVANCED')) {
                    response = {
                        content: 'Advanced React patterns include: Higher-Order Components (HOCs), Render Props, Custom Hooks, and advanced state management with Redux middleware.',
                        type: ResponseType.CONCEPT_EXPLANATION,
                        followUpQuestions: ['How do HOCs compare to Hooks?', 'When should you use Redux middleware?'],
                        additionalResources: ['React Advanced Patterns', 'Redux Middleware Guide'],
                        codeSnippets: [
                            '// Higher-Order Component Example\nconst withAuth = <P extends object>(Component: React.ComponentType<P>) => {\n  return class extends React.Component<P> {\n    // Implementation\n  };\n};',
                            '// Custom Hook Example\nconst useAuth = () => {\n  const [user, setUser] = useState<User | null>(null);\n  // Implementation\n  return { user, login, logout };\n};',
                            '// Redux Middleware Example\nconst loggingMiddleware = store => next => action => {\n  console.log(action);\n  return next(action);\n};'
                        ]
                    };
                }

                // Handle cross-topic questions
                if (userMessage.toLowerCase().includes('async') || userMessage.toLowerCase().includes('promise')) {
                    response = {
                        content: 'Promises and async/await are fundamental to JavaScript asynchronous programming. When used with React useEffect, they enable clean handling of side effects and data fetching.',
                        type: ResponseType.CONCEPT_EXPLANATION,
                        followUpQuestions: ['How do Promises work?', 'What are common useEffect patterns?'],
                        additionalResources: ['JavaScript Promises', 'React useEffect Guide'],
                        codeSnippets: [
                            'const fetchData = async () => {\n  const response = await fetch(url);\n  return response.json();\n};',
                            'useEffect(() => {\n  const getData = async () => {\n    const data = await fetchData();\n    setState(data);\n  };\n  getData();\n}, []);'
                        ]
                    };
                }

                // Handle complex questions
                if (userMessage.toLowerCase().includes('complex') || userMessage.toLowerCase().includes('redux') || userMessage.toLowerCase().includes('context')) {
                    response = {
                        content: 'React state management involves multiple patterns and tools. Redux provides centralized state management with actions and reducers, while Context API offers simpler prop drilling prevention.',
                        type: ResponseType.CONCEPT_EXPLANATION,
                        followUpQuestions: ['When should you use Redux?', 'How does Context compare to Redux?'],
                        additionalResources: ['Redux Documentation', 'React Context Guide'],
                        codeSnippets: [
                            '// Redux Store Setup\nconst store = configureStore({\n  reducer: rootReducer\n});',
                            '// Context Setup\nconst MyContext = React.createContext(defaultValue);\n\nfunction Provider({ children }) {\n  const [state, setState] = useState(initialState);\n  return <MyContext.Provider value={{ state, setState }}>{children}</MyContext.Provider>;\n}'
                        ]
                    };
                }

                // Handle skill level transitions
                if (userMessage.toLowerCase().includes('what is react')) {
                    const skillLevel = messages.find(m => m.role === 'system')?.content.toLowerCase() || '';
                    if (skillLevel.includes('advanced')) {
                        response.codeSnippets = [
                            '// Advanced React Component\nconst MyComponent = React.memo(({ data }) => {\n  const memoizedValue = useMemo(() => computeExpensiveValue(data), [data]);\n  return <div>{memoizedValue}</div>;\n});'
                        ];
                    } else if (skillLevel.includes('intermediate')) {
                        response.codeSnippets = [
                            '// React Component with Hooks\nfunction MyComponent() {\n  const [state, setState] = useState(initialState);\n  useEffect(() => {\n    // Side effect\n  }, []);\n  return <div>{state}</div>;\n}'
                        ];
                    } else {
                        response.codeSnippets = [
                            '// Basic React Component\nfunction MyComponent() {\n  return <div>Hello World</div>;\n}'
                        ];
                    }
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
                            content: response.content
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