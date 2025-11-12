// 音乐播放器核心功能

// DOM元素
const audioPlayer = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const loopBtn = document.getElementById('loop-btn');
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.getElementById('volume-slider');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');
const progressHandle = document.querySelector('.progress-handle');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const songTitleEl = document.getElementById('song-title');
const songArtistEl = document.getElementById('song-artist');
const albumImgEl = document.getElementById('album-img');
const albumCover = document.querySelector('.album-cover');
const playlistEl = document.getElementById('playlist');
const playerContainer = document.querySelector('.music-player');

// 播放器状态
let currentSongIndex = 0;
let isPlaying = false;
let loopMode = 'none'; // none, all, one
let isDragging = false;
let volumeBeforeMute = 0.7;

// 更新音量滑块的渐变显示
function updateVolumeGradient() {
    const volumePercentage = (audioPlayer.volume * 100).toFixed(0);
    volumeSlider.style.setProperty('--volume-percentage', `${volumePercentage}%`);
}

// 初始化播放列表
function initPlaylist() {
    playlist.forEach((song, index) => {
        const li = document.createElement('li');
        li.dataset.index = index;
        li.innerHTML = `
            <div>
                <div class="song-item-title">${song.title}</div>
                <div class="song-item-artist">${song.artist}</div>
            </div>
            <span class="song-duration">--:--</span>
        `;
        li.addEventListener('click', () => {
            currentSongIndex = parseInt(li.dataset.index);
            loadSong(currentSongIndex);
            playSong();
        });
        playlistEl.appendChild(li);
    });
}

// 加载歌曲
function loadSong(index) {
    const song = playlist[index];
    
    // 更新音频源（使用默认音频作为占位符）
    audioPlayer.src = song.src;
    
    // 更新歌曲信息
    songTitleEl.textContent = song.title;
    songArtistEl.textContent = song.artist;
    
    // 更新专辑封面（使用占位符图片）
    albumImgEl.src = song.cover || 'https://via.placeholder.com/300x300?text=Music';
    
    // 更新背景（如果有）
    if (song.background) {
        playerContainer.style.backgroundImage = `url(${song.background})`;
        playerContainer.style.backgroundRepeat = 'no-repeat';
        playerContainer.style.backgroundSize = 'cover';
        playerContainer.style.backgroundPosition = 'center';
    }
    
    // 更新播放列表高亮
    updatePlaylistHighlight();
    
    // 预加载音频
    audioPlayer.load();
}

// 播放歌曲
function playSong() {
    audioPlayer.play();
    isPlaying = true;
    playBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
    `;
    albumCover.classList.add('playing');
    albumCover.style.animationPlayState = 'running';
}

// 暂停歌曲
function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    playBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    `;
    // 移除播放类以停止旋转动画，同时保持位置一致性
    albumCover.classList.remove('playing');
}

// 下一首
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    playSong(); // 总是自动播放下一首
}

// 上一首
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    if (isPlaying) {
        playSong();
    }
}

// 更新进度条
function updateProgress() {
    const { duration, currentTime } = audioPlayer;
    
    if (!isNaN(duration)) {
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        progressHandle.style.left = `${progressPercent}%`;
        
        // 更新时间显示
        currentTimeEl.textContent = formatTime(currentTime);
        totalTimeEl.textContent = formatTime(duration);
    }
}

// 格式化时间
function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// 设置进度
function setProgress(e) {
    const width = progressBar.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    
    audioPlayer.currentTime = (clickX / width) * duration;
}

// 更新播放列表高亮并滚动到当前播放歌曲
function updatePlaylistHighlight() {
    const playlistItems = playlistEl.querySelectorAll('li');
    playlistItems.forEach((item, index) => {
        if (index === currentSongIndex) {
            item.classList.add('active');
            // 滚动当前播放歌曲到视图顶部
            item.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        } else {
            item.classList.remove('active');
        }
    });
}

