let currentScripts = [];
let isPlaying = false;
let currentVolume = 50;
let currentTrackIndex = 1;
let playlist = [];
let audio = new Audio();
let lastScrollTop = 0;
let chillModeConfig = null;
let inactivityTimer = null;
let isChillMode = false;

function handleScroll() {
    const nav = document.querySelector('nav');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    if (currentScroll > lastScrollTop && currentScroll > 100) {

        nav.classList.add('nav-hidden');
    } else {

        nav.classList.remove('nav-hidden');
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}

function toggleMusicControls() {
    const musicToggle = document.getElementById('musicToggle');
    const musicControls = document.querySelector('.music-controls');

    musicToggle.classList.toggle('active');
    musicControls.classList.toggle('show');
}

async function loadScripts() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();

        currentScripts = data.scripts.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });

        if (data.music) {
            playlist = data.music.playlist;
            currentVolume = data.music.defaultVolume;
            initializeMusic();
        }

        if (data.logo) {
            document.getElementById('siteLogo').src = data.logo;
        }

        if (data.chillMode) {
            chillModeConfig = data.chillMode;
            if (chillModeConfig.enabled) {
                document.documentElement.style.setProperty('--fade-duration', chillModeConfig.fadeInDuration);
                document.documentElement.style.setProperty('--blur-amount', chillModeConfig.blurAmount);
                setupChillMode();
            }
        }

        const container = document.getElementById('scriptsContainer');
        container.innerHTML = '';
        currentScripts.forEach(script => {
            const card = document.createElement('div');
            card.className = `script-card ${script.isPinned ? 'pinned' : ''}`;
            card.onclick = () => showModal(script);

            card.addEventListener('mouseenter', () => {
                document.querySelectorAll('.script-card').forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.add('dim');
                    }
                });
            });

            card.addEventListener('mouseleave', () => {
                document.querySelectorAll('.script-card').forEach(otherCard => {
                    otherCard.classList.remove('dim');
                });
            });

            let cardContent = '';

            if (script.status) {
                const statusClasses = {
                    'undetected': 'undetected',
                    'risk': 'risk',
                    'updating': 'updating'
                };
                const statusClass = statusClasses[script.status.toLowerCase()] || '';
                if (statusClass) {
                    cardContent += `<div class="status-tag ${statusClass}">${script.status}</div>`;
                }
            }

            cardContent += `
                <img src="${script.image}" alt="${script.title}">
                <h3>${script.title}</h3>
                <div class="category">${script.category}</div>
            `;

            card.innerHTML = cardContent;
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}

function initializeMusic() {
    if (playlist.length > 0) {
        audio.src = playlist[currentTrackIndex].path;
        audio.volume = currentVolume / 100;

        audio.addEventListener('ended', () => {
            nextTrack();
        });

        isPlaying = false;
        document.querySelector('#playPauseBtn i').className = 'fas fa-play';
    }
}

function togglePlay() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playPauseIcon = playPauseBtn.querySelector('i');

    if (!audio.src && playlist.length > 0) {
        audio.src = playlist[currentTrackIndex].path;
    }

    if (isPlaying) {
        audio.pause();
        playPauseIcon.className = 'fas fa-play';
    } else {
        audio.play();
        playPauseIcon.className = 'fas fa-pause';
    }
    isPlaying = !isPlaying;
}

function updateVolume(value) {
    currentVolume = value;
    audio.volume = value / 100;

    const volumeIcon = document.querySelector('.fa-volume-up');
    if (value > 50) {
        volumeIcon.className = 'fas fa-volume-up';
    } else if (value > 0) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-mute';
    }
}

function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    audio.src = playlist[currentTrackIndex].path;
    if (isPlaying) {
        audio.play();
    }
}

function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    audio.src = playlist[currentTrackIndex].path;
    if (isPlaying) {
        audio.play();
    }
}

