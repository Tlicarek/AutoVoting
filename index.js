const fetch = require('node-fetch');

async function voteForProject(project) {
    const url = `${project.url}?username=${project.nick}`;
    console.log(`Voting for project: ${project.id}, URL: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        const text = await response.text();
        console.log(`Voted for ${project.nick} on ${project.id}`);
    } catch (error) {
        console.error(`Failed to vote for ${project.nick} on ${project.id}: ${error}`);
    }
}

async function main() {
    const projects = [
        {
            id: 'czech-craft',
            nick: 'Tlicarek',
            url: 'https://czech-craft.eu/server/mcserverlist'
        },
        {
            id: 'mcserver-list',
            nick: 'Tlicarek',
            url: 'https://mcserver-list.eu/en/vote/432'
        }
    ];

    for (const project of projects) {
        await voteForProject(project);
    }
}

main();
