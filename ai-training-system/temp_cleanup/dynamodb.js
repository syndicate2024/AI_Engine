import { DynamoDBClient, GetItemCommand, UpdateItemCommand, DeleteItemCommand, } from "@aws-sdk/client-dynamodb";
import { BaseListChatMessageHistory } from "@langchain/core/chat_history";
import { mapChatMessagesToStoredMessages, mapStoredMessagesToChatMessages, } from "@langchain/core/messages";
/**
 * Class providing methods to interact with a DynamoDB table to store and
 * retrieve chat messages. It extends the `BaseListChatMessageHistory`
 * class.
 */
export class DynamoDBChatMessageHistory extends BaseListChatMessageHistory {
    get lc_secrets() {
        return {
            "config.credentials.accessKeyId": "AWS_ACCESS_KEY_ID",
            "config.credentials.secretAccessKey": "AWS_SECRETE_ACCESS_KEY",
            "config.credentials.sessionToken": "AWS_SESSION_TOKEN",
        };
    }
    /**
     * Transforms a `StoredMessage` into a `DynamoDBSerializedChatMessage`.
     * The `DynamoDBSerializedChatMessage` format is suitable for storing in DynamoDB.
     *
     * @param message - The `StoredMessage` to be transformed.
     * @returns The transformed `DynamoDBSerializedChatMessage`.
     */
    createDynamoDBSerializedChatMessage(message) {
        const { type, data: { content, role, additional_kwargs }, } = message;
        const isAdditionalKwargs = additional_kwargs && Object.keys(additional_kwargs).length;
        const dynamoSerializedMessage = {
            M: {
                type: {
                    S: type,
                },
                text: {
                    S: content,
                },
                additional_kwargs: isAdditionalKwargs
                    ? { S: JSON.stringify(additional_kwargs) }
                    : { S: "{}" },
            },
        };
        if (role) {
            dynamoSerializedMessage.M.role = { S: role };
        }
        return dynamoSerializedMessage;
    }
    constructor({ tableName, sessionId, partitionKey, sortKey, messageAttributeName, config, key = {}, }) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "dynamodb"]
        });
        Object.defineProperty(this, "tableName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionId", {
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
        Object.defineProperty(this, "partitionKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "id"
        });
        Object.defineProperty(this, "sortKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "messageAttributeName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "messages"
        });
        Object.defineProperty(this, "dynamoKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.tableName = tableName;
        this.sessionId = sessionId;
        this.client = new DynamoDBClient(config ?? {});
        this.partitionKey = partitionKey ?? this.partitionKey;
        this.sortKey = sortKey;
        this.messageAttributeName =
            messageAttributeName ?? this.messageAttributeName;
        this.dynamoKey = key;
        // override dynamoKey with partition key and sort key when key not specified
        if (Object.keys(this.dynamoKey).length === 0) {
            this.dynamoKey[this.partitionKey] = { S: this.sessionId };
            if (this.sortKey) {
                this.dynamoKey[this.sortKey] = { S: this.sortKey };
            }
        }
    }
    /**
     * Retrieves all messages from the DynamoDB table and returns them as an
     * array of `BaseMessage` instances.
     * @returns Array of stored messages
     */
    async getMessages() {
        try {
            const params = {
                TableName: this.tableName,
                Key: this.dynamoKey,
            };
            const response = await this.client.send(new GetItemCommand(params));
            const items = response.Item
                ? response.Item[this.messageAttributeName]?.L ?? []
                : [];
            const messages = items
                .filter((item) => item.M !== undefined)
                .map((item) => {
                const data = {
                    role: item.M?.role?.S,
                    content: item.M?.text.S,
                    additional_kwargs: item.M?.additional_kwargs?.S
                        ? JSON.parse(item.M?.additional_kwargs.S)
                        : undefined,
                };
                return {
                    type: item.M?.type.S,
                    data,
                };
            })
                .filter((x) => x.type !== undefined && x.data.content !== undefined);
            return mapStoredMessagesToChatMessages(messages);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            throw new Error(`Error getting messages: ${error.message}`);
        }
    }
    /**
     * Adds a new message to the DynamoDB table.
     * @param message The message to be added to the DynamoDB table.
     */
    async addMessage(message) {
        try {
            const messages = mapChatMessagesToStoredMessages([message]);
            const params = {
                TableName: this.tableName,
                Key: this.dynamoKey,
                ExpressionAttributeNames: {
                    "#m": this.messageAttributeName,
                },
                ExpressionAttributeValues: {
                    ":empty_list": {
                        L: [],
                    },
                    ":m": {
                        L: messages.map(this.createDynamoDBSerializedChatMessage),
                    },
                },
                UpdateExpression: "SET #m = list_append(if_not_exists(#m, :empty_list), :m)",
            };
            await this.client.send(new UpdateItemCommand(params));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            throw new Error(`Error adding message: ${error.message}`);
        }
    }
    /**
     * Adds new messages to the DynamoDB table.
     * @param messages The messages to be added to the DynamoDB table.
     */
    async addMessages(messages) {
        try {
            const storedMessages = mapChatMessagesToStoredMessages(messages);
            const dynamoMessages = storedMessages.map(this.createDynamoDBSerializedChatMessage);
            const params = {
                TableName: this.tableName,
                Key: this.dynamoKey,
                ExpressionAttributeNames: {
                    "#m": this.messageAttributeName,
                },
                ExpressionAttributeValues: {
                    ":empty_list": {
                        L: [],
                    },
                    ":m": {
                        L: dynamoMessages,
                    },
                },
                UpdateExpression: "SET #m = list_append(if_not_exists(#m, :empty_list), :m)",
            };
            await this.client.send(new UpdateItemCommand(params));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            throw new Error(`Error adding messages: ${error.message}`);
        }
    }
    /**
     * Deletes all messages from the DynamoDB table.
     */
    async clear() {
        try {
            const params = {
                TableName: this.tableName,
                Key: this.dynamoKey,
            };
            await this.client.send(new DeleteItemCommand(params));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }
        catch (error) {
            throw new Error(`Error clearing messages: ${error.message}`);
        }
    }
}
