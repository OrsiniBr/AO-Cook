import fs from 'fs';
import path from 'path';

interface SearchResult {
    path: string;
    content: string;
    relevance: number;
}

interface DocumentationData {
    concepts: Record<string, any>;
    examples: Record<string, any>;
    sections: Array<any>;
    [key: string]: any;
}

// Load the documentation data
const loadDocs = (): DocumentationData | null => {
    try {
        const docsPath = path.join(process.cwd(), 'aodocs.json');
        const rawData = fs.readFileSync(docsPath, 'utf-8');
        return JSON.parse(rawData);
    } catch (error) {
        console.error('Error loading documentation:', error instanceof Error ? error.message : 'Unknown error');
        return null;
    }
};

// Helper function to search through documentation
const searchInDocs = (docs: DocumentationData, query: string, category?: string): SearchResult[] => {
    if (!docs) return [];

    const searchTerms = query.toLowerCase()
        .split(' ')
        .filter(term => term.length > 0)
        .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // Escape special regex characters

    if (searchTerms.length === 0) return [];

    const results: SearchResult[] = [];

    const searchInObject = (obj: any, path: string[] = []) => {
        if (!obj) return;

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                const content = value.toLowerCase();
                const matches = searchTerms.every(term => {
                    try {
                        return new RegExp(term, 'i').test(content);
                    } catch (e) {
                        return false;
                    }
                });

                if (matches) {
                    results.push({
                        path: [...path, key].join('.'),
                        content: value,
                        relevance: searchTerms.reduce((acc, term) => {
                            try {
                                return acc + (content.match(new RegExp(term, 'gi')) || []).length;
                            } catch (e) {
                                return acc;
                            }
                        }, 0)
                    });
                }
            } else if (typeof value === 'object' && value !== null) {
                searchInObject(value, [...path, key]);
            }
        }
    };

    const docsToSearch = category && category !== 'all'
        ? { [category]: docs[category] }
        : docs;

    searchInObject(docsToSearch);
    return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
};

export interface ToolConfig<T = any> {
    definition: {
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: {
                type: 'object';
                properties: Record<string, unknown>;
                required: string[];
            };
        };
    };
    handler: (args: T) => Promise<any>;
}

export const tools: Record<string, ToolConfig> = {
    searchDocs: {
        definition: {
            type: 'function',
            function: {
                name: 'searchDocs',
                description: 'Search through the AO blockchain documentation for specific topics or keywords',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'The search query or keywords to look for in the documentation'
                        },
                        category: {
                            type: 'string',
                            description: 'Optional category to narrow down the search (e.g., "concepts", "examples", "sections")',
                            enum: ['concepts', 'examples', 'sections', 'all']
                        }
                    },
                    required: ['query']
                }
            }
        },
        handler: async (args: { query: string; category?: string }) => {
            const docs = loadDocs();
            if (!docs) {
                return {
                    error: 'Documentation not available. Please ensure aodocs.json exists in the project root.',
                    results: []
                };
            }

            const results = searchInDocs(docs, args.query, args.category);
            return {
                results,
                totalFound: results.length,
                query: args.query,
                category: args.category || 'all'
            };
        }
    },

    getExample: {
        definition: {
            type: 'function',
            function: {
                name: 'getExample',
                description: 'Retrieve specific code examples from the AO blockchain documentation',
                parameters: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'The topic or concept you want an example for'
                        },
                        complexity: {
                            type: 'string',
                            description: 'The complexity level of the example',
                            enum: ['basic', 'intermediate', 'advanced']
                        }
                    },
                    required: ['topic']
                }
            }
        },
        handler: async (args: { topic: string; complexity?: string }) => {
            const docs = loadDocs();
            if (!docs) {
                return {
                    error: 'Documentation not available. Please ensure aodocs.json exists in the project root.',
                    example: null,
                    explanation: null
                };
            }

            const results = searchInDocs(docs, `${args.topic} example ${args.complexity || ''}`, 'examples');

            if (results.length === 0) {
                const suggestions = searchInDocs(docs, args.topic, 'all')
                    .slice(0, 3)
                    .map(r => r.path);

                return {
                    example: null,
                    explanation: `No examples found for "${args.topic}" with complexity ${args.complexity || 'any'}.`,
                    suggestions: suggestions.length > 0 ? suggestions : null
                };
            }

            const bestMatch = results[0];
            return {
                example: bestMatch.content,
                explanation: bestMatch.path,
                complexity: args.complexity || 'basic'
            };
        }
    },

    explainConcept: {
        definition: {
            type: 'function',
            function: {
                name: 'explainConcept',
                description: 'Get detailed explanations of AO blockchain concepts and terminology',
                parameters: {
                    type: 'object',
                    properties: {
                        concept: {
                            type: 'string',
                            description: 'The concept or term to explain'
                        },
                        detail: {
                            type: 'string',
                            description: 'The level of detail required in the explanation',
                            enum: ['brief', 'detailed', 'technical']
                        }
                    },
                    required: ['concept']
                }
            }
        },
        handler: async (args: { concept: string; detail?: string }) => {
            const docs = loadDocs();
            if (!docs) {
                return {
                    error: 'Documentation not available. Please ensure aodocs.json exists in the project root.',
                    explanation: null
                };
            }

            const conceptResults = searchInDocs(docs, args.concept, 'concepts');

            if (conceptResults.length === 0) {
                const generalResults = searchInDocs(docs, args.concept, 'all');

                return {
                    explanation: generalResults.length > 0 ? generalResults[0].content : null,
                    relatedTopics: generalResults.length > 1
                        ? generalResults.slice(1, 4).map(r => ({
                            topic: r.path,
                            preview: r.content.substring(0, 100) + '...'
                        }))
                        : null
                };
            }

            const detailLevel = args.detail || 'detailed';
            const explanation = conceptResults[0].content;

            return {
                explanation: detailLevel === 'brief'
                    ? explanation.split('.')[0] + '.'
                    : explanation,
                source: conceptResults[0].path,
                relatedConcepts: conceptResults.length > 1
                    ? conceptResults.slice(1, 4).map(r => ({
                        concept: r.path,
                        preview: r.content.substring(0, 100) + '...'
                    }))
                    : null
            };
        }
    }
};
