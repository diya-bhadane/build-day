const timerInput = document.getElementById('timerInput');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const progressRing = document.getElementById('progressRing');
const timerCard = document.getElementById('timerCard');
const inputSection = document.getElementById('inputSection');
const particlesContainer = document.getElementById('particles');
const confettiCanvas = document.getElementById('confetti');
const confettiCtx = confettiCanvas.getContext('2d');

let countdown = null;
let totalSeconds = 0;
let remainingSeconds = 0;
let isRunning = false;

const RING_CIRCUMFERENCE = 2 * Math.PI * 90;
const COLORS = ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffbe0b', '#fb5607'];

let audioContext = null;
let confettiParticles = [];
let confettiAnimationId = null;

function createBackgroundParticles() {
    if (!particlesContainer) return;

    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';

        const size = Math.random() * 3 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
        particle.style.boxShadow = `0 0 ${size * 2}px ${particle.style.background}`;
        particle.style.animationDuration = (Math.random() * 10 + 12) + 's';
        particle.style.animationDelay = (Math.random() * 10) + 's';

        particlesContainer.appendChild(particle);
    }
}

function initConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

class ConfettiParticle {
    constructor() {
        this.x = confettiCanvas.width / 2;
        this.y = confettiCanvas.height / 2;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.size = Math.random() * 10 + 5;
        this.speedX = (Math.random() - 0.5) * 20;
        this.speedY = (Math.random() - 0.5) * 20 - 8;
        this.gravity = 0.4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 8;
        this.opacity = 1;
        this.decay = Math.random() * 0.01 + 0.008;
        this.shape = Math.floor(Math.random() * 3);
    }

    update() {
        this.speedY += this.gravity;
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.decay;
        this.speedX *= 0.99;
    }

    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate(this.rotation * Math.PI / 180);
        confettiCtx.globalAlpha = Math.max(0, this.opacity);
        confettiCtx.fillStyle = this.color;
        confettiCtx.shadowColor = this.color;
        confettiCtx.shadowBlur = 8;

        if (this.shape === 0) {
            confettiCtx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        } else if (this.shape === 1) {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        } else {
            confettiCtx.beginPath();
            confettiCtx.moveTo(0, -this.size / 2);
            confettiCtx.lineTo(this.size / 2, this.size / 2);
            confettiCtx.lineTo(-this.size / 2, this.size / 2);
            confettiCtx.closePath();
            confettiCtx.fill();
        }

        confettiCtx.restore();
    }
}

function launchConfetti() {
    if (!confettiCanvas || !confettiCtx) return;

    confettiParticles = [];
    for (let i = 0; i < 120; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
    animateConfetti();
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles = confettiParticles.filter(p => p.opacity > 0);

    confettiParticles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }
}

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
}

function playAlertSound() {
    try {
        const ctx = initAudioContext();
        const now = ctx.currentTime;

        const notes = [
            { freq: 523.25, time: 0 },
            { freq: 659.25, time: 0.1 },
            { freq: 783.99, time: 0.2 },
            { freq: 1046.50, time: 0.3 },
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.value = note.freq;

            const start = now + note.time;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.15, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

            osc.start(start);
            osc.stop(start + 0.4);
        });

        setTimeout(() => {
            const notes2 = [
                { freq: 659.25, time: 0 },
                { freq: 783.99, time: 0.08 },
                { freq: 987.77, time: 0.16 },
                { freq: 1318.51, time: 0.24 },
            ];

            notes2.forEach(note => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.type = 'triangle';
                osc.frequency.value = note.freq;

                const start = ctx.currentTime + note.time;
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

                osc.start(start);
                osc.stop(start + 0.5);
            });
        }, 350);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

const notificationBtn = document.getElementById('notificationBtn');
const notifText = document.getElementById('notifText');

function updateNotificationButton() {
    if (!('Notification' in window)) {
        if (notifText) notifText.textContent = 'Notifications not supported';
        if (notificationBtn) notificationBtn.classList.add('denied');
        return;
    }

    const permission = Notification.permission;

    if (permission === 'granted') {
        if (notifText) notifText.textContent = 'Notifications Enabled ✓';
        if (notificationBtn) {
            notificationBtn.classList.remove('denied');
            notificationBtn.classList.add('granted');
        }
    } else if (permission === 'denied') {
        if (notifText) notifText.textContent = 'Notifications Blocked';
        if (notificationBtn) {
            notificationBtn.classList.remove('granted');
            notificationBtn.classList.add('denied');
        }
    } else {
        if (notifText) notifText.textContent = 'Enable Notifications';
        if (notificationBtn) {
            notificationBtn.classList.remove('granted', 'denied');
        }
    }
}

async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        updateNotificationButton();
        return permission;
    }
    return Notification.permission;
}

function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
            body: 'Your countdown has finished!',
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎉</text></svg>',
            silent: true
        });
    }

    showPopupNotification();
}

let notificationCount = 0;

