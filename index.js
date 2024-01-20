"use strict";

const userid = "303173495918034945";

const cdnURL = `https://dcdn.dstn.to/profile/${userid}/`;
const lanyardURL = `https://api.lanyard.rest/v1/users/${userid}/`;

let badgesContainer;
let connectionsContainer;

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
    "moderator": "Discord Certified Moderator",
    "active_developer": "Active Developer"
};

const StatusMap = {
    "online": "#43B581",
    "idle": "#FAA61A",
    "dnd": "#F04747",
    "offline": "#747F8D",
    "streaming": "#593695"
};

async function checkElement(selector) {
    while (document.querySelector(selector) === null) {
        await new Promise(requestAnimationFrame);
    }
    return document.querySelector(selector);
}

function elapsedTime(timestamp, endTime) {
    let startTime = timestamp;
    if (!endTime) endTime = Number(new Date());

    let difference = (endTime - startTime) / 1000;

    // we only calculate them, but we don't display them.
    // this fixes a bug in the Discord API that does not send the correct timestamp to presence.
    let daysDifference = Math.floor(difference / 60 / 60 / 24);
    difference -= daysDifference * 60 * 60 * 24;

    let hoursDifference = Math.floor(difference / 60 / 60);
    difference -= hoursDifference * 60 * 60;

    let minutesDifference = Math.floor(difference / 60);
    difference -= minutesDifference * 60;

    let secondsDifference = Math.floor(difference);

    return `${hoursDifference >= 1 ? ("0" + hoursDifference).slice(-2) + ":" : ""}${("0" + minutesDifference).slice(
        -2
    )}:${("0" + secondsDifference).slice(-2)}`;
}

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
    if (flag & 4194304) flags.push("active_developer");

    return flags;
}

