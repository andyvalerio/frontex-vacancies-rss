const axios = require('axios');
const cheerio = require('cheerio');
const RSS = require('rss');
const fs = require('fs');

const TARGET_URL = 'https://www.frontex.europa.eu/careers/vacancies/open-vacancies/';

async function scrapeVacancies() {
    try {
        console.log(`Fetching ${TARGET_URL}...`);
        const { data } = await axios.get(TARGET_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' } });
        const $ = cheerio.load(data);

        const feed = new RSS({
            title: 'Frontex Open Vacancies',
            description: 'RSS feed for Frontex careers and open vacancies',
            feed_url: 'https://andyvalerio.github.io/frontex-vacancies-rss/feed.xml', // Adjusted to match repository name pattern
            site_url: TARGET_URL,
            language: 'en',
        });

        $('.careers-list-item').each((i, el) => {
            const title = $(el).find('.title').text().trim();
            const link = $(el).find('a').attr('href');

            // Extract metadata from <dl>
            const meta = {};
            $(el).find('dl.meta dt').each((j, dt) => {
                const key = $(dt).text().replace(':', '').trim();
                const value = $(dt).next('dd').text().trim();
                meta[key] = value;
            });

            const deadline = meta['Deadline'] || 'N/A';
            const refNo = meta['Reference No'] || 'N/A';
            const status = meta['Status'] || 'N/A';

            const description = `
                <p><strong>Reference No:</strong> ${refNo}</p>
                <p><strong>Deadline:</strong> ${deadline}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><a href="${link}">View & apply</a></p>
            `;

            feed.item({
                title: title,
                description: description,
                url: link,
                guid: refNo !== 'N/A' ? refNo : link,
                date: deadline !== 'N/A' ? new Date(deadline) : new Date(),
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
