import { tools } from '../tools/allTools';

async function testHandlers() {
    try {
        // Test searchDocs
        console.log('\n=== Testing searchDocs ===');
        const searchResult = await tools.searchDocs.handler({
            query: 'chatroom',
            category: 'all'
        });
        console.log('Search Results:', JSON.stringify(searchResult, null, 2));

        // Test getExample
        console.log('\n=== Testing getExample ===');
        const exampleResult = await tools.getExample.handler({
            topic: 'token',
            complexity: 'basic'
        });
        console.log('Example Results:', JSON.stringify(exampleResult, null, 2));

        // Test explainConcept
        console.log('\n=== Testing explainConcept ===');
        const conceptResult = await tools.explainConcept.handler({
            concept: 'ao mainnet',
            detail: 'detailed'
        });
        console.log('Concept Results:', JSON.stringify(conceptResult, null, 2));

    } catch (error) {
        console.error('Error during testing:', error);
    }
}

testHandlers(); 