function showPopupNotification() {
    notificationCount++;

    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.style.top = `${2 + (notificationCount - 1) * 5}rem`;
    popup.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🎉</span>
            <div class="notification-text">
                <strong>Timer Complete!</strong>
                <p>Your countdown has finished!</p>
            </div>
            <button class="notification-close">&times;</button>
        </div>
    `;

    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.classList.add('show');
    });

    const closeBtn = popup.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        dismissNotification(popup);
    });

    setTimeout(() => {
        dismissNotification(popup);
    }, 5000);
}

function dismissNotification(popup) {
    if (popup && popup.parentNode) {
        popup.classList.remove('show');
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
                notificationCount = Math.max(0, notificationCount - 1);
            }
        }, 500);
    }
}

function hideAllNotifications() {
    const popups = document.querySelectorAll('.notification-popup');
    popups.forEach(popup => dismissNotification(popup));
    notificationCount = 0;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
        minutes: String(mins).padStart(2, '0'),
        seconds: String(secs).padStart(2, '0')
    };
}

function updateDisplay(seconds) {
    const { minutes, seconds: secs } = formatTime(seconds);

    if (minutesDisplay.textContent !== minutes) {
        minutesDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => { minutesDisplay.style.transform = 'scale(1)'; }, 100);
    }
    if (secondsDisplay.textContent !== secs) {
        secondsDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => { secondsDisplay.style.transform = 'scale(1)'; }, 100);
    }

    minutesDisplay.textContent = minutes;
    secondsDisplay.textContent = secs;
}

function updateProgress(remaining, total) {
    const progress = total > 0 ? remaining / total : 0;
    const offset = RING_CIRCUMFERENCE * progress;
    progressRing.style.strokeDashoffset = RING_CIRCUMFERENCE - offset;
}

function startTimer() {
    const inputValue = parseInt(timerInput.value, 10);

    if (isNaN(inputValue) || inputValue < 1) {
        timerInput.focus();
        timerInput.classList.add('shake');
        setTimeout(() => timerInput.classList.remove('shake'), 500);
        return;
    }

    totalSeconds = Math.min(inputValue, 5999);
    remainingSeconds = totalSeconds;
    isRunning = true;

    initAudioContext();
    requestNotificationPermission();

    timerCard.classList.add('running');
    timerCard.classList.remove('finished');
    startBtn.disabled = true;
    resetBtn.disabled = false;

    updateDisplay(remainingSeconds);
    updateProgress(remainingSeconds, totalSeconds);

    countdown = setInterval(() => {
        remainingSeconds--;
        updateDisplay(remainingSeconds);
        updateProgress(remainingSeconds, totalSeconds);

        if (remainingSeconds <= 0) {
            timerComplete();
        }
    }, 1000);
}

function timerComplete() {
    clearInterval(countdown);
    countdown = null;
    isRunning = false;

    timerCard.classList.remove('running');
    timerCard.classList.add('finished');
    startBtn.disabled = false;
    resetBtn.disabled = false;

    playAlertSound();
    showNotification();
    launchConfetti();
}

function resetTimer() {
    clearInterval(countdown);
    countdown = null;
    isRunning = false;
    remainingSeconds = 0;
    totalSeconds = 0;

    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        if (confettiCtx) {
            confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }

    timerCard.classList.remove('running', 'finished');
    startBtn.disabled = false;
    resetBtn.disabled = true;

    hideAllNotifications();

    updateDisplay(0);
    updateProgress(0, 1);
}

function createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
}

startBtn.addEventListener('click', (e) => {
    createRipple(e);
    startTimer();
});

resetBtn.addEventListener('click', (e) => {
    createRipple(e);
    resetTimer();
});

timerInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        startTimer();
    }
});

window.addEventListener('resize', initConfettiCanvas);

if (notificationBtn) {
    notificationBtn.addEventListener('click', async () => {
        if (Notification.permission === 'granted') {
            new Notification('Hi from Timer! 👋', {
                body: 'This is a test notification',
            });
        } else if (Notification.permission === 'denied') {
            showBlockedNotificationPopup();
        } else {
            await requestNotificationPermission();
        }
    });
}

function showBlockedNotificationPopup() {
    notificationCount++;

    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.style.top = `${2 + (notificationCount - 1) * 5}rem`;
    popup.innerHTML = `
        <div class="notification-content blocked">
            <span class="notification-icon">🔕</span>
            <div class="notification-text">
                <strong>Notifications Blocked</strong>
                <p>Enable notifications in your browser settings</p>
            </div>
            <button class="notification-close">&times;</button>
        </div>
    `;

    document.body.appendChild(popup);

    requestAnimationFrame(() => {
        popup.classList.add('show');
    });

    const closeBtn = popup.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        dismissNotification(popup);
    });

    setTimeout(() => {
        dismissNotification(popup);
    }, 5000);
}

function init() {
    updateDisplay(0);
    updateProgress(0, 1);
    createBackgroundParticles();
    initConfettiCanvas();
    updateNotificationButton();
}

init();
