// URL for the MP3 stream source
const stream_url = "https://solid2.streamupsolutions.com/proxy/wofsojak?mp=/;type=mp3";

// Prevent browser caching a few seconds when unpaused
function getRandomStreamId(stream_url) {
    return stream_url + '&' + Math.floor((Math.random() * 10000) + 1);
}

const player = document.getElementById('audio');
const playbutton = document.getElementById('playbutton');
const playbutton_icon = document.getElementById('play-pause');

player.addEventListener('pause', (evt) => {
    player.src = 'about:blank';
    player.src = getRandomStreamId(stream_url);
    player.load();
    playbutton_icon.classList = "fa-solid fa-play";
});

// Add event listener to play button
playbutton.addEventListener('click', (evt) => {
    if (player.paused) {
        player.src = 'about:blank'; // Reset the audio element
        player.pause();
        player.src = getRandomStreamId(stream_url);
        player.load();
        player.play();
        playbutton_icon.classList = "fa-solid fa-pause"
    } else {
        player.src = 'about:blank';
        player.pause();
        playbutton_icon.classList = "fa-solid fa-play"
    }
});

function SetVolume(value) {
    document.getElementById('audio').volume = value / 100;
    localStorage.setItem("volume", value);
}

// Get the volume setting from localstorage, or 100% if not in there
window.onload = function () {
    document.getElementById('volume-control').value = localStorage.getItem("volume") ?? 100;
    document.getElementById('audio').volume = (localStorage.getItem("volume") ?? 100) / 100;
}