function getBoostFlagForTimestamp(timestamp) {
    const timeDate = Math.ceil(moment().diff(moment(timestamp), "months", true));

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

async function addBadge(badgeAsset, tooltip) {
    const badge = document.createElement("div");
    badge.style = `background-image: url("assets/badges/${badgeAsset}.svg");`;
    badge.className = "badge tippy";
    badge.dataset.tippyContent = tooltip;

    badgesContainer.appendChild(badge);
}

async function addConnection(badgeAsset, tooltip) {
    const badge = document.createElement("div");
    badge.style = `background-image: url("assets/connections/${badgeAsset}.svg");`;
    badge.className = "badge tippy";
    badge.dataset.tippyContent = tooltip;

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

    let pronouns = await checkElement(".pronouns");
    let bioText = await checkElement(".about .text");
    let mainImage = await checkElement(".content .img .main");
    let smallImage = await checkElement(".content .img .sub");
    let activityTitle = await checkElement(".text .activitytitle");
    let details = await checkElement(".text .details");
    let state = await checkElement(".text .state");
    let timestamp = await checkElement(".text .timestamp");
    let spotify = await checkElement(".content .spotify");
    let title = await checkElement(".user-status .title");
    let userStatus = await checkElement(".user-status");

    const userData = await axios(cdnURL);
    let timestampTimeout;
    lanyard({
        userId: userid,
        socket: true,
        onPresenceUpdate: (presence) => {
            pronouns.innerHTML = presence.kv.pronouns;
            bioText.innerHTML = presence.kv.bio.replace(/\\n/g, "<br>");
            linkify(bioText);

            document.documentElement.style.setProperty("--status-color", StatusMap[presence.discord_status]);

            if (presence.activities.length > 0) {
                userStatus.style.display = "block";
                let activity = presence.activities.find(activity => activity.type === 0 || activity.type === 2);

                if (!activity) activity = presence.activities[0];

                if (activity.type === 0) {
                    mainImage.classList.add("round");
                    document.documentElement.style.setProperty("--status-bg", "#7289da");
                    title.innerHTML = "Playing a game";
                    mainImage._tippy.setContent(undefined);
                    smallImage._tippy.setContent(undefined);

                    activityTitle.querySelector("span").innerHTML = _.escape(activity.name);
                    if (timestampTimeout) {
                        clearInterval(timestampTimeout);
                    }
                    spotify.style.display = "none";
                    if (activity.timestamps) {
                        timestamp.style.display = "block";
                        timestamp.innerHTML = elapsedTime(activity.timestamps.start) + " elapsed";
                        timestampTimeout = setInterval(() => {
                            timestamp.innerHTML = elapsedTime(activity.timestamps.start) + " elapsed";
                        }, 900);
                    } else {
                        timestamp.style.display = "none";
                    }

                    if (activity.details || activity.state || activity.assets) {
                        mainImage.parentNode.classList.remove("small");
                        mainImage.classList.remove("small");
                    } else {
                        mainImage.parentNode.classList.add("small");
                        mainImage.classList.add("small");
                    }

                    if (activity.details) {
                        details.innerHTML = _.escape(activity.details);
                        details.style.display = "block";
                    } else {
                        details.style.display = "none";
                    }

                    if (activity.state) {
                        state.innerHTML = _.escape(activity.state);
                        state.style.display = "block";
                    } else {
                        state.style.display = "none";
                    }

                    if (activity.assets) {
                        mainImage._tippy.setContent(_.escape(activity.assets.large_text));
                        smallImage._tippy.setContent(_.escape(activity.assets.small_text));

                        if (activity.assets.large_image) {
                            mainImage.src = activity.assets.large_image.startsWith("mp:external/")
                                ? `https://media.discordapp.net/external/${activity.assets.large_image.replace("mp:external/", "")}`
                                : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.webp`;
                        } else {
                            mainImage.src = "images/unknown.png";
                        }

                        if (activity.assets.small_image) {
                            mainImage.classList.add("mask");
                            smallImage.style.display = "block";
                            smallImage.src = activity.assets.small_image.startsWith("mp:external/")
                                ? `https://media.discordapp.net/external/${activity.assets.small_image.replace("mp:external/", "")}`
                                : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.webp`;
                        } else {
                            mainImage.classList.remove("mask");
                            smallImage.style.display = "none";
                        }
                    } else {
                        mainImage.src = `https://dcdn.dstn.to/app-icons/${activity.application_id}`;
                        mainImage.classList.remove("mask");
                        smallImage.style.display = "none";
                    }
                } else if (activity.type == "2") {
                    document.documentElement.style.setProperty("--status-bg", "#1db653");
                    title.innerHTML = "Listening to Spotify";
                    mainImage.classList.remove("round");
                    mainImage.classList.remove("mask");
                    mainImage.parentNode.classList.remove("small");
                    mainImage.classList.remove("small");
                    smallImage.style.display = "none";
                    mainImage.src = presence.spotify.album_art_url;

                    mainImage._tippy.setContent(_.escape(presence.spotify.song));
                    smallImage._tippy.setContent(undefined);

                    activityTitle.querySelector("span").innerHTML = _.escape(presence.spotify.song);
                    details.innerHTML = "by " + _.escape(presence.spotify.artist);
                    details.style.display = "block";
                    state.innerHTML = "on " + _.escape(presence.spotify.album);
                    state.style.display = "block";
                    if (timestampTimeout) {
                        clearInterval(timestampTimeout);
                    }
                    let length = (presence.spotify.timestamps.end - presence.spotify.timestamps.start) / 1000;
                    let elapsed = (Number(new Date()) - presence.spotify.timestamps.start) / 1000;
                    spotify.querySelector(".inner").style.width = Math.min((elapsed / length) * 100, 100) + "%";
                    spotify.querySelector(".start").innerHTML = elapsedTime(presence.spotify.timestamps.start);
                    spotify.querySelector(".end").innerHTML = elapsedTime(presence.spotify.timestamps.start, presence.spotify.timestamps.end);

                    timestampTimeout = setInterval(() => {
                        let length = (presence.spotify.timestamps.end - presence.spotify.timestamps.start) / 1000;
                        let elapsed = (Number(new Date()) - presence.spotify.timestamps.start) / 1000;
                        spotify.querySelector(".inner").style.width = Math.min((elapsed / length) * 100, 100) + "%";
                        spotify.querySelector(".start").innerHTML = elapsedTime(presence.spotify.timestamps.start);
                    }, 900);
                    spotify.style.display = "block";
                    timestamp.style.display = "none";
                } else if (activity.type === 4) {
                    if (timestampTimeout) {
                        clearInterval(timestampTimeout);
                    }

                    userStatus.style.display = "none";
                }
            } else {
                if (timestampTimeout) {
                    clearInterval(timestampTimeout);
                }

                userStatus.style.display = "none";
            }
        },
    })

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
        addBadge(getBoostFlagForTimestamp(userData.data.premium_guild_since), `Server boosting since ${moment(userData.data.premium_guild_since).format("MMM D, YYYY")}`);

    // username
    (await checkElement(".username")).innerHTML = _.escape(userData.data.user.username);

    tippy(".tippy", {
        animation: true,
        render(instance) {
            const popper = document.createElement("div");
            const tooltip = document.createElement("div");
            tooltip.className = "tooltip";
            const arrow = document.createElement("div");
            arrow.className = "arrow";
            const text = document.createElement("div");
            text.className = "text";
            text.textContent = _.escape(instance.props.content);
            tooltip.appendChild(arrow);
            tooltip.appendChild(text);
            popper.appendChild(tooltip);

            function onUpdate(prevProps, nextProps) {
                if (prevProps.content !== nextProps.content) {
                    text.textContent = _.escape(nextProps.content);
                }
            }

            return {
                popper,
                onUpdate,
            };
        },
        onShow(instance) {
            instance.popper.querySelector(".tooltip").classList.add("fade-out");
            requestAnimationFrame(() => instance.popper.querySelector(".tooltip").classList.remove("fade-out"));
        },
        onHide(instance) {
            instance.popper.querySelector(".tooltip").classList.add("fade-out");
            setTimeout(() => {
                instance.unmount();
            }, 100);
        }
    });
})();
