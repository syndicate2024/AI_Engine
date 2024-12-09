/* eslint-disable @typescript-eslint/no-explicit-any */
import PQueueMod from "p-queue";
import { getGlobalAsyncLocalStorageInstance } from "./async_local_storage/globals.js";
let queue;
/**
 * Creates a queue using the p-queue library. The queue is configured to
 * auto-start and has a concurrency of 1, meaning it will process tasks
 * one at a time.
 */
function createQueue() {
    const PQueue = "default" in PQueueMod ? PQueueMod.default : PQueueMod;
    return new PQueue({
        autoStart: true,
        concurrency: 1,
    });
}
export function getQueue() {
    if (typeof queue === "undefined") {
        queue = createQueue();
    }
    return queue;
}
/**
 * Consume a promise, either adding it to the queue or waiting for it to resolve
 * @param promiseFn Promise to consume
 * @param wait Whether to wait for the promise to resolve or resolve immediately
 */
export async function consumeCallback(promiseFn, wait) {
    if (wait === true) {
        // Clear config since callbacks are not part of the root run
        // Avoid using global singleton due to circuluar dependency issues
        if (getGlobalAsyncLocalStorageInstance() !== undefined) {
            await getGlobalAsyncLocalStorageInstance().run(undefined, async () => promiseFn());
        }
        else {
            await promiseFn();
        }
    }
    else {
        queue = getQueue();
        void queue.add(async () => {
            if (getGlobalAsyncLocalStorageInstance() !== undefined) {
                await getGlobalAsyncLocalStorageInstance().run(undefined, async () => promiseFn());
            }
            else {
                await promiseFn();
            }
        });
    }
}
/**
 * Waits for all promises in the queue to resolve. If the queue is
 * undefined, it immediately resolves a promise.
 */
export function awaitAllCallbacks() {
    return typeof queue !== "undefined" ? queue.onIdle() : Promise.resolve();
}
