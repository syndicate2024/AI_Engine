"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitemapLoader = void 0;
const documents_1 = require("@langchain/core/documents");
const chunk_array_1 = require("@langchain/core/utils/chunk_array");
const cheerio_js_1 = require("./cheerio.cjs");
const DEFAULT_CHUNK_SIZE = 300;
class SitemapLoader extends cheerio_js_1.CheerioWebBaseLoader {
    constructor(webPath, params = {}) {
        const paramsWithDefaults = { chunkSize: DEFAULT_CHUNK_SIZE, ...params };
        let path = webPath.endsWith("/") ? webPath.slice(0, -1) : webPath;
        // Allow for custom sitemap paths to be passed in with the url.
        path = path.endsWith(".xml") ? path : `${path}/sitemap.xml`;
        super(path, paramsWithDefaults);
        Object.defineProperty(this, "webPath", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: webPath
        });
        Object.defineProperty(this, "allowUrlPatterns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "chunkSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.webPath = path;
        this.allowUrlPatterns = paramsWithDefaults.filterUrls;
        this.chunkSize = paramsWithDefaults.chunkSize;
    }
    _checkUrlPatterns(url) {
        if (!this.allowUrlPatterns) {
            return false;
        }
        return !this.allowUrlPatterns.some((pattern) => !new RegExp(pattern).test(url));
    }
    async parseSitemap() {
        const $ = await cheerio_js_1.CheerioWebBaseLoader._scrape(this.webPath, this.caller, this.timeout, this.textDecoder, {
            xmlMode: true,
            xml: true,
        });
        const elements = [];
        $("url").each((_, element) => {
            const loc = $(element).find("loc").text();
            if (!loc) {
                return;
            }
            if (this._checkUrlPatterns(loc)) {
                return;
            }
            const changefreq = $(element).find("changefreq").text();
            const lastmod = $(element).find("lastmod").text();
            const priority = $(element).find("priority").text();
            elements.push({ loc, changefreq, lastmod, priority });
        });
        $("sitemap").each((_, element) => {
            const loc = $(element).find("loc").text();
            if (!loc) {
                return;
            }
            const changefreq = $(element).find("changefreq").text();
            const lastmod = $(element).find("lastmod").text();
            const priority = $(element).find("priority").text();
            elements.push({ loc, changefreq, lastmod, priority });
        });
        return elements;
    }
    async _loadSitemapUrls(elements) {
        const all = await cheerio_js_1.CheerioWebBaseLoader.scrapeAll(elements.map((ele) => ele.loc), this.caller, this.timeout, this.textDecoder);
        const documents = all.map(($, i) => {
            if (!elements[i]) {
                throw new Error("Scraped docs and elements not in sync");
            }
            const text = $(this.selector).text();
            const { loc: source, ...metadata } = elements[i];
            // extract page metadata
            const description = $("meta[name='description']").attr("content");
            const title = $("meta[property='og:title']").attr("content");
            const lang = $("meta[property='og:locale']").attr("content");
            return new documents_1.Document({
                pageContent: text,
                metadata: {
                    ...metadata,
                    description,
                    title,
                    lang,
                    source: source.trim(),
                },
            });
        });
        return documents;
    }
    async load() {
        const elements = await this.parseSitemap();
        const chunks = (0, chunk_array_1.chunkArray)(elements, this.chunkSize);
        const documents = [];
        for await (const chunk of chunks) {
            const chunkedDocuments = await this._loadSitemapUrls(chunk);
            documents.push(...chunkedDocuments);
        }
        return documents;
    }
}
exports.SitemapLoader = SitemapLoader;
