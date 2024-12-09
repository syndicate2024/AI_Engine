import { LLM, BaseLLM, type BaseLLMCallOptions } from "@langchain/core/language_models/llms";
import { GuardrailResponse, LLMMessage } from "@layerup/layerup-security";
export interface LayerupSecurityOptions extends BaseLLMCallOptions {
    llm: BaseLLM;
    layerupApiKey?: string;
    layerupApiBaseUrl?: string;
    promptGuardrails?: string[];
    responseGuardrails?: string[];
    mask?: boolean;
    metadata?: Record<string, unknown>;
    handlePromptGuardrailViolation?: (violation: GuardrailResponse) => LLMMessage;
    handleResponseGuardrailViolation?: (violation: GuardrailResponse) => LLMMessage;
}
export declare class LayerupSecurity extends LLM {
    static lc_name(): string;
    lc_serializable: boolean;
    llm: BaseLLM;
    layerupApiKey: string;
    layerupApiBaseUrl: string;
    promptGuardrails: string[];
    responseGuardrails: string[];
    mask: boolean;
    metadata: Record<string, unknown>;
    handlePromptGuardrailViolation: (violation: GuardrailResponse) => LLMMessage;
    handleResponseGuardrailViolation: (violation: GuardrailResponse) => LLMMessage;
    private layerup;
    constructor(options: LayerupSecurityOptions);
    _llmType(): string;
    _call(input: string, options?: BaseLLMCallOptions): Promise<string>;
}
