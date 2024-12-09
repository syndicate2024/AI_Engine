"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureCosmosDBVectorStore = exports.AzureCosmosDBSimilarityType = void 0;
const mongodb_1 = require("mongodb");
const vectorstores_1 = require("@langchain/core/vectorstores");
const documents_1 = require("@langchain/core/documents");
const math_1 = require("@langchain/core/utils/math");
const env_1 = require("@langchain/core/utils/env");
/**
 * @deprecated Install and import from "@langchain/azure-cosmosdb" instead.
 * Cosmos DB Similarity type.
 */
exports.AzureCosmosDBSimilarityType = {
    /** CosineSimilarity */
    COS: "COS",
    /** Inner - product */
    IP: "IP",
    /** Euclidian distance */
    L2: "L2",
};
/**
 * @deprecated Install and import from "@langchain/azure-cosmosdb" instead.
 * Azure Cosmos DB for MongoDB vCore vector store.
 * To use this, you should have both:
 * - the `mongodb` NPM package installed
 * - a connection string associated with a MongoDB VCore Cluster
 *
 * You do not need to create a database or collection, it will be created
 * automatically.
 *
 * Though you do need to create an index on the collection, which can be done
 * using the `createIndex` method.
 */
class AzureCosmosDBVectorStore extends vectorstores_1.VectorStore {
    get lc_secrets() {
        return {
            endpoint: "AZURE_COSMOSDB_CONNECTION_STRING",
        };
    }
    _vectorstoreType() {
        return "azure_cosmosdb";
    }
    constructor(embeddings, dbConfig) {
        super(embeddings, dbConfig);
        Object.defineProperty(this, "connectPromise", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "initPromise", {
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
        Object.defineProperty(this, "database", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "collection", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "indexName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "textKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "embeddingKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "indexOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const connectionString = dbConfig.connectionString ??
            (0, env_1.getEnvironmentVariable)("AZURE_COSMOSDB_CONNECTION_STRING");
        if (!dbConfig.client && !connectionString) {
            throw new Error("Azure Cosmos DB client or connection string must be set.");
        }
        if (!dbConfig.client) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.client = new mongodb_1.MongoClient(connectionString, {
                appName: "langchainjs",
            });
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const client = dbConfig.client || this.client;
        const databaseName = dbConfig.databaseName ?? "documentsDB";
        const collectionName = dbConfig.collectionName ?? "documents";
        this.indexName = dbConfig.indexName ?? "vectorSearchIndex";
        this.textKey = dbConfig.textKey ?? "textContent";
        this.embeddingKey = dbConfig.embeddingKey ?? "vectorContent";
        this.indexOptions = dbConfig.indexOptions ?? {};
        // Start initialization, but don't wait for it to finish here
        this.initPromise = this.init(client, databaseName, collectionName).catch((error) => {
            console.error("Error during Azure Cosmos DB initialization:", error);
        });
    }
    /**
     * Checks if the specified index name during instance construction exists
     * on the collection.
     * @returns A promise that resolves to a boolean indicating if the index exists.
     */
    async checkIndexExists() {
        await this.initPromise;
        const indexes = await this.collection.listIndexes().toArray();
        return indexes.some((index) => index.name === this.indexName);
    }
    /**
     * Deletes the index specified during instance construction if it exists.
     * @returns A promise that resolves when the index has been deleted.
     */
    async deleteIndex() {
        await this.initPromise;
        if (await this.checkIndexExists()) {
            await this.collection.dropIndex(this.indexName);
        }
    }
    /**
     * Creates an index on the collection with the specified index name during
     * instance construction.
     *
     * Setting the numLists parameter correctly is important for achieving good
     * accuracy and performance.
     * Since the vector store uses IVF as the indexing strategy, you should
     * create the index only after you have loaded a large enough sample
     * documents to ensure that the centroids for the respective buckets are
     * faily distributed.
     *
     * We recommend that numLists is set to documentCount/1000 for up to
     * 1 million documents and to sqrt(documentCount) for more than 1 million
     * documents.
     * As the number of items in your database grows, you should tune numLists
     * to be larger in order to achieve good latency performance for vector
     * search.
     *
     * If you're experimenting with a new scenario or creating a small demo,
     * you can start with numLists set to 1 to perform a brute-force search
     * across all vectors.
     * This should provide you with the most accurate results from the vector
     * search, however be aware that the search speed and latency will be slow.
     * After your initial setup, you should go ahead and tune the numLists
     * parameter using the above guidance.
     * @param numLists This integer is the number of clusters that the inverted
     *    file (IVF) index uses to group the vector data.
     *    We recommend that numLists is set to documentCount/1000 for up to
     *    1 million documents and to sqrt(documentCount) for more than 1 million
     *    documents.
     *    Using a numLists value of 1 is akin to performing brute-force search,
     *    which has limited performance
     * @param dimensions Number of dimensions for vector similarity.
     *    The maximum number of supported dimensions is 2000.
     *    If no number is provided, it will be determined automatically by
     *    embedding a short text.
     * @param similarity Similarity metric to use with the IVF index.
     *    Possible options are:
     *    - CosmosDBSimilarityType.COS (cosine distance)
     *    - CosmosDBSimilarityType.L2 (Euclidean distance)
     *    - CosmosDBSimilarityType.IP (inner product)
     * @returns A promise that resolves when the index has been created.
     */
    async createIndex(numLists = 100, dimensions = undefined, similarity = exports.AzureCosmosDBSimilarityType.COS) {
        await this.connectPromise;
        let vectorLength = dimensions;
        if (vectorLength === undefined) {
            const queryEmbedding = await this.embeddings.embedQuery("test");
            vectorLength = queryEmbedding.length;
        }
        const createIndexCommands = {
            createIndexes: this.collection.collectionName,
            indexes: [
                {
                    name: this.indexName,
                    key: { [this.embeddingKey]: "cosmosSearch" },
                    cosmosSearchOptions: {
                        kind: "vector-ivf",
                        numLists,
                        similarity,
                        dimensions: vectorLength,
                    },
                },
            ],
        };
        await this.database.command(createIndexCommands);
    }
    /**
     * Removes specified documents from the AzureCosmosDBVectorStore.
     * If no IDs or filter are specified, all documents will be removed.
     * @param params Parameters for the delete operation.
     * @returns A promise that resolves when the documents have been removed.
     */
    async delete(params = {}) {
        await this.initPromise;
        let ids;
        let filter;
        if (Array.isArray(params)) {
            ids = params;
        }
        else {
            ids = params.ids;
            filter = params.filter;
        }
        const idsArray = Array.isArray(ids) ? ids : [ids];
        const deleteIds = ids && idsArray.length > 0 ? idsArray : undefined;
        let deleteFilter = filter ?? {};
        if (deleteIds) {
            const objectIds = deleteIds.map((id) => new mongodb_1.ObjectId(id));
            deleteFilter = { _id: { $in: objectIds }, ...deleteFilter };
        }
        await this.collection.deleteMany(deleteFilter);
    }
    /**
     * Closes any newly instanciated Azure Cosmos DB client.
     * If the client was passed in the constructor, it will not be closed.
     * @returns A promise that resolves when any newly instanciated Azure
     *     Cosmos DB client been closed.
     */
    async close() {
        if (this.client) {
            await this.client.close();
        }
    }
    /**
     * Method for adding vectors to the AzureCosmosDBVectorStore.
     * @param vectors Vectors to be added.
     * @param documents Corresponding documents to be added.
     * @returns A promise that resolves to the added documents IDs.
     */
    async addVectors(vectors, documents) {
        const docs = vectors.map((embedding, idx) => ({
            [this.textKey]: documents[idx].pageContent,
            [this.embeddingKey]: embedding,
            ...documents[idx].metadata,
        }));
        await this.initPromise;
        const result = await this.collection.insertMany(docs);
        return Object.values(result.insertedIds).map((id) => String(id));
    }
    /**
     * Method for adding documents to the AzureCosmosDBVectorStore. It first converts
     * the documents to texts and then adds them as vectors.
     * @param documents The documents to add.
     * @returns A promise that resolves to the added documents IDs.
     */
    async addDocuments(documents) {
        const texts = documents.map(({ pageContent }) => pageContent);
        return this.addVectors(await this.embeddings.embedDocuments(texts), documents);
    }
    /**
     * Method that performs a similarity search on the vectors stored in the
     * collection. It returns a list of documents and their corresponding
     * similarity scores.
     * @param queryVector Query vector for the similarity search.
     * @param k=4 Number of nearest neighbors to return.
     * @returns Promise that resolves to a list of documents and their corresponding similarity scores.
     */
    async similaritySearchVectorWithScore(queryVector, k = 4) {
        await this.initPromise;
        const pipeline = [
            {
                $search: {
                    cosmosSearch: {
                        vector: queryVector,
                        path: this.embeddingKey,
                        k,
                    },
                    returnStoredSource: true,
                },
            },
            {
                $project: {
                    similarityScore: { $meta: "searchScore" },
                    document: "$$ROOT",
                },
            },
        ];
        const results = await this.collection
            .aggregate(pipeline)
            .map((result) => {
            const { similarityScore: score, document } = result;
            const text = document[this.textKey];
            return [new documents_1.Document({ pageContent: text, metadata: document }), score];
        });
        return results.toArray();
    }
    /**
     * Return documents selected using the maximal marginal relevance.
     * Maximal marginal relevance optimizes for similarity to the query AND
     * diversity among selected documents.
     * @param query Text to look up documents similar to.
     * @param options.k Number of documents to return.
     * @param options.fetchK=20 Number of documents to fetch before passing to
     *     the MMR algorithm.
     * @param options.lambda=0.5 Number between 0 and 1 that determines the
     *     degree of diversity among the results, where 0 corresponds to maximum
     *     diversity and 1 to minimum diversity.
     * @returns List of documents selected by maximal marginal relevance.
     */
    async maxMarginalRelevanceSearch(query, options) {
        const { k, fetchK = 20, lambda = 0.5 } = options;
        const queryEmbedding = await this.embeddings.embedQuery(query);
        const docs = await this.similaritySearchVectorWithScore(queryEmbedding, fetchK);
        const embeddingList = docs.map((doc) => doc[0].metadata[this.embeddingKey]);
        // Re-rank the results using MMR
        const mmrIndexes = (0, math_1.maximalMarginalRelevance)(queryEmbedding, embeddingList, lambda, k);
        const mmrDocs = mmrIndexes.map((index) => docs[index][0]);
        return mmrDocs;
    }
    /**
     * Initializes the AzureCosmosDBVectorStore by connecting to the database.
     * @param client The MongoClient to use for connecting to the database.
     * @param databaseName The name of the database to use.
     * @param collectionName The name of the collection to use.
     * @returns A promise that resolves when the AzureCosmosDBVectorStore has been initialized.
     */
    async init(client, databaseName, collectionName) {
        this.connectPromise = (async () => {
            await client.connect();
            this.database = client.db(databaseName);
            this.collection = this.database.collection(collectionName);
        })();
        // Unless skipCreate is set, create the index
        // This operation is no-op if the index already exists
        if (!this.indexOptions.skipCreate) {
            await this.createIndex(this.indexOptions.numLists, this.indexOptions.dimensions, this.indexOptions.similarity);
        }
    }
    /**
     * Static method to create an instance of AzureCosmosDBVectorStore from a
     * list of texts. It first converts the texts to vectors and then adds
     * them to the collection.
     * @param texts List of texts to be converted to vectors.
     * @param metadatas Metadata for the texts.
     * @param embeddings Embeddings to be used for conversion.
     * @param dbConfig Database configuration for Azure Cosmos DB for MongoDB vCore.
     * @returns Promise that resolves to a new instance of AzureCosmosDBVectorStore.
     */
    static async fromTexts(texts, metadatas, embeddings, dbConfig) {
        const docs = [];
        for (let i = 0; i < texts.length; i += 1) {
            const metadata = Array.isArray(metadatas) ? metadatas[i] : metadatas;
            const newDoc = new documents_1.Document({
                pageContent: texts[i],
                metadata,
            });
            docs.push(newDoc);
        }
        return AzureCosmosDBVectorStore.fromDocuments(docs, embeddings, dbConfig);
    }
    /**
     * Static method to create an instance of AzureCosmosDBVectorStore from a
     * list of documents. It first converts the documents to vectors and then
     * adds them to the collection.
     * @param docs List of documents to be converted to vectors.
     * @param embeddings Embeddings to be used for conversion.
     * @param dbConfig Database configuration for Azure Cosmos DB for MongoDB vCore.
     * @returns Promise that resolves to a new instance of AzureCosmosDBVectorStore.
     */
    static async fromDocuments(docs, embeddings, dbConfig) {
        const instance = new this(embeddings, dbConfig);
        await instance.addDocuments(docs);
        return instance;
    }
}
exports.AzureCosmosDBVectorStore = AzureCosmosDBVectorStore;
