/**
 * Adapted from
 * https://github.com/FurkanToprak/OkapiBM25
 *
 * Inlined due to CJS import issues.
 */
/** Gets word count. */
export const getWordCount = (corpus) => {
    return ((corpus || "").match(/\w+/g) || []).length;
};
/** Number of occurences of a word in a string. */
export const getTermFrequency = (term, corpus) => {
    return ((corpus || "").match(new RegExp(term, "g")) || []).length;
};
/** Inverse document frequency. */
export const getIDF = (term, documents) => {
    // Number of relevant documents.
    const relevantDocuments = documents.filter((document) => document.includes(term)).length;
    return Math.log((documents.length - relevantDocuments + 0.5) / (relevantDocuments + 0.5) + 1);
};
/** Implementation of Okapi BM25 algorithm.
 *  @param documents: Collection of documents.
 *  @param keywords: query terms.
 *  @param constants: Contains free parameters k1 and b. b=0.75 and k1=1.2 by default.
 *  @param sort: A function that allows you to sort queries by a given rule. If not provided, returns results corresponding to the original order.
 * If this option is provided, the return type will not be an array of scores but an array of documents with their scores.
 */
export function BM25(documents, keywords, constants, sorter) {
    const b = constants && constants.b ? constants.b : 0.75;
    const k1 = constants && constants.k1 ? constants.k1 : 1.2;
    const documentLengths = documents.map((document) => getWordCount(document));
    const averageDocumentLength = documentLengths.reduce((a, b) => a + b, 0) / documents.length;
    const idfByKeyword = keywords.reduce((obj, keyword) => {
        obj.set(keyword, getIDF(keyword, documents));
        return obj;
    }, new Map());
    const scores = documents.map((document, index) => {
        const score = keywords
            .map((keyword) => {
            const inverseDocumentFrequency = idfByKeyword.get(keyword);
            if (inverseDocumentFrequency === undefined) {
                throw new Error("Missing keyword.");
            }
            const termFrequency = getTermFrequency(keyword, document);
            const documentLength = documentLengths[index];
            return ((inverseDocumentFrequency * (termFrequency * (k1 + 1))) /
                (termFrequency +
                    k1 * (1 - b + (b * documentLength) / averageDocumentLength)));
        })
            .reduce((a, b) => a + b, 0);
        if (sorter) {
            return { score, document };
        }
        return score;
    });
    // sort the results
    if (sorter) {
        return scores.sort(sorter);
    }
    return scores;
}
