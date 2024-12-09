import type { Options } from "mozilla-readability";
import { MappingDocumentTransformer, Document } from "@langchain/core/documents";
/**
 * A transformer that uses the Mozilla Readability library to extract the
 * main content from a web page.
 * @example
 * ```typescript
 * const loader = new HTMLWebBaseLoader("https://example.com/article");
 * const docs = await loader.load();
 *
 * const splitter = new RecursiveCharacterTextSplitter({
 *  maxCharacterCount: 5000,
 * });
 * const transformer = new MozillaReadabilityTransformer();
 *
 * // The sequence processes the loaded documents through the splitter and then the transformer.
 * const sequence = transformer.pipe(splitter);
 *
 * // Invoke the sequence to transform the documents into a more readable format.
 * const newDocuments = await sequence.invoke(docs);
 *
 * console.log(newDocuments);
 * ```
 */
export declare class MozillaReadabilityTransformer extends MappingDocumentTransformer {
    protected options: Options;
    static lc_name(): string;
    constructor(options?: Options);
    _transformDocument(document: Document): Promise<Document>;
}