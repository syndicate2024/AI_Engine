"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatOpenAI = exports._convertMessagesToOpenAIParams = exports.messageToOpenAIRole = void 0;
const openai_1 = require("openai");
const messages_1 = require("@langchain/core/messages");
const outputs_1 = require("@langchain/core/outputs");
const env_1 = require("@langchain/core/utils/env");
const chat_models_1 = require("@langchain/core/language_models/chat_models");
const base_1 = require("@langchain/core/language_models/base");
const runnables_1 = require("@langchain/core/runnables");
const output_parsers_1 = require("@langchain/core/output_parsers");
const openai_tools_1 = require("@langchain/core/output_parsers/openai_tools");
const zod_to_json_schema_1 = require("zod-to-json-schema");
const zod_1 = require("openai/helpers/zod");
const azure_js_1 = require("./utils/azure.cjs");
const openai_js_1 = require("./utils/openai.cjs");
const openai_format_fndef_js_1 = require("./utils/openai-format-fndef.cjs");
const tools_js_1 = require("./utils/tools.cjs");
function extractGenericMessageCustomRole(message) {
    if (message.role !== "system" &&
        message.role !== "assistant" &&
        message.role !== "user" &&
        message.role !== "function" &&
        message.role !== "tool") {
        console.warn(`Unknown message role: ${message.role}`);
    }
    return message.role;
}
function messageToOpenAIRole(message) {
    const type = message._getType();
    switch (type) {
        case "system":
            return "system";
        case "ai":
            return "assistant";
        case "human":
            return "user";
        case "function":
            return "function";
        case "tool":
            return "tool";
        case "generic": {
            if (!messages_1.ChatMessage.isInstance(message))
                throw new Error("Invalid generic chat message");
            return extractGenericMessageCustomRole(message);
        }
        default:
            throw new Error(`Unknown message type: ${type}`);
    }
}
exports.messageToOpenAIRole = messageToOpenAIRole;
function openAIResponseToChatMessage(message, rawResponse, includeRawResponse) {
    const rawToolCalls = message.tool_calls;
    switch (message.role) {
        case "assistant": {
            const toolCalls = [];
            const invalidToolCalls = [];
            for (const rawToolCall of rawToolCalls ?? []) {
                try {
                    toolCalls.push((0, openai_tools_1.parseToolCall)(rawToolCall, { returnId: true }));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                }
                catch (e) {
                    invalidToolCalls.push((0, openai_tools_1.makeInvalidToolCall)(rawToolCall, e.message));
                }
            }
            const additional_kwargs = {
                function_call: message.function_call,
                tool_calls: rawToolCalls,
            };
            if (includeRawResponse !== undefined) {
                additional_kwargs.__raw_response = rawResponse;
            }
            let response_metadata;
            if (rawResponse.system_fingerprint) {
                response_metadata = {
                    usage: { ...rawResponse.usage },
                    system_fingerprint: rawResponse.system_fingerprint,
                };
            }
            if (message.audio) {
                additional_kwargs.audio = message.audio;
            }
            return new messages_1.AIMessage({
                content: message.content || "",
                tool_calls: toolCalls,
                invalid_tool_calls: invalidToolCalls,
                additional_kwargs,
                response_metadata,
                id: rawResponse.id,
            });
        }
        default:
            return new messages_1.ChatMessage(message.content || "", message.role ?? "unknown");
    }
}
function _convertDeltaToMessageChunk(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delta, rawResponse, defaultRole, includeRawResponse) {
    const role = delta.role ?? defaultRole;
    const content = delta.content ?? "";
    let additional_kwargs;
    if (delta.function_call) {
        additional_kwargs = {
            function_call: delta.function_call,
        };
    }
    else if (delta.tool_calls) {
        additional_kwargs = {
            tool_calls: delta.tool_calls,
        };
    }
    else {
        additional_kwargs = {};
    }
    if (includeRawResponse) {
        additional_kwargs.__raw_response = rawResponse;
    }
    if (delta.audio) {
        additional_kwargs.audio = {
            ...delta.audio,
            index: rawResponse.choices[0].index,
        };
    }
    const response_metadata = { usage: { ...rawResponse.usage } };
    if (role === "user") {
        return new messages_1.HumanMessageChunk({ content, response_metadata });
    }
    else if (role === "assistant") {
        const toolCallChunks = [];
        if (Array.isArray(delta.tool_calls)) {
            for (const rawToolCall of delta.tool_calls) {
                toolCallChunks.push({
                    name: rawToolCall.function?.name,
                    args: rawToolCall.function?.arguments,
                    id: rawToolCall.id,
                    index: rawToolCall.index,
                    type: "tool_call_chunk",
                });
            }
        }
        return new messages_1.AIMessageChunk({
            content,
            tool_call_chunks: toolCallChunks,
            additional_kwargs,
            id: rawResponse.id,
            response_metadata,
        });
    }
    else if (role === "system") {
        return new messages_1.SystemMessageChunk({ content, response_metadata });
    }
    else if (role === "function") {
        return new messages_1.FunctionMessageChunk({
            content,
            additional_kwargs,
            name: delta.name,
            response_metadata,
        });
    }
    else if (role === "tool") {
        return new messages_1.ToolMessageChunk({
            content,
            additional_kwargs,
            tool_call_id: delta.tool_call_id,
            response_metadata,
        });
    }
    else {
        return new messages_1.ChatMessageChunk({ content, role, response_metadata });
    }
}
// Used in LangSmith, export is important here
function _convertMessagesToOpenAIParams(messages) {
    // TODO: Function messages do not support array content, fix cast
    return messages.flatMap((message) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const completionParam = {
            role: messageToOpenAIRole(message),
            content: message.content,
        };
        if (message.name != null) {
            completionParam.name = message.name;
        }
        if (message.additional_kwargs.function_call != null) {
            completionParam.function_call = message.additional_kwargs.function_call;
            completionParam.content = null;
        }
        if ((0, messages_1.isAIMessage)(message) && !!message.tool_calls?.length) {
            completionParam.tool_calls = message.tool_calls.map(openai_tools_1.convertLangChainToolCallToOpenAI);
            completionParam.content = null;
        }
        else {
            if (message.additional_kwargs.tool_calls != null) {
                completionParam.tool_calls = message.additional_kwargs.tool_calls;
            }
            if (message.tool_call_id != null) {
                completionParam.tool_call_id = message.tool_call_id;
            }
        }
        if (message.additional_kwargs.audio &&
            typeof message.additional_kwargs.audio === "object" &&
            "id" in message.additional_kwargs.audio) {
            const audioMessage = {
                role: "assistant",
                audio: {
                    id: message.additional_kwargs.audio.id,
                },
            };
            return [completionParam, audioMessage];
        }
        return completionParam;
    });
}
exports._convertMessagesToOpenAIParams = _convertMessagesToOpenAIParams;
function _convertChatOpenAIToolTypeToOpenAITool(tool, fields) {
    if ((0, base_1.isOpenAITool)(tool)) {
        if (fields?.strict !== undefined) {
            return {
                ...tool,
                function: {
                    ...tool.function,
                    strict: fields.strict,
                },
            };
        }
        return tool;
    }
    return (0, tools_js_1._convertToOpenAITool)(tool, fields);
}
/**
 * OpenAI chat model integration.
 *
 * Setup:
 * Install `@langchain/openai` and set an environment variable named `OPENAI_API_KEY`.
 *
 * ```bash
 * npm install @langchain/openai
 * export OPENAI_API_KEY="your-api-key"
 * ```
 *
 * ## [Constructor args](https://api.js.langchain.com/classes/langchain_openai.ChatOpenAI.html#constructor)
 *
 * ## [Runtime args](https://api.js.langchain.com/interfaces/langchain_openai.ChatOpenAICallOptions.html)
 *
 * Runtime args can be passed as the second argument to any of the base runnable methods `.invoke`. `.stream`, `.batch`, etc.
 * They can also be passed via `.bind`, or the second arg in `.bindTools`, like shown in the examples below:
 *
 * ```typescript
 * // When calling `.bind`, call options should be passed via the first argument
 * const llmWithArgsBound = llm.bind({
 *   stop: ["\n"],
 *   tools: [...],
 * });
 *
 * // When calling `.bindTools`, call options should be passed via the second argument
 * const llmWithTools = llm.bindTools(
 *   [...],
 *   {
 *     tool_choice: "auto",
 *   }
 * );
 * ```
 *
 * ## Examples
 *
 * <details open>
 * <summary><strong>Instantiate</strong></summary>
 *
 * ```typescript
 * import { ChatOpenAI } from '@langchain/openai';
 *
 * const llm = new ChatOpenAI({
 *   model: "gpt-4o",
 *   temperature: 0,
 *   maxTokens: undefined,
 *   timeout: undefined,
 *   maxRetries: 2,
 *   // apiKey: "...",
 *   // baseUrl: "...",
 *   // organization: "...",
 *   // other params...
 * });
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Invoking</strong></summary>
 *
 * ```typescript
 * const input = `Translate "I love programming" into French.`;
 *
 * // Models also accept a list of chat messages or a formatted prompt
 * const result = await llm.invoke(input);
 * console.log(result);
 * ```
 *
 * ```txt
 * AIMessage {
 *   "id": "chatcmpl-9u4Mpu44CbPjwYFkTbeoZgvzB00Tz",
 *   "content": "J'adore la programmation.",
 *   "response_metadata": {
 *     "tokenUsage": {
 *       "completionTokens": 5,
 *       "promptTokens": 28,
 *       "totalTokens": 33
 *     },
 *     "finish_reason": "stop",
 *     "system_fingerprint": "fp_3aa7262c27"
 *   },
 *   "usage_metadata": {
 *     "input_tokens": 28,
 *     "output_tokens": 5,
 *     "total_tokens": 33
 *   }
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Streaming Chunks</strong></summary>
 *
 * ```typescript
 * for await (const chunk of await llm.stream(input)) {
 *   console.log(chunk);
 * }
 * ```
 *
 * ```txt
 * AIMessageChunk {
 *   "id": "chatcmpl-9u4NWB7yUeHCKdLr6jP3HpaOYHTqs",
 *   "content": ""
 * }
 * AIMessageChunk {
 *   "content": "J"
 * }
 * AIMessageChunk {
 *   "content": "'adore"
 * }
 * AIMessageChunk {
 *   "content": " la"
 * }
 * AIMessageChunk {
 *   "content": " programmation",,
 * }
 * AIMessageChunk {
 *   "content": ".",,
 * }
 * AIMessageChunk {
 *   "content": "",
 *   "response_metadata": {
 *     "finish_reason": "stop",
 *     "system_fingerprint": "fp_c9aa9c0491"
 *   },
 * }
 * AIMessageChunk {
 *   "content": "",
 *   "usage_metadata": {
 *     "input_tokens": 28,
 *     "output_tokens": 5,
 *     "total_tokens": 33
 *   }
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Aggregate Streamed Chunks</strong></summary>
 *
 * ```typescript
 * import { AIMessageChunk } from '@langchain/core/messages';
 * import { concat } from '@langchain/core/utils/stream';
 *
 * const stream = await llm.stream(input);
 * let full: AIMessageChunk | undefined;
 * for await (const chunk of stream) {
 *   full = !full ? chunk : concat(full, chunk);
 * }
 * console.log(full);
 * ```
 *
 * ```txt
 * AIMessageChunk {
 *   "id": "chatcmpl-9u4PnX6Fy7OmK46DASy0bH6cxn5Xu",
 *   "content": "J'adore la programmation.",
 *   "response_metadata": {
 *     "prompt": 0,
 *     "completion": 0,
 *     "finish_reason": "stop",
 *   },
 *   "usage_metadata": {
 *     "input_tokens": 28,
 *     "output_tokens": 5,
 *     "total_tokens": 33
 *   }
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Bind tools</strong></summary>
 *
 * ```typescript
 * import { z } from 'zod';
 *
 * const GetWeather = {
 *   name: "GetWeather",
 *   description: "Get the current weather in a given location",
 *   schema: z.object({
 *     location: z.string().describe("The city and state, e.g. San Francisco, CA")
 *   }),
 * }
 *
 * const GetPopulation = {
 *   name: "GetPopulation",
 *   description: "Get the current population in a given location",
 *   schema: z.object({
 *     location: z.string().describe("The city and state, e.g. San Francisco, CA")
 *   }),
 * }
 *
 * const llmWithTools = llm.bindTools(
 *   [GetWeather, GetPopulation],
 *   {
 *     // strict: true  // enforce tool args schema is respected
 *   }
 * );
 * const aiMsg = await llmWithTools.invoke(
 *   "Which city is hotter today and which is bigger: LA or NY?"
 * );
 * console.log(aiMsg.tool_calls);
 * ```
 *
 * ```txt
 * [
 *   {
 *     name: 'GetWeather',
 *     args: { location: 'Los Angeles, CA' },
 *     type: 'tool_call',
 *     id: 'call_uPU4FiFzoKAtMxfmPnfQL6UK'
 *   },
 *   {
 *     name: 'GetWeather',
 *     args: { location: 'New York, NY' },
 *     type: 'tool_call',
 *     id: 'call_UNkEwuQsHrGYqgDQuH9nPAtX'
 *   },
 *   {
 *     name: 'GetPopulation',
 *     args: { location: 'Los Angeles, CA' },
 *     type: 'tool_call',
 *     id: 'call_kL3OXxaq9OjIKqRTpvjaCH14'
 *   },
 *   {
 *     name: 'GetPopulation',
 *     args: { location: 'New York, NY' },
 *     type: 'tool_call',
 *     id: 'call_s9KQB1UWj45LLGaEnjz0179q'
 *   }
 * ]
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Structured Output</strong></summary>
 *
 * ```typescript
 * import { z } from 'zod';
 *
 * const Joke = z.object({
 *   setup: z.string().describe("The setup of the joke"),
 *   punchline: z.string().describe("The punchline to the joke"),
 *   rating: z.number().optional().describe("How funny the joke is, from 1 to 10")
 * }).describe('Joke to tell user.');
 *
 * const structuredLlm = llm.withStructuredOutput(Joke, {
 *   name: "Joke",
 *   strict: true, // Optionally enable OpenAI structured outputs
 * });
 * const jokeResult = await structuredLlm.invoke("Tell me a joke about cats");
 * console.log(jokeResult);
 * ```
 *
 * ```txt
 * {
 *   setup: 'Why was the cat sitting on the computer?',
 *   punchline: 'Because it wanted to keep an eye on the mouse!',
 *   rating: 7
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>JSON Object Response Format</strong></summary>
 *
 * ```typescript
 * const jsonLlm = llm.bind({ response_format: { type: "json_object" } });
 * const jsonLlmAiMsg = await jsonLlm.invoke(
 *   "Return a JSON object with key 'randomInts' and a value of 10 random ints in [0-99]"
 * );
 * console.log(jsonLlmAiMsg.content);
 * ```
 *
 * ```txt
 * {
 *   "randomInts": [23, 87, 45, 12, 78, 34, 56, 90, 11, 67]
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Multimodal</strong></summary>
 *
 * ```typescript
 * import { HumanMessage } from '@langchain/core/messages';
 *
 * const imageUrl = "https://example.com/image.jpg";
 * const imageData = await fetch(imageUrl).then(res => res.arrayBuffer());
 * const base64Image = Buffer.from(imageData).toString('base64');
 *
 * const message = new HumanMessage({
 *   content: [
 *     { type: "text", text: "describe the weather in this image" },
 *     {
 *       type: "image_url",
 *       image_url: { url: `data:image/jpeg;base64,${base64Image}` },
 *     },
 *   ]
 * });
 *
 * const imageDescriptionAiMsg = await llm.invoke([message]);
 * console.log(imageDescriptionAiMsg.content);
 * ```
 *
 * ```txt
 * The weather in the image appears to be clear and sunny. The sky is mostly blue with a few scattered white clouds, indicating fair weather. The bright sunlight is casting shadows on the green, grassy hill, suggesting it is a pleasant day with good visibility. There are no signs of rain or stormy conditions.
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Usage Metadata</strong></summary>
 *
 * ```typescript
 * const aiMsgForMetadata = await llm.invoke(input);
 * console.log(aiMsgForMetadata.usage_metadata);
 * ```
 *
 * ```txt
 * { input_tokens: 28, output_tokens: 5, total_tokens: 33 }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Logprobs</strong></summary>
 *
 * ```typescript
 * const logprobsLlm = new ChatOpenAI({ logprobs: true });
 * const aiMsgForLogprobs = await logprobsLlm.invoke(input);
 * console.log(aiMsgForLogprobs.response_metadata.logprobs);
 * ```
 *
 * ```txt
 * {
 *   content: [
 *     {
 *       token: 'J',
 *       logprob: -0.000050616763,
 *       bytes: [Array],
 *       top_logprobs: []
 *     },
 *     {
 *       token: "'",
 *       logprob: -0.01868736,
 *       bytes: [Array],
 *       top_logprobs: []
 *     },
 *     {
 *       token: 'ad',
 *       logprob: -0.0000030545007,
 *       bytes: [Array],
 *       top_logprobs: []
 *     },
 *     { token: 'ore', logprob: 0, bytes: [Array], top_logprobs: [] },
 *     {
 *       token: ' la',
 *       logprob: -0.515404,
 *       bytes: [Array],
 *       top_logprobs: []
 *     },
 *     {
 *       token: ' programm',
 *       logprob: -0.0000118755715,
 *       bytes: [Array],
 *       top_logprobs: []
 *     },
 *     { token: 'ation', logprob: 0, bytes: [Array], top_logprobs: [] },
 *     {
 *       token: '.',
 *       logprob: -0.0000037697225,
 *       bytes: [Array],
 *       top_logprobs: []
 *     }
 *   ],
 *   refusal: null
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Response Metadata</strong></summary>
 *
 * ```typescript
 * const aiMsgForResponseMetadata = await llm.invoke(input);
 * console.log(aiMsgForResponseMetadata.response_metadata);
 * ```
 *
 * ```txt
 * {
 *   tokenUsage: { completionTokens: 5, promptTokens: 28, totalTokens: 33 },
 *   finish_reason: 'stop',
 *   system_fingerprint: 'fp_3aa7262c27'
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>JSON Schema Structured Output</strong></summary>
 *
 * ```typescript
 * const llmForJsonSchema = new ChatOpenAI({
 *   model: "gpt-4o-2024-08-06",
 * }).withStructuredOutput(
 *   z.object({
 *     command: z.string().describe("The command to execute"),
 *     expectedOutput: z.string().describe("The expected output of the command"),
 *     options: z
 *       .array(z.string())
 *       .describe("The options you can pass to the command"),
 *   }),
 *   {
 *     method: "jsonSchema",
 *     strict: true, // Optional when using the `jsonSchema` method
 *   }
 * );
 *
 * const jsonSchemaRes = await llmForJsonSchema.invoke(
 *   "What is the command to list files in a directory?"
 * );
 * console.log(jsonSchemaRes);
 * ```
 *
 * ```txt
 * {
 *   command: 'ls',
 *   expectedOutput: 'A list of files and subdirectories within the specified directory.',
 *   options: [
 *     '-a: include directory entries whose names begin with a dot (.).',
 *     '-l: use a long listing format.',
 *     '-h: with -l, print sizes in human readable format (e.g., 1K, 234M, 2G).',
 *     '-t: sort by time, newest first.',
 *     '-r: reverse order while sorting.',
 *     '-S: sort by file size, largest first.',
 *     '-R: list subdirectories recursively.'
 *   ]
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Audio Outputs</strong></summary>
 *
 * ```typescript
 * import { ChatOpenAI } from "@langchain/openai";
 *
 * const modelWithAudioOutput = new ChatOpenAI({
 *   model: "gpt-4o-audio-preview",
 *   // You may also pass these fields to `.bind` as a call argument.
 *   modalities: ["text", "audio"], // Specifies that the model should output audio.
 *   audio: {
 *     voice: "alloy",
 *     format: "wav",
 *   },
 * });
 *
 * const audioOutputResult = await modelWithAudioOutput.invoke("Tell me a joke about cats.");
 * const castMessageContent = audioOutputResult.content[0] as Record<string, any>;
 *
 * console.log({
 *   ...castMessageContent,
 *   data: castMessageContent.data.slice(0, 100) // Sliced for brevity
 * })
 * ```
 *
 * ```txt
 * {
 *   id: 'audio_67117718c6008190a3afad3e3054b9b6',
 *   data: 'UklGRqYwBgBXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAATElTVBoAAABJTkZPSVNGVA4AAABMYXZmNTguMjkuMTAwAGRhdGFg',
 *   expires_at: 1729201448,
 *   transcript: 'Sure! Why did the cat sit on the computer? Because it wanted to keep an eye on the mouse!'
 * }
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 * <summary><strong>Audio Outputs</strong></summary>
 *
 * ```typescript
 * import { ChatOpenAI } from "@langchain/openai";
 *
 * const modelWithAudioOutput = new ChatOpenAI({
 *   model: "gpt-4o-audio-preview",
 *   // You may also pass these fields to `.bind` as a call argument.
 *   modalities: ["text", "audio"], // Specifies that the model should output audio.
 *   audio: {
 *     voice: "alloy",
 *     format: "wav",
 *   },
 * });
 *
 * const audioOutputResult = await modelWithAudioOutput.invoke("Tell me a joke about cats.");
 * const castAudioContent = audioOutputResult.additional_kwargs.audio as Record<string, any>;
 *
 * console.log({
 *   ...castAudioContent,
 *   data: castAudioContent.data.slice(0, 100) // Sliced for brevity
 * })
 * ```
 *
 * ```txt
 * {
 *   id: 'audio_67117718c6008190a3afad3e3054b9b6',
 *   data: 'UklGRqYwBgBXQVZFZm10IBAAAAABAAEAwF0AAIC7AAACABAATElTVBoAAABJTkZPSVNGVA4AAABMYXZmNTguMjkuMTAwAGRhdGFg',
 *   expires_at: 1729201448,
 *   transcript: 'Sure! Why did the cat sit on the computer? Because it wanted to keep an eye on the mouse!'
 * }
 * ```
 * </details>
 *
 * <br />
 */
