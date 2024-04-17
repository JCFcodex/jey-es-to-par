const apiUrl = 'https://shoti-srv1.onrender.com/api/v1/get';
let autoNextEnabled = false;
let isLoading = false;

async function fetchTikTokVideo() {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ apikey: '$shoti-1hrln3g0oh199t9tu4' })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch video');
        }

        const { data } = await response.json();

        if (data && data.url) {
            const videoUrl = data.url.replace('/hdplay/', '/play/');
            const videoElement = document.getElementById('tiktokVideo');
            const videoTitleElement = document.getElementById('videoTitle');
            const regionElement = document.getElementById('region');
            const usernameElement = document.getElementById('username');
            const nicknameElement = document.getElementById('nickname');

            videoElement.src = videoUrl;
            videoTitleElement.textContent = data.title;
            regionElement.textContent = `Region: ${data.region}`;
            usernameElement.textContent = `Username: ${data.user.username}`;
            nicknameElement.textContent = `Nickname: ${data.user.nickname}`;

            videoElement.addEventListener('loadedmetadata', () => {
                isLoading = false;
                document.getElementById('nextButton').disabled = false;
            });

            if (autoNextEnabled) {
                videoElement.addEventListener('ended', () => {
                    if (!isLoading) {
                        fetchAndDisplayTikTokVideo();
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error fetching TikTok video:', error);
        // If fetch failed, try fetching again
        if (!isLoading) {
            fetchAndDisplayTikTokVideo();
        }
    }
}

function fetchAndDisplayTikTokVideo() {
    isLoading = true;
    document.getElementById('nextButton').disabled = true;
    fetchTikTokVideo();
}

document.addEventListener('DOMContentLoaded', () => {
    const nextButton = document.getElementById('nextButton');
    const autoNextButton = document.getElementById('autoNextButton');

    nextButton.addEventListener('click', fetchAndDisplayTikTokVideo);

    autoNextButton.addEventListener('click', () => {
        autoNextEnabled = !autoNextEnabled;
        autoNextButton.textContent = `Auto Next: ${autoNextEnabled ? 'ON' : 'OFF'}`;

        if (autoNextEnabled && !isLoading) {
            fetchAndDisplayTikTokVideo();
        }
    });

    fetchAndDisplayTikTokVideo(); // Initial video load
});