function showModal(script) {
    const modal = document.getElementById('scriptModal');
    const modalTitle = document.getElementById('modalTitle');
    const errorFixes = document.getElementById('errorFixes');
    const howToUse = document.getElementById('howToUse');
    const downloadButton = document.getElementById('downloadButton');

    modalTitle.textContent = script.description.title;

    errorFixes.innerHTML = '';
    script.description.errorFixes.forEach(fix => {
        const li = document.createElement('li');
        if (typeof fix === 'object' && fix.error) {
            li.className = 'error-fix-item';
            li.innerHTML = `
                <span class="error-code">${fix.error}</span>
                <span>${fix.fix}</span>
                ${fix.fixFile ? `
                    <a href="${fix.fixFile}" class="fix-file-link" download>
                        <i class="fas fa-file-download"></i>
                    </a>
                ` : ''}
            `;
        } else {
            li.textContent = fix;
        }
        errorFixes.appendChild(li);
    });

    const formattedHowToUse = script.description.howToUse
        .split('\n')
        .map(line => {
            if (line.trim().toLowerCase().startsWith('step')) {
                return `\n${line}`;
            }
            return line;
        })
        .join('\n');

    howToUse.style.whiteSpace = 'pre-line';
    howToUse.textContent = formattedHowToUse;

    if (typeof script.description.downloadButton === 'object') {
        downloadButton.textContent = script.description.downloadButton.text;
        downloadButton.href = script.description.downloadButton.path;
    } else {
        downloadButton.textContent = script.description.downloadButton;
    }
    downloadButton.setAttribute('download', '');

    const existingVideo = document.querySelector('.modal-video');
    if (existingVideo) {
        existingVideo.remove();
    }

    if (script.description.video) {
        const videoContainer = document.createElement('div');
        videoContainer.className = 'modal-video';
        videoContainer.innerHTML = `
            <video ${script.description.video.autoplay ? 'autoplay' : ''} 
                   ${script.description.video.loop ? 'loop' : ''} 
                   muted>
                <source src="${script.description.video.path}" type="video/mp4">
            </video>
            <div class="video-controls">
                <button class="video-button play-pause">
                    <i class="fas fa-pause"></i>
                </button>
                <div class="video-progress">
                    <div class="video-progress-filled"></div>
                </div>
                <div class="video-volume-control">
                    <button class="video-button mute">
                        <i class="fas fa-volume-mute"></i>
                    </button>
                    <input type="range" class="video-volume-slider" min="0" max="100" value="0">
                </div>
                <button class="video-button fullscreen">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;
        
        const modalSections = document.querySelectorAll('.modal-section');
        if (modalSections.length >= 2) {
            modalSections[1].appendChild(videoContainer);
            setupVideoControls(videoContainer);
        }
    }

    const existingChangelogSection = document.querySelector('.changelog-section');
    if (existingChangelogSection) {
        existingChangelogSection.remove();
    }

    const existingChangelogButton = document.querySelector('.changelog-button');
    if (existingChangelogButton) {
        existingChangelogButton.remove();
    }

    if (script.description.changelogs && script.description.changelogs.length > 0) {
        const changelogButton = document.createElement('button');
        changelogButton.className = 'changelog-button';
        changelogButton.innerHTML = '<i class="fas fa-history"></i> Changelogs';
        
        const changelogSection = document.createElement('div');
        changelogSection.className = 'changelog-section';
        changelogSection.style.transform = 'translateX(0)';

        const groupedChanges = script.description.changelogs.map(log => {
            const changes = {
                added: log.changes.filter(c => c.type === 'added'),
                fixed: log.changes.filter(c => c.type === 'fixed'),
                removed: log.changes.filter(c => c.type === 'removed')
            };

            return {
                version: log.version,
                changes
            };
        });

        changelogSection.innerHTML = `
            <h3 class="changelog-header">Changelogs</h3>
            ${groupedChanges.map(log => `
                <div class="changelog-version">Version ${log.version}</div>
                <div class="changelog-list">
                    ${log.changes.added.length ? `
                        <div class="changelog-type-header added">NEW - added</div>
                        ${log.changes.added.map(change => `
                            <div class="changelog-item">
                                <span class="changelog-type added">added</span>
                                <span>${change.text}</span>
                            </div>
                        `).join('')}
                    ` : ''}
                    
                    ${log.changes.fixed.length ? `
                        <div class="changelog-type-header fixed">FIXED - Updated</div>
                        ${log.changes.fixed.map(change => `
                            <div class="changelog-item">
                                <span class="changelog-type fixed">fixed</span>
                                <span>${change.text}</span>
                            </div>
                        `).join('')}
                    ` : ''}
                    
                    ${log.changes.removed.length ? `
                        <div class="changelog-type-header removed">DELETED - removed</div>
                        ${log.changes.removed.map(change => `
                            <div class="changelog-item">
                                <span class="changelog-type removed">removed</span>
                                <span>${change.text}</span>
                            </div>
                        `).join('')}
                    ` : ''}
                </div>
            `).join('')}
        `;

        let isChangelogVisible = false;
        changelogButton.addEventListener('click', () => {
            if (!isChangelogVisible) {
                changelogSection.style.visibility = 'visible';
                requestAnimationFrame(() => {
                    changelogSection.classList.add('show');
                });
                isChangelogVisible = true;
            } else {
                changelogSection.classList.remove('show');
                changelogSection.classList.add('hiding');
                
                changelogSection.addEventListener('transitionend', function hideSection(e) {
                    if (e.propertyName === 'opacity') {
                        changelogSection.classList.remove('hiding');
                        changelogSection.style.visibility = 'hidden';
                        changelogSection.removeEventListener('transitionend', hideSection);
                    }
                });
                isChangelogVisible = false;
            }
        });

        const modalContent = document.querySelector('.modal-content');
        modalContent.insertBefore(changelogButton, downloadButton);
        modalContent.appendChild(changelogSection);
    }

    modal.style.display = 'block';

    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    document.querySelector('.close-modal').onclick = closeModal;
}

function closeModal() {
    const modal = document.getElementById('scriptModal');
    modal.style.display = 'none';
}

function setupVideoControls(videoContainer) {
    const video = videoContainer.querySelector('video');
    const playButton = videoContainer.querySelector('.play-pause');
    const muteButton = videoContainer.querySelector('.mute');
    const volumeSlider = videoContainer.querySelector('.video-volume-slider');
    const fullscreenButton = videoContainer.querySelector('.fullscreen');
    const progress = videoContainer.querySelector('.video-progress');
    const progressBar = videoContainer.querySelector('.video-progress-filled');

    video.muted = true;
    volumeSlider.value = 0;

    playButton.addEventListener('click', togglePlay);
    muteButton.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', handleVolumeChange);
    fullscreenButton.addEventListener('click', toggleFullscreen);
    video.addEventListener('timeupdate', handleProgress);
    progress.addEventListener('click', scrub);

    function togglePlay() {
        const icon = playButton.querySelector('i');
        if (video.paused) {
            video.play();
            icon.className = 'fas fa-pause';
        } else {
            video.pause();
            icon.className = 'fas fa-play';
        }
    }

    function toggleMute() {
        video.muted = !video.muted;
        const icon = muteButton.querySelector('i');
        if (video.muted) {
            icon.className = 'fas fa-volume-mute';
            volumeSlider.value = 0;
        } else {
            icon.className = 'fas fa-volume-up';
            volumeSlider.value = 100;
            video.volume = 1;
        }
    }

    function handleVolumeChange(e) {
        const value = e.target.value;
        video.volume = value / 100;
        video.muted = value === '0';
        const icon = muteButton.querySelector('i');
        if (value === '0') {
            icon.className = 'fas fa-volume-mute';
        } else if (value < 50) {
            icon.className = 'fas fa-volume-down';
        } else {
            icon.className = 'fas fa-volume-up';
        }
    }

    function toggleFullscreen() {
        const icon = fullscreenButton.querySelector('i');
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            icon.className = 'fas fa-compress';
        } else {
            document.exitFullscreen();
            icon.className = 'fas fa-expand';
        }
    }

    function handleProgress() {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
    }

    function scrub(e) {
        const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
        video.currentTime = scrubTime;
    }

    video.volume = volumeSlider.value / 100;
}

document.addEventListener('DOMContentLoaded', () => {
    loadScripts();

    document.getElementById('musicToggle').addEventListener('click', toggleMusicControls);
    document.getElementById('playPauseBtn').addEventListener('click', togglePlay);
    document.getElementById('nextBtn').addEventListener('click', nextTrack);
    document.getElementById('prevBtn').addEventListener('click', prevTrack);
    document.getElementById('volumeSlider').addEventListener('input', (e) => updateVolume(e.target.value));

    window.addEventListener('scroll', handleScroll, { passive: true });

    updateVolume(currentVolume);

    const logo = document.getElementById('siteLogo');
    logo.addEventListener('click', () => {
        window.location.href = window.location.origin + window.location.pathname;
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

(function() {
    const _0x2c1a = [
        'querySelector',
        'credit-link',
        'innerHTML',
        'designed by: wzm2',
        'href',
        'https://discord.com/users/1103038390481465434',
        'data-v',
        'wzm2',
        'style',
        'cssText',
        'position: fixed !important; bottom: 1.5vmin !important; right: 1.5vmin !important; font-size: 1.1vmin !important; color: rgba(255, 255, 255, 0.8) !important; text-decoration: none !important; padding: 0.7vmin 1.1vmin !important; background: rgba(138, 43, 226, 0.1) !important; border: 0.1vmin solid rgba(138, 43, 226, 0.2) !important; border-radius: 2vmin !important; z-index: 999999 !important;',
        'createElement',
        'a',
        'className',
        'target',
        '_blank',
        'body',
        'appendChild',
        'display',
        'none',
        'querySelectorAll',
        'script',
        'src',
        'length',
        'remove'
    ];

    function verifyCredit() {
        const creditLink = document[_0x2c1a[0]]('.' + _0x2c1a[1]);
        if (!creditLink || !document.body.contains(creditLink)) {
            disableWebsite();
            createCredit();
            return false;
        }

        if (creditLink[_0x2c1a[2]] !== _0x2c1a[3]) {
            creditLink[_0x2c1a[2]] = _0x2c1a[3];
            disableWebsite();
        }

        if (creditLink[_0x2c1a[4]] !== _0x2c1a[5]) {
            creditLink[_0x2c1a[4]] = _0x2c1a[5];
            disableWebsite();
        }

        if (creditLink.getAttribute(_0x2c1a[6]) !== _0x2c1a[7]) {
            creditLink.setAttribute(_0x2c1a[6], _0x2c1a[7]);
            disableWebsite();
        }

        ensureStyles(creditLink);
        return true;
    }

    function createCredit() {
        const link = document[_0x2c1a[11]](_0x2c1a[12]);
        link[_0x2c1a[2]] = _0x2c1a[3];
        link[_0x2c1a[4]] = _0x2c1a[5];
        link[_0x2c1a[13]] = _0x2c1a[1];
        link.setAttribute(_0x2c1a[6], _0x2c1a[7]);
        link.setAttribute(_0x2c1a[14], _0x2c1a[15]);
        ensureStyles(link);
        document[_0x2c1a[16]][_0x2c1a[17]](link);
    }

    function ensureStyles(element) {
        if (element[_0x2c1a[8]][_0x2c1a[9]] !== _0x2c1a[10]) {
            element[_0x2c1a[8]][_0x2c1a[9]] = _0x2c1a[10];
        }
    }

    function disableWebsite() {
        document.body[_0x2c1a[8]][_0x2c1a[18]] = _0x2c1a[19];
        const scripts = document[_0x2c1a[20]](_0x2c1a[21]);
        for (let i = 0; i < scripts[_0x2c1a[23]]; i++) {
            if (scripts[i][_0x2c1a[22]]) {
                scripts[i][_0x2c1a[24]]();
            }
        }
    }

    setInterval(checkCredit, 50);

    function checkCredit() {
        if (!verifyCredit()) {
            disableWebsite();
            createCredit();
        }
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const creditLink = document.querySelector('.credit-link');
                if (!creditLink || !document.body.contains(creditLink)) {
                    disableWebsite();
                    createCredit();
                }
            }
            if (mutation.type === 'attributes' && mutation.target.classList.contains('credit-link')) {
                checkCredit();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'id']
    });

    if (!verifyCredit()) {
        disableWebsite();
        createCredit();
    }
})();

fetch('data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .catch(error => {
        console.warn('Could not load data.json:', error);
        
        const container = document.getElementById('scriptsContainer');
        if (container) {
            container.innerHTML = '<div style="text-align: center; padding: 2vmin;">Failed to load content. Please refresh the page.</div>';
        }
    });

function setupChillMode() {
    const chillModeBtn = document.getElementById('chillModeBtn');
    const chillModeOverlay = document.getElementById('chillModeOverlay');
    const chillModeImage = document.getElementById('chillModeImage');

    if (!chillModeConfig || !chillModeConfig.enabled) return;

    chillModeImage.src = chillModeConfig.image;
    
    let initialDelay = setTimeout(() => {
        resetInactivityTimer();
    }, 1000);

    const resetTimer = () => {
        if (!isChillMode) {
            resetInactivityTimer();
        }
    };

    ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });

    chillModeBtn.addEventListener('click', () => {
        toggleChillMode();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isChillMode) {
            exitChillMode();
        }
    });

    chillModeOverlay.addEventListener('click', (e) => {
        if (e.target === chillModeOverlay) {
            exitChillMode();
        }
    });
}

function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    
    if (chillModeConfig && chillModeConfig.enabled && !isChillMode) {
        inactivityTimer = setTimeout(() => {
            if (!isChillMode) {
                activateChillMode();
            }
        }, chillModeConfig.timeoutSeconds * 1000);
    }
}

function activateChillMode() {
    if (!isChillMode && chillModeConfig && chillModeConfig.enabled) {
        isChillMode = true;
        const chillModeBtn = document.getElementById('chillModeBtn');
        const chillModeOverlay = document.getElementById('chillModeOverlay');
        
        if (chillModeBtn && chillModeOverlay) {
            chillModeBtn.classList.add('active');
            chillModeOverlay.classList.add('active');

            if (!isPlaying || audio.volume === 0) {
                audio.src = chillModeConfig.audioPath;
                audio.volume = chillModeConfig.forcedVolume / 100;
                const volumeSlider = document.getElementById('volumeSlider');
                if (volumeSlider) {
                    volumeSlider.value = chillModeConfig.forcedVolume;
                }
                audio.play().catch(() => {
                    console.warn('Autoplay prevented by browser');
                });
                isPlaying = true;
                const playPauseIcon = document.querySelector('#playPauseBtn i');
                if (playPauseIcon) {
                    playPauseIcon.className = 'fas fa-pause';
                }
            }
        }
    }
}

function exitChillMode() {
    if (isChillMode) {
        isChillMode = false;
        document.getElementById('chillModeBtn').classList.remove('active');
        document.getElementById('chillModeOverlay').classList.remove('active');

        const currentAudioSrc = audio.src;

        if (currentAudioSrc === new URL(chillModeConfig.audioPath, window.location.href).href) {
            audio.pause();
            audio.currentTime = 0;
            isPlaying = false;
            document.querySelector('#playPauseBtn i').className = 'fas fa-play';

            if (playlist.length > 0) {
                audio.src = playlist[currentTrackIndex].path;
            }
        }

        resetInactivityTimer();
    }
}

function toggleChillMode() {
    if (isChillMode) {
        exitChillMode();
    } else {
        activateChillMode();
    }
}
