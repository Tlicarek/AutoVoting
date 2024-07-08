const puppeteer = require('puppeteer');

async function voteOnSite(url, siteName) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Wait for the page to load fully
        await page.waitForTimeout(5000);

        await page.type('input[name="username"]', 'Tlicarek');

        // Click the submit button
        await page.click('input[type="submit"]');

        // Wait for a confirmation message or some delay to ensure submission
        await page.waitForTimeout(5000);

        console.log(`Successfully voted on ${siteName}`);

    } catch (error) {
        console.error(`Error while voting on ${siteName}:`, error);
    } finally {
        await browser.close();
    }
}

(async () => {
    await voteOnSite('https://czech-craft.eu/server/mcserverlist?username=Tlicarek', 'Czech Craft');
    await voteOnSite('https://mcserver-list.eu/en/vote/432?username=Tlicarek', 'MCServer List');
})();
