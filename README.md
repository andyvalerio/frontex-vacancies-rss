# Frontex Vacancies RSS Feed

This project generates an RSS feed for open vacancies at Frontex. It is designed to be hosted as a static site (e.g., on GitHub Pages) and updates itself automatically using GitHub Actions.

## How it works

1.  **Scraper**: A Node.js script (`index.js`) fetches the [Frontex Vacancies page](https://www.frontex.europa.eu/careers/vacancies/open-vacancies/) and parses the career items.
2.  **Automation**: A GitHub Action (`.github/workflows/update-rss.yml`) runs the scraper twice a day.
3.  **Hosting**: The generated `feed.xml` is committed back to the repository and can be served via GitHub Pages.

## Usage

### 1. Repository Setup
To host this yourself:
*   Fork or clone this repository to your GitHub account.
*   Go to **Settings > Actions > General** and ensure "Allow GitHub Actions to create and approve pull requests" is checked (or at least that the `GITHUB_TOKEN` has read/write permissions).
*   Go to **Settings > Pages** and set it up to serve from the branch where `feed.xml` lives (usually `main`).

### 2. Subscribe to the Feed
Once set up, your RSS feed will be available at:
`https://<your-username>.github.io/<your-repo-name>/feed.xml`

## Local Development

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Run the scraper:
    ```bash
    node index.js
    ```
3.  Check the generated `feed.xml`.
