// Settings to configure for your stream
const server = "https://icecast-test.purefm.xyz/"; // Icecast2 Server URL
const mountpoint = "stream"; // Mountpoint
const status = "status-json.xsl"; // Status page (leave default for icecast 2.4.4+)
const station = "PureFM"; // Name of the radio station (Shows in MPRIS and windows media controls)
// const now_playing_placeholder = "The Portsmouth University Radio Experience"; // Placeholder text for the "Now Playing" text
const now_playing_placeholder = "PureFM Test Broadcast"; // Placeholder text for the "Now Playing" text

const player = document.getElementById('audio');
const playbutton = document.getElementById('playbutton');
const playbutton_icon = document.getElementById('play-pause');
const now_playing_title = document.querySelectorAll('.now-playing-title');
const stream_url = server + mountpoint;
const stream_status_url = server + status;
const fs_button = document.getElementById("fs-button");

player.addEventListener('pause', (evt) => {
    player.src = 'about:blank';
    player.src = stream_url;
    player.load();
    playbutton_icon.classList = "fa-solid fa-play";
});

// Add event listener to play button
playbutton.addEventListener('click', (evt) => {
    if (player.paused) {
        play();
        playbutton_icon.classList = "fa-solid fa-pause"
    } else {
        pause();
    }
});

function play() {
    player.src = 'about:blank'; // Reset the audio element
    player.pause();
    player.src = stream_url;
    player.load();
    player.play();
    playbutton_icon.classList = "fa-solid fa-pause"
}

function pause() {
    player.src = 'about:blank';
    player.pause();
    playbutton_icon.classList = "fa-solid fa-play"
}

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

function updateMediaSession(track) {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track,
            artist: station,
            artwork: [{ src: "assets/icon_512.png" }],
        });
    }
}

async function updateNowPlayingInfo() {
    const icecast_status = await get(stream_status_url);

    if (icecast_status === "") {
        now_playing_title.forEach((span) => {
            span.innerText = now_playing_placeholder;
        });
        updateMediaSession(now_playing_placeholder);
    } else {
        icecast_status.icestats.source.forEach((source) => {
            if (source.listenurl.endsWith(mountpoint)) {
                if (source.title === undefined || source.title === null || source.title === "") {
                    now_playing_title.forEach((span) => {
                        span.innerText = now_playing_placeholder;
                    });
                    updateMediaSession(now_playing_placeholder);
                } else {
                    now_playing_title.forEach((span) => {
                        span.innerText = source.title;
                    });
                    updateMediaSession(source.title);
                }
            }
        });
    }
}

function toggleFullscreen() {
    const body = document.querySelector("body");
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        body.requestFullscreen();
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
    
    now_playing_title.innerText = now_playing_placeholder;

    updateNowPlayingInfo();

    setInterval(updateNowPlayingInfo, 5 * 1000);
}

document.addEventListener('fullscreenchange', (event) => {
    if (document.fullscreenElement) {
        play();
        fs_button.innerHTML = "<i class=\"fa-solid fa-compress\"></i>"
    } else {
        fs_button.innerHTML = "<i class=\"fa-solid fa-expand\"></i>";
    }
});