// 切换循环模式
function toggleLoopMode() {
    if (loopMode === 'none') {
        loopMode = 'all';
        loopBtn.classList.add('active');
        loopBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
        `;
    } else if (loopMode === 'all') {
        loopMode = 'one';
        loopBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                <circle cx="8" cy="12" r="1"></circle>
            </svg>
        `;
    } else {
        loopMode = 'none';
        loopBtn.classList.remove('active');
        loopBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
        `;
    }
}

// 切换静音
function toggleMute() {
    if (audioPlayer.volume > 0) {
        volumeBeforeMute = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeSlider.value = 0;
        volumeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M16.5 13a4.5 4.5 0 0 0 0-9 9 9 0 0 1 5 8.1L23 16v-1a9 9 0 0 1-9-9 4.5 4.5 0 0 0-9 0A9 9 0 0 1 1 8v7l3.5-3.5a4.5 4.5 0 0 0 0 9"></path>
            </svg>
        `;
    } else {
        audioPlayer.volume = volumeBeforeMute;
        volumeSlider.value = volumeBeforeMute;
        volumeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
        `;
    }
    updateVolumeGradient();
}

// 处理拖动进度条
function handleProgressDragStart(e) {
    isDragging = true;
}

function handleProgressDragMove(e) {
    if (isDragging) {
        const rect = progressBar.getBoundingClientRect();
        let clientX;
        
        if (e.type.includes('mouse')) {
            clientX = e.clientX;
        } else {
            clientX = e.touches[0].clientX;
        }
        
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        
        const percent = (x / rect.width) * 100;
        progress.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;
    }
}

function handleProgressDragEnd(e) {
    if (isDragging) {
        isDragging = false;
        const rect = progressBar.getBoundingClientRect();
        let clientX;
        
        if (e.type.includes('mouse')) {
            clientX = e.clientX;
        } else {
            clientX = e.changedTouches[0].clientX;
        }
        
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));
        
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (x / rect.width) * duration;
    }
}

// 事件监听器
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
});

prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);
loopBtn.addEventListener('click', toggleLoopMode);
volumeBtn.addEventListener('click', toggleMute);

volumeSlider.addEventListener('input', () => {
    audioPlayer.volume = volumeSlider.value;
    
    if (audioPlayer.volume > 0) {
        volumeBeforeMute = audioPlayer.volume;
        volumeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            </svg>
        `;
    }
    
    updateVolumeGradient();
});

// 进度条点击事件
progressBar.addEventListener('click', setProgress);

// 进度条拖动事件
progressHandle.addEventListener('mousedown', handleProgressDragStart);
progressHandle.addEventListener('touchstart', handleProgressDragStart, { passive: false });

document.addEventListener('mousemove', handleProgressDragMove);
document.addEventListener('touchmove', handleProgressDragMove, { passive: false });

document.addEventListener('mouseup', handleProgressDragEnd);
document.addEventListener('touchend', handleProgressDragEnd);

// 音频事件
audioPlayer.addEventListener('timeupdate', updateProgress);

audioPlayer.addEventListener('ended', () => {
    if (loopMode === 'one') {
        audioPlayer.currentTime = 0;
        playSong();
    } else {
        nextSong();
    }
});

audioPlayer.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audioPlayer.duration);
    
    // 更新对应播放列表项的时长
    const playlistItems = playlistEl.querySelectorAll('li');
    const currentItem = playlistItems[currentSongIndex];
    if (currentItem) {
        const durationEl = currentItem.querySelector('.song-duration');
        if (durationEl) {
            durationEl.textContent = formatTime(audioPlayer.duration);
        }
    }
});

// 初始化播放器
function initPlayer() {
    initPlaylist();
    loadSong(currentSongIndex);
    audioPlayer.volume = volumeSlider.value;
    
    // 更新音量渐变显示
    updateVolumeGradient();
    
    // 添加响应式设计支持
    function handleResize() {
        const width = window.innerWidth;
        if (width < 480) {
            playerContainer.style.maxWidth = '90vw';
        } else {
            playerContainer.style.maxWidth = '400px';
        }
    }
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // 由于我们现在使用真实音频文件，不再需要模拟进度更新
}

// 页面加载完成后初始化播放器
document.addEventListener('DOMContentLoaded', initPlayer);