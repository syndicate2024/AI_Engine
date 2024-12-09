import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { Tool, type ToolParams } from "@langchain/core/tools";
/**
 * Options for the TavilySearchResults tool.
 */
export type TavilySearchAPIRetrieverFields = ToolParams & {
    maxResults?: number;
    kwargs?: Record<string, unknown>;
    apiKey?: string;
};
/**
 * Tavily search API tool integration.
 *
 * Setup:
 * Install `@langchain/community`. You'll also need an API key set as `TAVILY_API_KEY`.
 *
 * ```bash
 * npm install @langchain/community
 * ```
 *
 * ## [Constructor args](https://api.js.langchain.com/classes/_langchain_community.tools_tavily_search.TavilySearchResults.html#constructor)
 *
 * <details open>
 * <summary><strong>Instantiate</strong></summary>
 *
 * ```typescript
 * import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
 *
 * const tool = new TavilySearchResults({
 *   maxResults: 2,
 *   // ...
 * });
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 *
 * <summary><strong>Invocation</strong></summary>
 *
 * ```typescript
 * await tool.invoke("what is the current weather in sf?");
 * ```
 * </details>
 *
 * <br />
 *
 * <details>
 *
 * <summary><strong>Invocation with tool call</strong></summary>
 *
 * ```typescript
 * // This is usually generated by a model, but we'll create a tool call directly for demo purposes.
 * const modelGeneratedToolCall = {
 *   args: {
 *     input: "what is the current weather in sf?",
 *   },
 *   id: "tool_call_id",
 *   name: tool.name,
 *   type: "tool_call",
 * };
 * await tool.invoke(modelGeneratedToolCall);
 * ```
 *
 * ```text
 * ToolMessage {
 *   "content": "...",
 *   "name": "tavily_search_results_json",
 *   "additional_kwargs": {},
 *   "response_metadata": {},
 *   "tool_call_id": "tool_call_id"
 * }
 * ```
 * </details>
 */
export declare class TavilySearchResults extends Tool {
    static lc_name(): string;
    description: string;
    name: string;
    protected maxResults: number;
    protected apiKey?: string;
    protected kwargs: Record<string, unknown>;
    constructor(fields?: TavilySearchAPIRetrieverFields);
    protected _call(input: string, _runManager?: CallbackManagerForToolRun): Promise<string>;
}
