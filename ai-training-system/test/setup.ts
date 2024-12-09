import { beforeAll, vi } from 'vitest';
import { ResponseType } from '../src/types';

// Mock responses for different scenarios
const mockResponses = {
    default: {
        content: `This is a detailed explanation about using JavaScript Promises with React's useEffect hook.
        Promises are essential for handling async operations, and useEffect is perfect for managing side effects.
        
        Here's an example of using async code with useEffect:
        \`\`\`javascript
        useEffect(() => {
            async function fetchData() {
                const result = await Promise.resolve('data');
                console.log(result);
            }
            fetchData();
        }, []);
        \`\`\`
        
        Some follow-up questions to consider:
        1. How does error handling work with async useEffect?
        2. What are the best practices for using Promises in React?
        3. Can you explain the cleanup function in useEffect?`
    },
    stateManagement: {
        content: `React hooks, context, and Redux are essential tools for state management in large applications.
        Context provides a way to pass data through the component tree without prop drilling, while Redux offers
        a more robust solution for complex state management needs.
        
        Here's an example using both Context and hooks:
        \`\`\`javascript
        const value = useContext(MyContext);
        const [state, dispatch] = useReducer(reducer, initialState);
        \`\`\`
        
        Some follow-up questions to consider:
        1. When should you choose Context over Redux?
        2. How do hooks integrate with Redux?
        3. What are the performance implications of each approach?`
    },
    reduxContext: {
        content: `When comparing Redux and Context, there are several key differences to consider.
        Redux provides a centralized store and powerful middleware system, while Context is more
        lightweight and built into React. The choice between them depends on your specific needs.
        
        Here's a comparison example:
        \`\`\`javascript
        // Redux approach
        const state = useSelector(state => state.data);
        
        // Context approach
        const value = useContext(DataContext);
        \`\`\`
        
        Some follow-up questions to consider:
        1. How does Redux handle performance at scale?
        2. When is Context the better choice?
        3. Can you use both together effectively?`
    }
};

// Mock OpenAI client with dynamic response selection
const mockOpenAI = {
    chat: {
        completions: {
            create: vi.fn().mockImplementation(({ messages }) => {
                const userMessage = messages.find(m => m.role === 'user')?.content || '';
                let responseContent = mockResponses.default.content;

                // Select appropriate mock response based on the query
                if (userMessage.toLowerCase().includes('redux') || userMessage.toLowerCase().includes('context')) {
                    if (userMessage.toLowerCase().includes('compare')) {
                        responseContent = mockResponses.reduxContext.content;
                    } else {
                        responseContent = mockResponses.stateManagement.content;
                    }
                }

                return Promise.resolve({
                    id: 'mock-id',
                    choices: [{
                        message: {
                            content: responseContent,
                            role: 'assistant'
                        }
                    }]
                });
            })
        }
    }
};

// Export mock data and utilities for tests
export { mockOpenAI, mockResponses };

// Setup global mocks
beforeAll(() => {
    // Mock OpenAI
    vi.mock('openai', () => ({
        default: vi.fn().mockImplementation(() => mockOpenAI)
    }));

    // Mock environment variables
    process.env.OPENAI_API_KEY = 'mock-api-key';
}); 