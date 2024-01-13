// Settings to configure for your stream
const server = "https://icecast-test.purefm.xyz/"; // Icecast2 Server URL
const mountpoint = "stream"; // Mountpoint
const status = "status-json.xsl"; // Status page (leave default for icecast 2.4.4)
// const now_playing_placeholder = "The Portsmouth University Radio Experience"; // Placeholder text for the "Now Playing" text
const now_playing_placeholder = "PureFM Test Broadcast"; // Placeholder text for the "Now Playing" text

const player = document.getElementById('audio');
const playbutton = document.getElementById('playbutton');
const playbutton_icon = document.getElementById('play-pause');
const now_playing_title = document.getElementById('now-playing-title');
const stream_url = server + mountpoint;
const stream_status_url = server + status;

player.addEventListener('pause', (evt) => {
    player.src = 'about:blank';
    player.src = stream_url;
    player.load();
    playbutton_icon.classList = "fa-solid fa-play";
});

// Add event listener to play button
playbutton.addEventListener('click', (evt) => {
    if (player.paused) {
        player.src = 'about:blank'; // Reset the audio element
        player.pause();
        player.src = stream_url; // We don't need to fix the cache as icecast is less bad than shoutcast
        player.load();
        player.play();
        playbutton_icon.classList = "fa-solid fa-pause"
    } else {
        player.src = 'about:blank';
        player.pause();
        playbutton_icon.classList = "fa-solid fa-play"
    }
});

function setVolume(value) {
    document.getElementById('audio').volume = value / 100;
    localStorage.setItem("volume", value);
}

async function get(url) {
    const response = await fetch(url);

    if (response.status === 200) {
        return response.json();
    } else {
        return "";
    }
}

async function updateNowPlayingInfo() {
    const icecast_status = await get(stream_status_url);

    if (icecast_status === "") {
        now_playing_title.innerText = now_playing_placeholder;
    } else {
        icecast_status.icestats.source.forEach((source) => {
            if (source.listenurl.endsWith(mountpoint)) {
                if (source.title === undefined || source.title === null || source.title === "") {
                    now_playing_title.innerText = now_playing_placeholder;
                } else {
                    now_playing_title.innerText = source.title;
                }
            }
        });
    }
}

document.getElementById('share-button').addEventListener('click', async () => {
    if (navigator.share) {
        await navigator.share({
            title: "Listen to PureFM!",
            text: "Listen to PureFM live now!",
            url: "https://listen.thisispurefm.com/",
        })
        .then(() => console.log("Share successful"))
        .catch((error) => console.log ("Failed to share - ", error));
    } else {
        console.log("navigator.share not supported, copying to clipboard");
        navigator.clipboard.writeText("Listen to PureFM now at https://listen.thisispurefm.com/");
    }
});

// Get the volume setting from localstorage, or 100% if not in there
window.onload = function () {
    document.getElementById('volume-control').value = localStorage.getItem("volume") ?? 100;
    document.getElementById('audio').volume = (localStorage.getItem("volume") ?? 100) / 100;
    
    player.innerHTML += `<a>${stream_url}</a>`;
    
    now_playing_title.innerText = now_playing_placeholder;

    updateNowPlayingInfo();

    setInterval(updateNowPlayingInfo, 5 * 1000);
}
