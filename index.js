// Settings
var settings;
// General statistics
var generalStats;
// Statistics for today
var todayStats;
// Main database
var db;
// Logs database
var dbLogs;
// Currently opened tabs
var openedProjects = new Map();
let onLine;

self.addEventListener('error', (event) => onUnhandledError(event));
self.addEventListener('unhandledrejection', (event) => onUnhandledError(event));

function onUnhandledError(event) {
    let error;
    if (event.reason) {
        error = event.reason;
    } else if (event.error) {
        error = event.error;
    } else {
        error = 'Unidentified error, see the details in the console ';
        if (console._error) console._error(event);
        else console.error(event);
        error += JSON.stringify(event);
    }

    if (self.createNotif) {
        createNotif(error, 'error', {dontLog: true});
        document.querySelectorAll('button[disabled]').forEach((el) => el.disabled = false);
    }

    if (!dbLogs) return;

    const time = new Date().toLocaleString().replace(',', '');
    if (error.stack) error = error.stack;
    const log = '[' + time + ' ERROR]: ' + error;
    try {
        dbLogs.put('logs', log).catch(e => {
            if (console._error) console._error(e);
            else console.error(e);
        });
    } catch (e) {
        if (console._error) console._error(e);
        else console.error(e);
    }
}

async function initializeConfig(background, version) {
    if (!dbLogs) {
        dbLogs = await idb.openDB('logs', 1, {
            upgrade(db) {
                db.createObjectStore('logs', {autoIncrement: true});
            }
        });
    }
    try {
        db = await idb.openDB('avr', version ? version : 14, {upgrade});
    } catch (error) {
        if (error.name === 'VersionError') {
            if (version) {
                dbError({target: {source: {name: 'avr'}, error: error}});
                return;
            }
            console.log('Database version error, possibly on MultiVote version, attempting to load MultiVote settings');
            await initializeConfig(background, 140);
            return;
        }
        dbError({target: {source: {name: 'avr'}, error: error}});
        return;
    }
    db.onerror = (event) => dbError(event, false);
    dbLogs.onerror = (event) => dbError(event, true);
    function dbError(event, logs) {
        if (background) {
            sendNotification(chrome.i18n.getMessage('errordbTitle', event.target.source.name), event.target.error.message, 'error', 'openSettings');
            if (logs) {
                console._error(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error.message]));
            } else {
                console.error(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error.message]));
            }
        } else {
            createNotif(chrome.i18n.getMessage('errordb', [event.target.source.name, event.target.error.message]), 'error');
        }
    }
    settings = await db.get('other', 'settings');
    generalStats = await db.get('other', 'generalStats');
    todayStats = await db.get('other', 'todayStats');
    openedProjects = await db.get('other', 'openedProjects');
    onLine = await db.get('other', 'onLine');

    if (!background) return;

    if (state !== 'activated') {
        console.log(chrome.i18n.getMessage('start', chrome.runtime.getManifest().version));

        if (openedProjects.size > 0) {
            for (const [key, value] of openedProjects) {
                openedProjects.delete(key);
                tryCloseTab(key, value, 0);
            }
            await db.put('other', openedProjects, 'openedProjects');
        }
        checkVote();
    } else {
        if (!openedProjects.size) {
            updateListeners(false);
        }
    }
}

async function upgrade(db, oldVersion, newVersion, transaction) {
    if (oldVersion == null) oldVersion = 1;

    if (oldVersion !== newVersion) {
        if (self.createNotif) {
            createNotif(chrome.i18n.getMessage('oldSettings', [oldVersion, newVersion]), 'hint');
        } else {
            console.log(chrome.i18n.getMessage('oldSettings', [oldVersion, newVersion]));
        }
    }

    if (oldVersion === 0) {
        const projects = db.createObjectStore('projects', {autoIncrement: true});
        projects.createIndex('rating, id, nick', ['rating', 'id', 'nick']);
        projects.createIndex('rating, id', ['rating', 'id']);
        projects.createIndex('rating', 'rating');
        const other = db.createObjectStore('other');
        settings = {
            disabledNotifStart: true,
            disabledNotifInfo: false,
            disabledNotifWarn: false,
            disabledNotifError: false,
            enabledSilentVote: true,
            disabledCheckInternet: false,
            disabledOneVote: false,
            disabledRestartOnTimeout: false,
            disabledFocusedTab: false,
            enableCustom: false,
            timeout: 10000,
            timeoutError: 900000,
            timeoutVote: 900000,
            disabledWarnCaptcha: false,
            debug: false,
            disabledUseRemoteCode: false,
            disabledSendErrorSentry: false,
            temporarilyDisabledUseRemoteCode: true,
            expertMode: false
        };
        await other.add(settings, 'settings');
        generalStats = {
            successVotes: 0,
            monthSuccessVotes: 0,
            lastMonthSuccessVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null,
            added: Date.now()
        };
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        };
        await other.add(generalStats, 'generalStats');
        await other.add(todayStats, 'todayStats');
        await other.add(openedProjects, 'openedProjects');
        onLine = true;
        other.add(onLine, 'onLine');
        return;
    }

    if (!transaction) transaction = db.transaction(['projects', 'other'], 'readwrite');

    if (oldVersion <= 1) {
        todayStats = {
            successVotes: 0,
            errorVotes: 0,
            laterVotes: 0,
            lastSuccessVote: null,
            lastAttemptVote: null
        };
        const store = transaction.objectStore('other');
        await store.put(todayStats, 'todayStats');
        settings = await store.get('settings');
        settings.timeout = 10000;
        await transaction.objectStore('other').put(settings, 'settings');
    }

    if (oldVersion <= 3) {
        const store = transaction.objectStore('projects');
        let cursor = await store.index('rating').openCursor('DiscordBotList');
        while (cursor) {
            const project = cursor.value;
            project.game = 'bots';
            await cursor.update(project);
            cursor = await cursor.continue();
        }
        cursor = await store.index('rating').openCursor('MinecraftRating');
        while (cursor) {
            const project = cursor.value;
            project.game = 'projects';
            await cursor.update(project);
            cursor = await cursor.continue();
        }
        cursor = await store.index('rating').openCursor('PixelmonServers');
        while (cursor) {
            const project = cursor.value;
            project.game = 'pixelmonservers.com';
            project.rating = 'MineServers';
            await cursor.update(project);
            cursor = await cursor.continue();
        }
    }

    if (oldVersion <= 4) {
        const store = transaction.objectStore('projects');
        let cursor = await store.index('rating').openCursor('MCServerList');
        while (cursor) {
            const project = cursor.value;
            project.maxCountVote = 5;
            project.countVote = 0;
            await cursor.update(project);
            cursor = await cursor.continue();
        }
    }
}

async function checkVote() {
    const project = {
        id: 'czech-craft',
        rating: 'CzechCraft',
        nick: 'Tlicarek',
        url: 'https://czech-craft.eu/server/mcserverlist',
        game: 'minecraft'
    };
    await voteForProject(project);
}

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

initializeConfig(true);