class ChatOpenAI extends chat_models_1.BaseChatModel {
    static lc_name() {
        return "ChatOpenAI";
    }
    get callKeys() {
        return [
            ...super.callKeys,
            "options",
            "function_call",
            "functions",
            "tools",
            "tool_choice",
            "promptIndex",
            "response_format",
            "seed",
        ];
    }
    get lc_secrets() {
        return {
            openAIApiKey: "OPENAI_API_KEY",
            apiKey: "OPENAI_API_KEY",
            azureOpenAIApiKey: "AZURE_OPENAI_API_KEY",
            organization: "OPENAI_ORGANIZATION",
        };
    }
    get lc_aliases() {
        return {
            modelName: "model",
            openAIApiKey: "openai_api_key",
            apiKey: "openai_api_key",
            azureOpenAIApiVersion: "azure_openai_api_version",
            azureOpenAIApiKey: "azure_openai_api_key",
            azureOpenAIApiInstanceName: "azure_openai_api_instance_name",
            azureOpenAIApiDeploymentName: "azure_openai_api_deployment_name",
        };
    }
    constructor(fields, 
    /** @deprecated */
    configuration) {
        super(fields ?? {});
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "frequencyPenalty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "presencePenalty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "n", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        });
        Object.defineProperty(this, "logitBias", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "modelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "gpt-3.5-turbo"
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "gpt-3.5-turbo"
        });
        Object.defineProperty(this, "modelKwargs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stop", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stopSequences", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "user", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "streamUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "logprobs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topLogprobs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "openAIApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiVersion", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureADTokenProvider", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiInstanceName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIApiDeploymentName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIBasePath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "azureOpenAIEndpoint", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "organization", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "__includeRawResponse", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "clientConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Whether the model supports the `strict` argument when passing in tools.
         * If `undefined` the `strict` argument will not be passed to OpenAI.
         */
        Object.defineProperty(this, "supportsStrictToolCalling", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "audio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "modalities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.openAIApiKey =
            fields?.apiKey ??
                fields?.openAIApiKey ??
                fields?.configuration?.apiKey ??
                (0, env_1.getEnvironmentVariable)("OPENAI_API_KEY");
        this.apiKey = this.openAIApiKey;
        this.azureOpenAIApiKey =
            fields?.azureOpenAIApiKey ??
                (0, env_1.getEnvironmentVariable)("AZURE_OPENAI_API_KEY");
        this.azureADTokenProvider = fields?.azureADTokenProvider ?? undefined;
        if (!this.azureOpenAIApiKey && !this.apiKey && !this.azureADTokenProvider) {
            throw new Error("OpenAI or Azure OpenAI API key or Token Provider not found");
        }
        this.azureOpenAIApiInstanceName =
            fields?.azureOpenAIApiInstanceName ??
                (0, env_1.getEnvironmentVariable)("AZURE_OPENAI_API_INSTANCE_NAME");
        this.azureOpenAIApiDeploymentName =
            fields?.azureOpenAIApiDeploymentName ??
                (0, env_1.getEnvironmentVariable)("AZURE_OPENAI_API_DEPLOYMENT_NAME");
        this.azureOpenAIApiVersion =
            fields?.azureOpenAIApiVersion ??
                (0, env_1.getEnvironmentVariable)("AZURE_OPENAI_API_VERSION");
        this.azureOpenAIBasePath =
            fields?.azureOpenAIBasePath ??
                (0, env_1.getEnvironmentVariable)("AZURE_OPENAI_BASE_PATH");
        this.organization =
            fields?.configuration?.organization ??
                (0, env_1.getEnvironmentVariable)("OPENAI_ORGANIZATION");
        this.azureOpenAIEndpoint =
            fields?.azureOpenAIEndpoint ??
                (0, env_1.getEnvironmentVariable)("AZURE_OPENAI_ENDPOINT");
        this.modelName = fields?.model ?? fields?.modelName ?? this.model;
        this.model = this.modelName;
        this.modelKwargs = fields?.modelKwargs ?? {};
        this.timeout = fields?.timeout;
        this.temperature = fields?.temperature ?? this.temperature;
        this.topP = fields?.topP ?? this.topP;
        this.frequencyPenalty = fields?.frequencyPenalty ?? this.frequencyPenalty;
        this.presencePenalty = fields?.presencePenalty ?? this.presencePenalty;
        this.maxTokens = fields?.maxTokens;
        this.logprobs = fields?.logprobs;
        this.topLogprobs = fields?.topLogprobs;
        this.n = fields?.n ?? this.n;
        this.logitBias = fields?.logitBias;
        this.stop = fields?.stopSequences ?? fields?.stop;
        this.stopSequences = this?.stop;
        this.user = fields?.user;
        this.__includeRawResponse = fields?.__includeRawResponse;
        this.audio = fields?.audio;
        this.modalities = fields?.modalities;
        if (this.azureOpenAIApiKey || this.azureADTokenProvider) {
            if (!this.azureOpenAIApiInstanceName &&
                !this.azureOpenAIBasePath &&
                !this.azureOpenAIEndpoint) {
                throw new Error("Azure OpenAI API instance name not found");
            }
            if (!this.azureOpenAIApiDeploymentName && this.azureOpenAIBasePath) {
                const parts = this.azureOpenAIBasePath.split("/openai/deployments/");
                if (parts.length === 2) {
                    const [, deployment] = parts;
                    this.azureOpenAIApiDeploymentName = deployment;
                }
            }
            if (!this.azureOpenAIApiDeploymentName) {
                throw new Error("Azure OpenAI API deployment name not found");
            }
            if (!this.azureOpenAIApiVersion) {
                throw new Error("Azure OpenAI API version not found");
            }
            this.apiKey = this.apiKey ?? "";
            // Streaming usage is not supported by Azure deployments, so default to false
            this.streamUsage = false;
        }
        this.streaming = fields?.streaming ?? false;
        this.streamUsage = fields?.streamUsage ?? this.streamUsage;
        this.clientConfig = {
            apiKey: this.apiKey,
            organization: this.organization,
            baseURL: configuration?.basePath ?? fields?.configuration?.basePath,
            dangerouslyAllowBrowser: true,
            defaultHeaders: configuration?.baseOptions?.headers ??
                fields?.configuration?.baseOptions?.headers,
            defaultQuery: configuration?.baseOptions?.params ??
                fields?.configuration?.baseOptions?.params,
            ...configuration,
            ...fields?.configuration,
        };
        // If `supportsStrictToolCalling` is explicitly set, use that value.
        // Else leave undefined so it's not passed to OpenAI.
        if (fields?.supportsStrictToolCalling !== undefined) {
            this.supportsStrictToolCalling = fields.supportsStrictToolCalling;
        }
    }
    getLsParams(options) {
        const params = this.invocationParams(options);
        return {
            ls_provider: "openai",
            ls_model_name: this.model,
            ls_model_type: "chat",
            ls_temperature: params.temperature ?? undefined,
            ls_max_tokens: params.max_tokens ?? undefined,
            ls_stop: options.stop,
        };
    }
    bindTools(tools, kwargs) {
        let strict;
        if (kwargs?.strict !== undefined) {
            strict = kwargs.strict;
        }
        else if (this.supportsStrictToolCalling !== undefined) {
            strict = this.supportsStrictToolCalling;
        }
        return this.bind({
            tools: tools.map((tool) => _convertChatOpenAIToolTypeToOpenAITool(tool, { strict })),
            ...kwargs,
        });
    }
    createResponseFormat(resFormat) {
        if (resFormat &&
            resFormat.type === "json_schema" &&
            resFormat.json_schema.schema &&
            isZodSchema(resFormat.json_schema.schema)) {
            return (0, zod_1.zodResponseFormat)(resFormat.json_schema.schema, resFormat.json_schema.name, {
                description: resFormat.json_schema.description,
            });
        }
        return resFormat;
    }
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(options, extra) {
        let strict;
        if (options?.strict !== undefined) {
            strict = options.strict;
        }
        else if (this.supportsStrictToolCalling !== undefined) {
            strict = this.supportsStrictToolCalling;
        }
        let streamOptionsConfig = {};
        if (options?.stream_options !== undefined) {
            streamOptionsConfig = { stream_options: options.stream_options };
        }
        else if (this.streamUsage && (this.streaming || extra?.streaming)) {
            streamOptionsConfig = { stream_options: { include_usage: true } };
        }
        const params = {
            model: this.model,
            temperature: this.temperature,
            top_p: this.topP,
            frequency_penalty: this.frequencyPenalty,
            presence_penalty: this.presencePenalty,
            max_tokens: this.maxTokens === -1 ? undefined : this.maxTokens,
            logprobs: this.logprobs,
            top_logprobs: this.topLogprobs,
            n: this.n,
            logit_bias: this.logitBias,
            stop: options?.stop ?? this.stopSequences,
            user: this.user,
            // if include_usage is set or streamUsage then stream must be set to true.
            stream: this.streaming,
            functions: options?.functions,
            function_call: options?.function_call,
            tools: options?.tools?.length
                ? options.tools.map((tool) => _convertChatOpenAIToolTypeToOpenAITool(tool, { strict }))
                : undefined,
            tool_choice: (0, openai_js_1.formatToOpenAIToolChoice)(options?.tool_choice),
            response_format: this.createResponseFormat(options?.response_format),
            seed: options?.seed,
            ...streamOptionsConfig,
            parallel_tool_calls: options?.parallel_tool_calls,
            ...(this.audio || options?.audio
                ? { audio: this.audio || options?.audio }
                : {}),
            ...(this.modalities || options?.modalities
                ? { modalities: this.modalities || options?.modalities }
                : {}),
            ...this.modelKwargs,
        };
        if (options?.prediction !== undefined) {
            params.prediction = options.prediction;
        }
        return params;
    }
    /** @ignore */
    _identifyingParams() {
        return {
            model_name: this.model,
            ...this.invocationParams(),
            ...this.clientConfig,
        };
    }
    async *_streamResponseChunks(messages, options, runManager) {
        const messagesMapped = _convertMessagesToOpenAIParams(messages);
        const params = {
            ...this.invocationParams(options, {
                streaming: true,
            }),
            messages: messagesMapped,
            stream: true,
        };
        let defaultRole;
        const streamIterable = await this.completionWithRetry(params, options);
        let usage;
        for await (const data of streamIterable) {
            const choice = data?.choices?.[0];
            if (data.usage) {
                usage = data.usage;
            }
            if (!choice) {
                continue;
            }
            const { delta } = choice;
            if (!delta) {
                continue;
            }
            const chunk = _convertDeltaToMessageChunk(delta, data, defaultRole, this.__includeRawResponse);
            defaultRole = delta.role ?? defaultRole;
            const newTokenIndices = {
                prompt: options.promptIndex ?? 0,
                completion: choice.index ?? 0,
            };
            if (typeof chunk.content !== "string") {
                console.log("[WARNING]: Received non-string content from OpenAI. This is currently not supported.");
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const generationInfo = { ...newTokenIndices };
            if (choice.finish_reason != null) {
                generationInfo.finish_reason = choice.finish_reason;
                // Only include system fingerprint in the last chunk for now
                // to avoid concatenation issues
                generationInfo.system_fingerprint = data.system_fingerprint;
            }
            if (this.logprobs) {
                generationInfo.logprobs = choice.logprobs;
            }
            const generationChunk = new outputs_1.ChatGenerationChunk({
                message: chunk,
                text: chunk.content,
                generationInfo,
            });
            yield generationChunk;
            await runManager?.handleLLMNewToken(generationChunk.text ?? "", newTokenIndices, undefined, undefined, undefined, { chunk: generationChunk });
        }
        if (usage) {
            const inputTokenDetails = {
                ...(usage.prompt_tokens_details?.audio_tokens !== null && {
                    audio: usage.prompt_tokens_details?.audio_tokens,
                }),
                ...(usage.prompt_tokens_details?.cached_tokens !== null && {
                    cache_read: usage.prompt_tokens_details?.cached_tokens,
                }),
            };
            const outputTokenDetails = {
                ...(usage.completion_tokens_details?.audio_tokens !== null && {
                    audio: usage.completion_tokens_details?.audio_tokens,
                }),
                ...(usage.completion_tokens_details?.reasoning_tokens !== null && {
                    reasoning: usage.completion_tokens_details?.reasoning_tokens,
                }),
            };
            const generationChunk = new outputs_1.ChatGenerationChunk({
                message: new messages_1.AIMessageChunk({
                    content: "",
                    response_metadata: {
                        usage: { ...usage },
                    },
                    usage_metadata: {
                        input_tokens: usage.prompt_tokens,
                        output_tokens: usage.completion_tokens,
                        total_tokens: usage.total_tokens,
                        ...(Object.keys(inputTokenDetails).length > 0 && {
                            input_token_details: inputTokenDetails,
                        }),
                        ...(Object.keys(outputTokenDetails).length > 0 && {
                            output_token_details: outputTokenDetails,
                        }),
                    },
                }),
                text: "",
            });
            yield generationChunk;
        }
        if (options.signal?.aborted) {
            throw new Error("AbortError");
        }
    }
    /**
     * Get the identifying parameters for the model
     *
     */
    identifyingParams() {
        return this._identifyingParams();
    }
    /** @ignore */
    async _generate(messages, options, runManager) {
        const usageMetadata = {};
        const params = this.invocationParams(options);
        const messagesMapped = _convertMessagesToOpenAIParams(messages);
        if (params.stream) {
            const stream = this._streamResponseChunks(messages, options, runManager);
            const finalChunks = {};
            for await (const chunk of stream) {
                chunk.message.response_metadata = {
                    ...chunk.generationInfo,
                    ...chunk.message.response_metadata,
                };
                const index = chunk.generationInfo?.completion ?? 0;
                if (finalChunks[index] === undefined) {
                    finalChunks[index] = chunk;
                }
                else {
                    finalChunks[index] = finalChunks[index].concat(chunk);
                }
            }
            const generations = Object.entries(finalChunks)
                .sort(([aKey], [bKey]) => parseInt(aKey, 10) - parseInt(bKey, 10))
                .map(([_, value]) => value);
            const { functions, function_call } = this.invocationParams(options);
            // OpenAI does not support token usage report under stream mode,
            // fallback to estimation.
            const promptTokenUsage = await this.getEstimatedTokenCountFromPrompt(messages, functions, function_call);
            const completionTokenUsage = await this.getNumTokensFromGenerations(generations);
            usageMetadata.input_tokens = promptTokenUsage;
            usageMetadata.output_tokens = completionTokenUsage;
            usageMetadata.total_tokens = promptTokenUsage + completionTokenUsage;
            return {
                generations,
                llmOutput: {
                    estimatedTokenUsage: {
                        promptTokens: usageMetadata.input_tokens,
                        completionTokens: usageMetadata.output_tokens,
                        totalTokens: usageMetadata.total_tokens,
                    },
                },
            };
        }
        else {
            let data;
            if (options.response_format &&
                options.response_format.type === "json_schema") {
                data = await this.betaParsedCompletionWithRetry({
                    ...params,
                    stream: false,
                    messages: messagesMapped,
                }, {
                    signal: options?.signal,
                    ...options?.options,
                });
            }
            else {
                data = await this.completionWithRetry({
                    ...params,
                    stream: false,
                    messages: messagesMapped,
                }, {
                    signal: options?.signal,
                    ...options?.options,
                });
            }
            const { completion_tokens: completionTokens, prompt_tokens: promptTokens, total_tokens: totalTokens, prompt_tokens_details: promptTokensDetails, completion_tokens_details: completionTokensDetails, } = data?.usage ?? {};
            if (completionTokens) {
                usageMetadata.output_tokens =
                    (usageMetadata.output_tokens ?? 0) + completionTokens;
            }
            if (promptTokens) {
                usageMetadata.input_tokens =
                    (usageMetadata.input_tokens ?? 0) + promptTokens;
            }
            if (totalTokens) {
                usageMetadata.total_tokens =
                    (usageMetadata.total_tokens ?? 0) + totalTokens;
            }
            if (promptTokensDetails?.audio_tokens !== null ||
                promptTokensDetails?.cached_tokens !== null) {
                usageMetadata.input_token_details = {
                    ...(promptTokensDetails?.audio_tokens !== null && {
                        audio: promptTokensDetails?.audio_tokens,
                    }),
                    ...(promptTokensDetails?.cached_tokens !== null && {
                        cache_read: promptTokensDetails?.cached_tokens,
                    }),
                };
            }
            if (completionTokensDetails?.audio_tokens !== null ||
                completionTokensDetails?.reasoning_tokens !== null) {
                usageMetadata.output_token_details = {
                    ...(completionTokensDetails?.audio_tokens !== null && {
                        audio: completionTokensDetails?.audio_tokens,
                    }),
                    ...(completionTokensDetails?.reasoning_tokens !== null && {
                        reasoning: completionTokensDetails?.reasoning_tokens,
                    }),
                };
            }
            const generations = [];
            for (const part of data?.choices ?? []) {
                const text = part.message?.content ?? "";
                const generation = {
                    text,
                    message: openAIResponseToChatMessage(part.message ?? { role: "assistant" }, data, this.__includeRawResponse),
                };
                generation.generationInfo = {
                    ...(part.finish_reason ? { finish_reason: part.finish_reason } : {}),
                    ...(part.logprobs ? { logprobs: part.logprobs } : {}),
                };
                if ((0, messages_1.isAIMessage)(generation.message)) {
                    generation.message.usage_metadata = usageMetadata;
                }
                // Fields are not serialized unless passed to the constructor
                // Doing this ensures all fields on the message are serialized
                generation.message = new messages_1.AIMessage({
                    ...generation.message,
                });
                generations.push(generation);
            }
            return {
                generations,
                llmOutput: {
                    tokenUsage: {
                        promptTokens: usageMetadata.input_tokens,
                        completionTokens: usageMetadata.output_tokens,
                        totalTokens: usageMetadata.total_tokens,
                    },
                },
            };
        }
    }
    /**
     * Estimate the number of tokens a prompt will use.
     * Modified from: https://github.com/hmarr/openai-chat-tokens/blob/main/src/index.ts
     */
    async getEstimatedTokenCountFromPrompt(messages, functions, function_call) {
        // It appears that if functions are present, the first system message is padded with a trailing newline. This
        // was inferred by trying lots of combinations of messages and functions and seeing what the token counts were.
        let tokens = (await this.getNumTokensFromMessages(messages)).totalCount;
        // If there are functions, add the function definitions as they count towards token usage
        if (functions && function_call !== "auto") {
            const promptDefinitions = (0, openai_format_fndef_js_1.formatFunctionDefinitions)(functions);
            tokens += await this.getNumTokens(promptDefinitions);
            tokens += 9; // Add nine per completion
        }
        // If there's a system message _and_ functions are present, subtract four tokens. I assume this is because
        // functions typically add a system message, but reuse the first one if it's already there. This offsets
        // the extra 9 tokens added by the function definitions.
        if (functions && messages.find((m) => m._getType() === "system")) {
            tokens -= 4;
        }
        // If function_call is 'none', add one token.
        // If it's a FunctionCall object, add 4 + the number of tokens in the function name.
        // If it's undefined or 'auto', don't add anything.
        if (function_call === "none") {
            tokens += 1;
        }
        else if (typeof function_call === "object") {
            tokens += (await this.getNumTokens(function_call.name)) + 4;
        }
        return tokens;
    }
    /**
     * Estimate the number of tokens an array of generations have used.
     */
    async getNumTokensFromGenerations(generations) {
        const generationUsages = await Promise.all(generations.map(async (generation) => {
            if (generation.message.additional_kwargs?.function_call) {
                return (await this.getNumTokensFromMessages([generation.message]))
                    .countPerMessage[0];
            }
            else {
                return await this.getNumTokens(generation.message.content);
            }
        }));
        return generationUsages.reduce((a, b) => a + b, 0);
    }
    async getNumTokensFromMessages(messages) {
        let totalCount = 0;
        let tokensPerMessage = 0;
        let tokensPerName = 0;
        // From: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb
        if (this.model === "gpt-3.5-turbo-0301") {
            tokensPerMessage = 4;
            tokensPerName = -1;
        }
        else {
            tokensPerMessage = 3;
            tokensPerName = 1;
        }
        const countPerMessage = await Promise.all(messages.map(async (message) => {
            const textCount = await this.getNumTokens(message.content);
            const roleCount = await this.getNumTokens(messageToOpenAIRole(message));
            const nameCount = message.name !== undefined
                ? tokensPerName + (await this.getNumTokens(message.name))
                : 0;
            let count = textCount + tokensPerMessage + roleCount + nameCount;
            // From: https://github.com/hmarr/openai-chat-tokens/blob/main/src/index.ts messageTokenEstimate
            const openAIMessage = message;
            if (openAIMessage._getType() === "function") {
                count -= 2;
            }
            if (openAIMessage.additional_kwargs?.function_call) {
                count += 3;
            }
            if (openAIMessage?.additional_kwargs.function_call?.name) {
                count += await this.getNumTokens(openAIMessage.additional_kwargs.function_call?.name);
            }
            if (openAIMessage.additional_kwargs.function_call?.arguments) {
                try {
                    count += await this.getNumTokens(
                    // Remove newlines and spaces
                    JSON.stringify(JSON.parse(openAIMessage.additional_kwargs.function_call?.arguments)));
                }
                catch (error) {
                    console.error("Error parsing function arguments", error, JSON.stringify(openAIMessage.additional_kwargs.function_call));
                    count += await this.getNumTokens(openAIMessage.additional_kwargs.function_call?.arguments);
                }
            }
            totalCount += count;
            return count;
        }));
        totalCount += 3; // every reply is primed with <|start|>assistant<|message|>
        return { totalCount, countPerMessage };
    }
    async completionWithRetry(request, options) {
        const requestOptions = this._getClientOptions(options);
        return this.caller.call(async () => {
            try {
                const res = await this.client.chat.completions.create(request, requestOptions);
                return res;
            }
            catch (e) {
                const error = (0, openai_js_1.wrapOpenAIClientError)(e);
                throw error;
            }
        });
    }
    /**
     * Call the beta chat completions parse endpoint. This should only be called if
     * response_format is set to "json_object".
     * @param {OpenAIClient.Chat.ChatCompletionCreateParamsNonStreaming} request
     * @param {OpenAICoreRequestOptions | undefined} options
     */
    async betaParsedCompletionWithRetry(request, options
    // Avoid relying importing a beta type with no official entrypoint
    ) {
        const requestOptions = this._getClientOptions(options);
        return this.caller.call(async () => {
            try {
                const res = await this.client.beta.chat.completions.parse(request, requestOptions);
                return res;
            }
            catch (e) {
                const error = (0, openai_js_1.wrapOpenAIClientError)(e);
                throw error;
            }
        });
    }
    _getClientOptions(options) {
        if (!this.client) {
            const openAIEndpointConfig = {
                azureOpenAIApiDeploymentName: this.azureOpenAIApiDeploymentName,
                azureOpenAIApiInstanceName: this.azureOpenAIApiInstanceName,
                azureOpenAIApiKey: this.azureOpenAIApiKey,
                azureOpenAIBasePath: this.azureOpenAIBasePath,
                baseURL: this.clientConfig.baseURL,
                azureOpenAIEndpoint: this.azureOpenAIEndpoint,
            };
            const endpoint = (0, azure_js_1.getEndpoint)(openAIEndpointConfig);
            const params = {
                ...this.clientConfig,
                baseURL: endpoint,
                timeout: this.timeout,
                maxRetries: 0,
            };
            if (!params.baseURL) {
                delete params.baseURL;
            }
            this.client = new openai_1.OpenAI(params);
        }
        const requestOptions = {
            ...this.clientConfig,
            ...options,
        };
        if (this.azureOpenAIApiKey) {
            requestOptions.headers = {
                "api-key": this.azureOpenAIApiKey,
                ...requestOptions.headers,
            };
            requestOptions.query = {
                "api-version": this.azureOpenAIApiVersion,
                ...requestOptions.query,
            };
        }
        return requestOptions;
    }
    _llmType() {
        return "openai";
    }
    /** @ignore */
    _combineLLMOutput(...llmOutputs) {
        return llmOutputs.reduce((acc, llmOutput) => {
            if (llmOutput && llmOutput.tokenUsage) {
                acc.tokenUsage.completionTokens +=
                    llmOutput.tokenUsage.completionTokens ?? 0;
                acc.tokenUsage.promptTokens += llmOutput.tokenUsage.promptTokens ?? 0;
                acc.tokenUsage.totalTokens += llmOutput.tokenUsage.totalTokens ?? 0;
            }
            return acc;
        }, {
            tokenUsage: {
                completionTokens: 0,
                promptTokens: 0,
                totalTokens: 0,
            },
        });
    }
    withStructuredOutput(outputSchema, config) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let schema;
        let name;
        let method;
        let includeRaw;
        if (isStructuredOutputMethodParams(outputSchema)) {
            schema = outputSchema.schema;
            name = outputSchema.name;
            method = outputSchema.method;
            includeRaw = outputSchema.includeRaw;
        }
        else {
            schema = outputSchema;
            name = config?.name;
            method = config?.method;
            includeRaw = config?.includeRaw;
        }
        let llm;
        let outputParser;
        if (config?.strict !== undefined && method === "jsonMode") {
            throw new Error("Argument `strict` is only supported for `method` = 'function_calling'");
        }
        if (method === "jsonMode") {
            llm = this.bind({
                response_format: { type: "json_object" },
            });
            if (isZodSchema(schema)) {
                outputParser = output_parsers_1.StructuredOutputParser.fromZodSchema(schema);
            }
            else {
                outputParser = new output_parsers_1.JsonOutputParser();
            }
        }
        else if (method === "jsonSchema") {
            llm = this.bind({
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: name ?? "extract",
                        description: schema.description,
                        schema,
                        strict: config?.strict,
                    },
                },
            });
            if (isZodSchema(schema)) {
                outputParser = output_parsers_1.StructuredOutputParser.fromZodSchema(schema);
            }
            else {
                outputParser = new output_parsers_1.JsonOutputParser();
            }
        }
        else {
            let functionName = name ?? "extract";
            // Is function calling
            if (isZodSchema(schema)) {
                const asJsonSchema = (0, zod_to_json_schema_1.zodToJsonSchema)(schema);
                llm = this.bind({
                    tools: [
                        {
                            type: "function",
                            function: {
                                name: functionName,
                                description: asJsonSchema.description,
                                parameters: asJsonSchema,
                            },
                        },
                    ],
                    tool_choice: {
                        type: "function",
                        function: {
                            name: functionName,
                        },
                    },
                    // Do not pass `strict` argument to OpenAI if `config.strict` is undefined
                    ...(config?.strict !== undefined ? { strict: config.strict } : {}),
                });
                outputParser = new openai_tools_1.JsonOutputKeyToolsParser({
                    returnSingle: true,
                    keyName: functionName,
                    zodSchema: schema,
                });
            }
            else {
                let openAIFunctionDefinition;
                if (typeof schema.name === "string" &&
                    typeof schema.parameters === "object" &&
                    schema.parameters != null) {
                    openAIFunctionDefinition = schema;
                    functionName = schema.name;
                }
                else {
                    functionName = schema.title ?? functionName;
                    openAIFunctionDefinition = {
                        name: functionName,
                        description: schema.description ?? "",
                        parameters: schema,
                    };
                }
                llm = this.bind({
                    tools: [
                        {
                            type: "function",
                            function: openAIFunctionDefinition,
                        },
                    ],
                    tool_choice: {
                        type: "function",
                        function: {
                            name: functionName,
                        },
                    },
                    // Do not pass `strict` argument to OpenAI if `config.strict` is undefined
                    ...(config?.strict !== undefined ? { strict: config.strict } : {}),
                });
                outputParser = new openai_tools_1.JsonOutputKeyToolsParser({
                    returnSingle: true,
                    keyName: functionName,
                });
            }
        }
        if (!includeRaw) {
            return llm.pipe(outputParser);
        }
        const parserAssign = runnables_1.RunnablePassthrough.assign({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsed: (input, config) => outputParser.invoke(input.raw, config),
        });
        const parserNone = runnables_1.RunnablePassthrough.assign({
            parsed: () => null,
        });
        const parsedWithFallback = parserAssign.withFallbacks({
            fallbacks: [parserNone],
        });
        return runnables_1.RunnableSequence.from([
            {
                raw: llm,
            },
            parsedWithFallback,
        ]);
    }
}
exports.ChatOpenAI = ChatOpenAI;
function isZodSchema(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
input) {
    // Check for a characteristic method of Zod schemas
    return typeof input?.parse === "function";
}
function isStructuredOutputMethodParams(x
// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
    return (x !== undefined &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof x.schema ===
            "object");
}
