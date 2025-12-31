const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');
const fs = require('fs');

const TARGET_URL = 'https://www.frontex.europa.eu/careers/vacancies/open-vacancies/';

async function scrapeVacancies() {
    try {
        console.log(`Fetching ${TARGET_URL}...`);
        // Always fetch via Jina AI proxy to avoid 403
        const cleanUrl = TARGET_URL.replace(/^https?:\/\//, '');
        const proxyUrl = `https://r.jina.ai/http://${cleanUrl}`;
        const { data } = await axios.get(proxyUrl);


        const $ = cheerio.load(data);

        const feed = new RSS({
            title: 'Frontex Open Vacancies',
            description: 'RSS feed for Frontex careers and open vacancies',
            feed_url: 'https://andyvalerio.github.io/frontex-vacancies-rss/feed.xml', // Adjusted to match repository name pattern
            site_url: TARGET_URL,
            language: 'en',
        });

        // Jina AI returns plain text with markdown headings (###) for each vacancy
        const blocks = data.split('###').filter(b => b.trim().length > 0);
        blocks.forEach(block => {
            const lines = block.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const title = lines[0];
            // Extract details using regex
            const deadlineMatch = block.match(/Deadline[:\s]*([0-9]{4}-[0-9]{2}-[0-9]{2})/i);
            const refMatch = block.match(/Reference No[:\s]*([A-Z0-9-]+)/i);
            const statusMatch = block.match(/Status[:\s]*([^\n]+)/i);
            const urlMatch = block.match(/\((https?:\/\/[^)]+)\)/i);
            // Only create an item if we have the essential fields
            if (!deadlineMatch || !refMatch || !urlMatch) {
                return; // skip non‑vacancy sections
            }
            const deadline = deadlineMatch[1];
            const reference = refMatch[1];
            const status = statusMatch ? statusMatch[1].trim() : 'N/A';
            const url = urlMatch[1];
            const description = `
                <p><strong>Deadline:</strong> ${deadline}</p>
                <p><strong>Reference No:</strong> ${reference}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><a href="${url}">View &amp; apply</a></p>
            `;
            feed.item({
                title: title,
                description: description,
                url: url,
                guid: reference,
                date: new Date(deadline),
            });
        });

        const xml = feed.xml({ indent: true });
        fs.writeFileSync('feed.xml', xml);
        console.log('Successfully generated feed.xml');
    } catch (error) {
        console.error('Error scraping vacancies:', error.message);
        process.exit(1);
    }
}

scrapeVacancies();
