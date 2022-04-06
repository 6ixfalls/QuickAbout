const userid = "303173495918034945";

const cdnURL = `https://dcdn.dstn.to/profile/${userid}/`;
const lanyardURL = `https://api.lanyard.rest/v1/users/${userid}/`;

let badgesContainer;
let connectionsContainer;
let tooltipNode;

const descriptions = {
    "staff": "Discord Staff",
    "partner": "Partnered Server Owner",
    "hypesquad_events": "HypeSquad Events",
    "bravery": "HypeSquad Bravery",
    "brilliance": "HypeSquad Brilliance",
    "balance": "HypeSquad Balance",
    "bughunter_1": "Discord Bug Hunter",
    "bughunter_2": "Discord Bug Hunter",
    "developer": "Early Verified Bot Developer",
    "early_supporter": "Early Supporter",
    "moderator": "Discord Certified Moderator"
};

const StatusMap = {
    "online": "#43B581",
    "idle": "#FAA61A",
    "dnd": "#F04747",
    "offline": "#747F8D",
    "streaming": "#593695"
}

const checkElement = async selector => {
    while (document.querySelector(selector) === null) {
        await new Promise(resolve => { requestAnimationFrame(resolve) })
    }
    return document.querySelector(selector);
};

function getFlags(flag) {
    let flags = [];

    if (flag & 1) flags.push("staff");
    if (flag & 2) flags.push("partner");
    if (flag & 4) flags.push("hypesquad_events");
    if (flag & 8) flags.push("bughunter_1");
    if (flag & 64) flags.push("bravery");
    if (flag & 128) flags.push("brilliance");
    if (flag & 256) flags.push("balance");
    if (flag & 512) flags.push("early_supporter");
    if (flag & 16384) flags.push("bughunter_2");
    if (flag & 131072) flags.push("developer");
    if (flag & 262144) flags.push("moderator");

    return flags;
};

function getBoostFlagForTimestamp(timestamp) {
    const timeDate = Math.ceil(moment().diff(moment(timestamp), 'months', true));

    if (timeDate >= 24)
        return "booster_9";
    else if (timeDate >= 18)
        return "booster_8";
    else if (timeDate >= 15)
        return "booster_7";
    else if (timeDate >= 12)
        return "booster_6";
    else if (timeDate >= 9)
        return "booster_5";
    else if (timeDate >= 6)
        return "booster_4";
    else if (timeDate >= 3)
        return "booster_3";
    else if (timeDate >= 2)
        return "booster_2";
    else
        return "booster_1";
}

function getOffset(el) {
    var rect = el.getBoundingClientRect();
    return { top: rect.top, left: rect.left };
}

async function addBadge(badgeAsset, tooltip) {
    const badge = document.createElement("div");
    badge.style = `background-image: url("assets/badges/${badgeAsset}.svg");`;
    badge.className = "badge";

    let currentTooltip;

    badge.addEventListener("mouseover", async () => {
        currentTooltip = tooltipNode.cloneNode(true);

        currentTooltip.classList.add("fade-out");
        document.body.appendChild(currentTooltip);

        currentTooltip.querySelector(".text").innerHTML = tooltip;
        currentTooltip.style = `top: ${getOffset(badge).top - currentTooltip.clientHeight - 25}px; left: ${getOffset(badge).left - (currentTooltip.clientWidth / 2) + 10}px;`;

        requestAnimationFrame(() => currentTooltip.classList.remove("fade-out"));
    });

    badge.addEventListener("mouseout", () => {
        if (currentTooltip) {
            currentTooltip.classList.add("fade-out");
            let oldTooltip = currentTooltip;
            currentTooltip = null;
            setTimeout(() => {
                oldTooltip.remove();
            }, 100);
        }
    });

    badgesContainer.appendChild(badge);
}

async function addConnection(badgeAsset, tooltip) {
    const badge = document.createElement("div");
    badge.style = `background-image: url("assets/connections/${badgeAsset}.svg");`;
    badge.className = "badge";

    let currentTooltip;

    badge.addEventListener("mouseover", async () => {
        currentTooltip = tooltipNode.cloneNode(true);

        currentTooltip.classList.add("fade-out");
        document.body.appendChild(currentTooltip);

        currentTooltip.querySelector(".text").innerHTML = tooltip;
        currentTooltip.style = `top: ${getOffset(badge).top - currentTooltip.clientHeight - 15}px; left: ${getOffset(badge).left - (currentTooltip.clientWidth / 2) + 10}px;`;

        requestAnimationFrame(() => currentTooltip.classList.remove("fade-out"));
    });

    badge.addEventListener("mouseout", () => {
        if (currentTooltip) {
            currentTooltip.classList.add("fade-out");
            let oldTooltip = currentTooltip;
            currentTooltip = null;
            setTimeout(() => {
                oldTooltip.remove();
            }, 100);
        }
    });

    connectionsContainer.appendChild(badge);
}

function linkify(ele) {
    var newStr = ele.innerHTML.replace(/(<a href=")?((https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)))(">(.*)<\/a>)?/gi, function () {

        return '<a href="' + arguments[2] + '">' + (arguments[7] || arguments[2]) + '</a>'
    });
    ele.innerHTML = newStr;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

(async () => {
    badgesContainer = await checkElement(".badges#badges");
    connectionsContainer = await checkElement(".connections#connections");

    let tooltip = await checkElement(".tooltip");
    tooltipNode = tooltip.cloneNode(true);
    tooltipNode.style.display = "block";
    tooltip.remove();

    const userData = await axios(cdnURL);
    const lanyardData = await axios(lanyardURL);

    for (const badgeFlag of getFlags(userData.data.user.flags || userData.data.user.public_flags || 0)) {
        addBadge(badgeFlag, descriptions[badgeFlag]);
    }

    for (const account of userData.data.connected_accounts) {
        addConnection(account.type, capitalizeFirstLetter(account.type) + ": " + account.name);
    }

    addConnection("roblox", "Roblox: hvrtlvs");

    if (userData.data.premium_since)
        addBadge("nitro", `Subscriber since ${moment(userData.data.premium_since).format("MMM D, YYYY")}`);

    if (userData.data.user.banner)
        addBadge(getBoostFlagForTimestamp(userData.data.premium_since), `Server boosting since ${moment(userData.data.premium_since).format("MMM D, YYYY")} (Estimated)`);

    if (lanyardData.data.data.listening_to_spotify && lanyardData.data.data.activities.length == 1) {
        document.documentElement.style.setProperty("--status-bg", "#1db653");
        (await checkElement(".user-status .title")).innerHTML = "Listening to Spotify";
    } else if (lanyardData.data.data.activities.length == 0) {
        (await checkElement(".user-status .title")).remove();
    }

    // username
    (await checkElement(".username")).innerHTML = userData.data.user.username;
    (await checkElement(".discriminator")).innerHTML = "#" + userData.data.user.discriminator;

    let pronouns = await checkElement(".pronouns");
    pronouns.innerHTML = lanyardData.data.data.kv.pronouns;

    let bioText = await checkElement(".about .text");
    bioText.innerHTML = lanyardData.data.data.kv.bio.replace(/\\n/g, "<br>");
    linkify(bioText);

    document.documentElement.style.setProperty("--status-color", StatusMap[lanyardData.data.data.discord_status]);
})();
