/* eslint-disable @typescript-eslint/no-explicit-any */
import { AIMessage, AIMessageChunk, ChatMessage, ChatMessageChunk, FunctionMessageChunk, HumanMessageChunk, isAIMessage, ToolMessageChunk, } from "@langchain/core/messages";
import { BaseChatModel, } from "@langchain/core/language_models/chat_models";
import { ChatGenerationChunk, } from "@langchain/core/outputs";
import { AsyncCaller } from "@langchain/core/utils/async_caller";
import { convertLangChainToolCallToOpenAI, makeInvalidToolCall, parseToolCall, } from "@langchain/core/output_parsers/openai_tools";
import { RunnablePassthrough, RunnableSequence, } from "@langchain/core/runnables";
import { JsonOutputParser, StructuredOutputParser, } from "@langchain/core/output_parsers";
import { isZodSchema } from "@langchain/core/utils/types";
import { zodToJsonSchema } from "zod-to-json-schema";
import { _convertToolCallIdToMistralCompatible, authenticateAndSetInstance, WatsonxToolsOutputParser, } from "../utils/ibm.js";
function _convertToValidToolId(model, tool_call_id) {
    if (model.startsWith("mistralai"))
        return _convertToolCallIdToMistralCompatible(tool_call_id);
    else
        return tool_call_id;
}
function _convertToolToWatsonxTool(tools) {
    return tools.map((tool) => {
        if ("type" in tool) {
            return tool;
        }
        return {
            type: "function",
            function: {
                name: tool.name,
                description: tool.description ?? "Tool: " + tool.name,
                parameters: zodToJsonSchema(tool.schema),
            },
        };
    });
}
function _convertMessagesToWatsonxMessages(messages, model) {
    const getRole = (role) => {
        switch (role) {
            case "human":
                return "user";
            case "ai":
                return "assistant";
            case "system":
                return "system";
            case "tool":
                return "tool";
            case "function":
                return "function";
            default:
                throw new Error(`Unknown message type: ${role}`);
        }
    };
    const getTools = (message) => {
        if (isAIMessage(message) && message.tool_calls?.length) {
            return message.tool_calls
                .map((toolCall) => ({
                ...toolCall,
                id: _convertToValidToolId(model, toolCall.id ?? ""),
            }))
                .map(convertLangChainToolCallToOpenAI);
        }
        return undefined;
    };
    return messages.map((message) => {
        const toolCalls = getTools(message);
        const content = toolCalls === undefined ? message.content : "";
        if ("tool_call_id" in message && typeof message.tool_call_id === "string") {
            return {
                role: getRole(message._getType()),
                content,
                name: message.name,
                tool_call_id: _convertToValidToolId(model, message.tool_call_id),
            };
        }
        return {
            role: getRole(message._getType()),
            content,
            tool_calls: toolCalls,
        };
    });
}
function _watsonxResponseToChatMessage(choice, rawDataId, usage) {
    const { message } = choice;
    if (!message)
        throw new Error("No message presented");
    const rawToolCalls = message.tool_calls ?? [];
    switch (message.role) {
        case "assistant": {
            const toolCalls = [];
            const invalidToolCalls = [];
            for (const rawToolCall of rawToolCalls) {
                try {
                    const parsed = parseToolCall(rawToolCall, { returnId: true });
                    toolCalls.push(parsed);
                }
                catch (e) {
                    invalidToolCalls.push(makeInvalidToolCall(rawToolCall, e.message));
                }
            }
            const additional_kwargs = {
                tool_calls: rawToolCalls.map((toolCall) => ({
                    ...toolCall,
                    type: "function",
                })),
            };
            return new AIMessage({
                id: rawDataId,
                content: message.content ?? "",
                tool_calls: toolCalls,
                invalid_tool_calls: invalidToolCalls,
                additional_kwargs,
                usage_metadata: usage
                    ? {
                        input_tokens: usage.prompt_tokens ?? 0,
                        output_tokens: usage.completion_tokens ?? 0,
                        total_tokens: usage.total_tokens ?? 0,
                    }
                    : undefined,
            });
        }
        default:
            return new ChatMessage(message.content ?? "", message.role ?? "unknown");
    }
}
function _convertDeltaToMessageChunk(delta, rawData, model, usage, defaultRole) {
    if (delta.refusal)
        throw new Error(delta.refusal);
    const rawToolCalls = delta.tool_calls?.length
        ? delta.tool_calls?.map((toolCall, index) => ({
            ...toolCall,
            index,
            id: _convertToValidToolId(model, toolCall.id),
            type: "function",
        }))
        : undefined;
    let role = "assistant";
    if (delta.role) {
        role = delta.role;
    }
    else if (defaultRole) {
        role = defaultRole;
    }
    const content = delta.content ?? "";
    let additional_kwargs;
    if (rawToolCalls) {
        additional_kwargs = {
            tool_calls: rawToolCalls,
        };
    }
    else {
        additional_kwargs = {};
    }
    if (role === "user") {
        return new HumanMessageChunk({ content });
    }
    else if (role === "assistant") {
        const toolCallChunks = [];
        if (rawToolCalls && rawToolCalls.length > 0)
            for (const rawToolCallChunk of rawToolCalls) {
                toolCallChunks.push({
                    name: rawToolCallChunk.function?.name,
                    args: rawToolCallChunk.function?.arguments,
                    id: rawToolCallChunk.id,
                    index: rawToolCallChunk.index,
                    type: "tool_call_chunk",
                });
            }
        return new AIMessageChunk({
            content,
            tool_call_chunks: toolCallChunks,
            additional_kwargs,
            usage_metadata: {
                input_tokens: usage?.prompt_tokens ?? 0,
                output_tokens: usage?.completion_tokens ?? 0,
                total_tokens: usage?.total_tokens ?? 0,
            },
            id: rawData.id,
        });
    }
    else if (role === "tool") {
        if (rawToolCalls)
            return new ToolMessageChunk({
                content,
                additional_kwargs,
                tool_call_id: _convertToValidToolId(model, rawToolCalls?.[0].id),
            });
    }
    else if (role === "function") {
        return new FunctionMessageChunk({
            content,
            additional_kwargs,
        });
    }
    else {
        return new ChatMessageChunk({ content, role });
    }
    return null;
}
function _convertToolChoiceToWatsonxToolChoice(toolChoice) {
    if (typeof toolChoice === "string") {
        if (toolChoice === "any" || toolChoice === "required") {
            return { toolChoiceOption: "required" };
        }
        else if (toolChoice === "auto" || toolChoice === "none") {
            return { toolChoiceOption: toolChoice };
        }
        else {
            return {
                toolChoice: {
                    type: "function",
                    function: { name: toolChoice },
                },
            };
        }
    }
    else if ("type" in toolChoice)
        return { toolChoice };
    else
        throw new Error(`Unrecognized tool_choice type. Expected string or TextChatParameterTools. Recieved ${toolChoice}`);
}
export class ChatWatsonx extends BaseChatModel {
    static lc_name() {
        return "ChatWatsonx";
    }
    get lc_secrets() {
        return {
            authenticator: "AUTHENTICATOR",
            apiKey: "WATSONX_AI_APIKEY",
            apikey: "WATSONX_AI_APIKEY",
            watsonxAIAuthType: "WATSONX_AI_AUTH_TYPE",
            watsonxAIApikey: "WATSONX_AI_APIKEY",
            watsonxAIBearerToken: "WATSONX_AI_BEARER_TOKEN",
            watsonxAIUsername: "WATSONX_AI_USERNAME",
            watsonxAIPassword: "WATSONX_AI_PASSWORD",
            watsonxAIUrl: "WATSONX_AI_URL",
        };
    }
    get lc_aliases() {
        return {
            authenticator: "authenticator",
            apikey: "watsonx_ai_apikey",
            apiKey: "watsonx_ai_apikey",
            watsonxAIAuthType: "watsonx_ai_auth_type",
            watsonxAIApikey: "watsonx_ai_apikey",
            watsonxAIBearerToken: "watsonx_ai_bearer_token",
            watsonxAIUsername: "watsonx_ai_username",
            watsonxAIPassword: "watsonx_ai_password",
            watsonxAIUrl: "watsonx_ai_url",
        };
    }
    getLsParams(options) {
        const params = this.invocationParams(options);
        return {
            ls_provider: "watsonx",
            ls_model_name: this.model,
            ls_model_type: "chat",
            ls_temperature: params.temperature ?? undefined,
            ls_max_tokens: params.maxTokens ?? undefined,
        };
    }
    constructor(fields) {
        super(fields);
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "version", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "2024-05-31"
        });
        Object.defineProperty(this, "maxTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxRetries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "serviceUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "spaceId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "projectId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "frequencyPenalty", {
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
        Object.defineProperty(this, "n", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "presencePenalty", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxConcurrency", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "service", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "responseFormat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        if ((fields.projectId && fields.spaceId) ||
            (fields.idOrName && fields.projectId) ||
            (fields.spaceId && fields.idOrName))
            throw new Error("Maximum 1 id type can be specified per instance");
        if (!fields.projectId && !fields.spaceId && !fields.idOrName)
            throw new Error("No id specified! At least id of 1 type has to be specified");
        this.projectId = fields?.projectId;
        this.spaceId = fields?.spaceId;
        this.temperature = fields?.temperature;
        this.maxRetries = fields?.maxRetries || this.maxRetries;
        this.maxConcurrency = fields?.maxConcurrency;
        this.frequencyPenalty = fields?.frequencyPenalty;
        this.topLogprobs = fields?.topLogprobs;
        this.maxTokens = fields?.maxTokens ?? this.maxTokens;
        this.presencePenalty = fields?.presencePenalty;
        this.topP = fields?.topP;
        this.timeLimit = fields?.timeLimit;
        this.responseFormat = fields?.responseFormat ?? this.responseFormat;
        this.serviceUrl = fields?.serviceUrl;
        this.streaming = fields?.streaming ?? this.streaming;
        this.n = fields?.n ?? this.n;
        this.model = fields?.model ?? this.model;
        this.version = fields?.version ?? this.version;
        const { watsonxAIApikey, watsonxAIAuthType, watsonxAIBearerToken, watsonxAIUsername, watsonxAIPassword, watsonxAIUrl, version, serviceUrl, } = fields;
        const auth = authenticateAndSetInstance({
            watsonxAIApikey,
            watsonxAIAuthType,
            watsonxAIBearerToken,
            watsonxAIUsername,
            watsonxAIPassword,
            watsonxAIUrl,
            version,
            serviceUrl,
        });
        if (auth)
            this.service = auth;
        else
            throw new Error("You have not provided one type of authentication");
    }
    _llmType() {
        return "watsonx";
    }
    invocationParams(options) {
        const params = {
            maxTokens: options.maxTokens ?? this.maxTokens,
            temperature: options?.temperature ?? this.temperature,
            timeLimit: options?.timeLimit ?? this.timeLimit,
            topP: options?.topP ?? this.topP,
            presencePenalty: options?.presencePenalty ?? this.presencePenalty,
            n: options?.n ?? this.n,
            topLogprobs: options?.topLogprobs ?? this.topLogprobs,
            logprobs: options?.logprobs ?? this?.logprobs,
            frequencyPenalty: options?.frequencyPenalty ?? this.frequencyPenalty,
            tools: options.tools
                ? _convertToolToWatsonxTool(options.tools)
                : undefined,
            responseFormat: options.responseFormat,
        };
        const toolChoiceResult = options.tool_choice
            ? _convertToolChoiceToWatsonxToolChoice(options.tool_choice)
            : {};
        return { ...params, ...toolChoiceResult };
    }
    bindTools(tools, kwargs) {
        return this.bind({
            tools: _convertToolToWatsonxTool(tools),
            ...kwargs,
        });
    }
    scopeId() {
        if (this.projectId)
            return { projectId: this.projectId, modelId: this.model };
        else
            return { spaceId: this.spaceId, modelId: this.model };
    }
    async completionWithRetry(callback, options) {
        const caller = new AsyncCaller({
            maxConcurrency: options?.maxConcurrency || this.maxConcurrency,
            maxRetries: this.maxRetries,
        });
        const result = options
            ? caller.callWithOptions({
                signal: options.signal,
            }, async () => callback())
            : caller.call(async () => callback());
        return result;
    }
    async _generate(messages, options, runManager) {
        if (this.streaming) {
            const stream = this._streamResponseChunks(messages, options, runManager);
            const finalChunks = {};
            let tokenUsage = {
                input_tokens: 0,
                output_tokens: 0,
                total_tokens: 0,
            };
            const tokenUsages = [];
            for await (const chunk of stream) {
                const message = chunk.message;
                if (message?.usage_metadata) {
                    const completion = chunk.generationInfo?.completion;
                    if (tokenUsages[completion])
                        tokenUsages[completion].output_tokens =
                            message.usage_metadata.output_tokens;
                    else
                        tokenUsages[completion] = message.usage_metadata;
                }
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
            tokenUsage = tokenUsages.reduce((acc, curr) => {
                return {
                    input_tokens: acc.input_tokens + curr.input_tokens,
                    output_tokens: acc.output_tokens + curr.output_tokens,
                    total_tokens: acc.total_tokens + curr.total_tokens,
                };
            });
            const generations = Object.entries(finalChunks)
                .sort(([aKey], [bKey]) => parseInt(aKey, 10) - parseInt(bKey, 10))
                .map(([_, value]) => value);
            return { generations, llmOutput: { tokenUsage } };
        }
        else {
            const params = {
                ...this.invocationParams(options),
                ...this.scopeId(),
            };
            const watsonxMessages = _convertMessagesToWatsonxMessages(messages, this.model);
            const callback = () => this.service.textChat({
                ...params,
                messages: watsonxMessages,
            });
            const { result } = await this.completionWithRetry(callback, options);
            const generations = [];
            for (const part of result.choices) {
                const generation = {
                    text: part.message?.content ?? "",
                    message: _watsonxResponseToChatMessage(part, result.id, result?.usage),
                };
                if (part.finish_reason) {
                    generation.generationInfo = { finish_reason: part.finish_reason };
                }
                generations.push(generation);
            }
            if (options.signal?.aborted) {
                throw new Error("AbortError");
            }
            return {
                generations,
                llmOutput: {
                    tokenUsage: result?.usage,
                },
            };
        }
    }
    async *_streamResponseChunks(messages, options, _runManager) {
        const params = { ...this.invocationParams(options), ...this.scopeId() };
        const watsonxMessages = _convertMessagesToWatsonxMessages(messages, this.model);
        const callback = () => this.service.textChatStream({
            ...params,
            messages: watsonxMessages,
            returnObject: true,
        });
        const stream = await this.completionWithRetry(callback, options);
        let defaultRole;
        let usage;
        let currentCompletion = 0;
        for await (const chunk of stream) {
            if (options.signal?.aborted) {
                throw new Error("AbortError");
            }
            if (chunk?.data?.usage)
                usage = chunk.data.usage;
            const { data } = chunk;
            const choice = data.choices[0];
            if (choice && !("delta" in choice)) {
                continue;
            }
            const delta = choice?.delta;
            if (!delta) {
                continue;
            }
            currentCompletion = choice.index ?? 0;
            const newTokenIndices = {
                prompt: options.promptIndex ?? 0,
                completion: choice.index ?? 0,
            };
            const generationInfo = {
                ...newTokenIndices,
                finish_reason: choice.finish_reason,
            };
            const message = _convertDeltaToMessageChunk(delta, data, this.model, chunk.data.usage, defaultRole);
            defaultRole =
                delta.role ??
                    defaultRole;
            if (message === null || (!delta.content && !delta.tool_calls)) {
                continue;
            }
            const generationChunk = new ChatGenerationChunk({
                message,
                text: delta.content ?? "",
                generationInfo,
            });
            yield generationChunk;
            void _runManager?.handleLLMNewToken(generationChunk.text ?? "", newTokenIndices, undefined, undefined, undefined, { chunk: generationChunk });
        }
        const generationChunk = new ChatGenerationChunk({
            message: new AIMessageChunk({
                content: "",
                response_metadata: {
                    usage,
                },
                usage_metadata: {
                    input_tokens: usage?.prompt_tokens ?? 0,
                    output_tokens: usage?.completion_tokens ?? 0,
                    total_tokens: usage?.total_tokens ?? 0,
                },
            }),
            text: "",
            generationInfo: {
                prompt: options.promptIndex ?? 0,
                completion: currentCompletion ?? 0,
            },
        });
        yield generationChunk;
    }
    /** @ignore */
    _combineLLMOutput() {
        return [];
    }
    withStructuredOutput(outputSchema, config) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const schema = outputSchema;
        const name = config?.name;
        const method = config?.method;
        const includeRaw = config?.includeRaw;
        let functionName = name ?? "extract";
        let outputParser;
        let llm;
        if (method === "jsonMode") {
            const options = {
                responseFormat: { type: "json_object" },
            };
            llm = this.bind(options);
            if (isZodSchema(schema)) {
                outputParser = StructuredOutputParser.fromZodSchema(schema);
            }
            else {
                outputParser = new JsonOutputParser();
            }
        }
        else {
            if (isZodSchema(schema)) {
                const asJsonSchema = zodToJsonSchema(schema);
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
                    // Ideally that would be set to required but this is not supported yet
                    tool_choice: {
                        type: "function",
                        function: {
                            name: functionName,
                        },
                    },
                });
                outputParser = new WatsonxToolsOutputParser({
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
                    // Ideally that would be set to required but this is not supported yet
                    tool_choice: {
                        type: "function",
                        function: {
                            name: functionName,
                        },
                    },
                });
                outputParser = new WatsonxToolsOutputParser({
                    returnSingle: true,
                    keyName: functionName,
                });
            }
        }
        if (!includeRaw) {
            return llm.pipe(outputParser);
        }
        const parserAssign = RunnablePassthrough.assign({
            parsed: (input, config) => outputParser.invoke(input.raw, config),
        });
        const parserNone = RunnablePassthrough.assign({
            parsed: () => null,
        });
        const parsedWithFallback = parserAssign.withFallbacks({
            fallbacks: [parserNone],
        });
        return RunnableSequence.from([
            {
                raw: llm,
            },
            parsedWithFallback,
        ]);
    }
}