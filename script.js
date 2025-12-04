// ===== CONFIGURATION =====
const CONFIG = {
    contractAddress: 'YOUR_CONTRACT_ADDRESS_HERE',
    communityUrl: 'https://x.com/i/communities/1996366238260351235',
    updateInterval: 45000,
    targetMC: 10000000,
    startDate: new Date('2024-12-03') // Day 1 of snailposting
};

// ===== CALCULATE DAY NUMBER =====
function getDayNumber() {
    const now = new Date();
    const diffTime = Math.abs(now - CONFIG.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
}

// ===== SNAIL GROWTH FORMULA =====
function calculateSnailSize(marketcap) {
    const minSize = 200;
    const maxSize = 600;
    if (marketcap <= 0) return minSize;
    if (marketcap >= CONFIG.targetMC) return maxSize;
    const logMC = Math.log10(marketcap);
    const logTarget = Math.log10(CONFIG.targetMC);
    const logMin = Math.log10(10000);
    const progress = (logMC - logMin) / (logTarget - logMin);
    return Math.round(minSize + (maxSize - minSize) * Math.max(0, Math.min(1, progress)));
}

// ===== FETCH MARKETCAP FROM DEXSCREENER =====
async function fetchMarketcap() {
    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONFIG.contractAddress}`);
        const data = await response.json();
        if (data && data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            return parseFloat(pair.fdv || pair.marketCap || 0);
        }
        return null;
    } catch (error) {
        console.error('Error fetching marketcap:', error);
        return null;
    }
}

// ===== UPDATE SNAIL SIZE =====
function updateSnail(marketcap) {
    const snail = document.getElementById('liveSnail');
    const size = calculateSnailSize(marketcap);
    snail.style.width = `${size}px`;
    snail.style.height = `${size * 0.8}px`;
    
    document.getElementById('currentMC').textContent = formatNumber(marketcap);
    const progress = Math.min(100, (marketcap / CONFIG.targetMC) * 100);
    document.getElementById('progressPercent').textContent = `${progress.toFixed(1)}%`;
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    updateMilestones(marketcap);
    updateStats(marketcap);
}

// ===== UPDATE STATS =====
function updateStats(marketcap) {
    const days = getDayNumber();
    document.getElementById('daysActive').textContent = days;
    
    // Estimate days to $10M based on current progress
    if (marketcap > 0) {
        const remaining = CONFIG.targetMC - marketcap;
        const dailyGrowth = marketcap / days;
        const estDays = dailyGrowth > 0 ? Math.ceil(remaining / dailyGrowth) : '∞';
        document.getElementById('targetDays').textContent = estDays > 1000 ? '∞' : estDays;
        
        // Fun snail speed calculation
        const speed = (0.03 * (marketcap / 10000)).toFixed(2);
        document.getElementById('snailSpeed').textContent = Math.min(speed, 99.99);
    }
}

// ===== UPDATE MILESTONES =====
function updateMilestones(marketcap) {
    document.querySelectorAll('.milestone').forEach(milestone => {
        const targetMC = parseInt(milestone.getAttribute('data-mc'));
        milestone.classList.toggle('achieved', marketcap >= targetMC);
    });
}

// ===== FORMAT NUMBER =====
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
    return num.toFixed(2);
}

// ===== COPY CONTRACT ADDRESS =====
function copyCA() {
    navigator.clipboard.writeText(CONFIG.contractAddress).then(() => {
        const btn = document.querySelector('.copy-btn');
        const original = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = original, 2000);
    });
}

// ===== POST SNAIL TWEET =====
function postSnailTweet() {
    const day = getDayNumber();
    const tweet = `🐌 Day ${day} of snailposting until we hit $10M MC\n\nJoin the snail.\n\nCA: ${CONFIG.contractAddress}\n\n#Snailposting`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
}

// ===== CONFETTI =====
function spawnConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#F7931A', '#FDB927', '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
    
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            container.appendChild(confetti);
            setTimeout(() => confetti.remove(), 4000);
        }, i * 20);
    }
}

// ===== POST MAKER =====
let currentStyle = 'classic';

const STYLES = {
    classic: {
        bg: ['#F7931A', '#FDB927'],
        text: '#000',
        accent: '#fff'
    },
    neon: {
        bg: ['#0a0a0a', '#1a1a2e'],
        text: '#0ff',
        accent: '#f0f'
    },
    minimal: {
        bg: ['#fff', '#f5f5f5'],
        text: '#000',
        accent: '#F7931A'
    },
    retro: {
        bg: ['#2d1b69', '#11998e'],
        text: '#fff',
        accent: '#ffd700'
    },
    galaxy: {
        bg: ['#0f0c29', '#302b63', '#24243e'],
        text: '#fff',
        accent: '#F7931A'
    }
};

function selectStyle(style) {
    currentStyle = style;
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.style === style);
    });
    generatePost();
}

function generatePost() {
    const canvas = document.getElementById('postCanvas');
    const ctx = canvas.getContext('2d');
    const style = STYLES[currentStyle];
    const day = getDayNumber();
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 800);
    style.bg.forEach((color, i) => {
        gradient.addColorStop(i / (style.bg.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 800);
    
    // Add pattern for some styles
    if (currentStyle === 'neon') {
        ctx.strokeStyle = 'rgba(0,255,255,0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 800; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, 800);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(800, i);
            ctx.stroke();
        }
    }
    
    if (currentStyle === 'galaxy') {
        // Stars
        for (let i = 0; i < 100; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8})`;
            ctx.beginPath();
            ctx.arc(Math.random() * 800, Math.random() * 800, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Big snail emoji
    ctx.font = '200px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐌', 400, 350);
    
    // Day text
    ctx.fillStyle = style.text;
    ctx.font = 'bold 80px Arial';
    ctx.fillText(`DAY ${day}`, 400, 480);
    
    // Subtitle
    ctx.font = 'bold 36px Arial';
    ctx.fillStyle = style.accent;
    ctx.fillText('of snailposting until $10M MC', 400, 540);
    
    // Contract address box
    ctx.fillStyle = currentStyle === 'minimal' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';
    roundRect(ctx, 100, 600, 600, 80, 20);
    ctx.fill();
    
    // CA text
    ctx.fillStyle = style.text;
    ctx.font = 'bold 18px monospace';
    const shortCA = CONFIG.contractAddress.length > 30 
        ? CONFIG.contractAddress.substring(0, 15) + '...' + CONFIG.contractAddress.slice(-15)
        : CONFIG.contractAddress;
    ctx.fillText(`CA: ${shortCA}`, 400, 650);
    
    // Watermark
    ctx.fillStyle = style.accent;
    ctx.font = 'bold 24px Arial';
    ctx.fillText('snailposting.xyz', 400, 760);
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function downloadPost() {
    const canvas = document.getElementById('postCanvas');
    const link = document.createElement('a');
    link.download = `snailpost-day-${getDayNumber()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function sharePost() {
    const day = getDayNumber();
    const tweet = `🐌 Day ${day} of snailposting until we hit $10M MC\n\nCA: ${CONFIG.contractAddress}\n\n#Snailposting`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`, '_blank');
}

// ===== INITIALIZE =====
function init() {
    document.getElementById('contractAddress').textContent = CONFIG.contractAddress;
    document.getElementById('chartLink').href = `https://dexscreener.com/solana/${CONFIG.contractAddress}`;
    document.getElementById('dayNumber').textContent = getDayNumber();
    
    updateMarketcap();
    setInterval(updateMarketcap, CONFIG.updateInterval);
    
    // Generate initial post
    setTimeout(generatePost, 100);
}

async function updateMarketcap() {
    if (CONFIG.contractAddress === 'YOUR_CONTRACT_ADDRESS_HERE') {
        document.getElementById('currentMC').textContent = 'Not configured';
        document.getElementById('progressPercent').textContent = 'Add CA';
        return;
    }
    
    const marketcap = await fetchMarketcap();
    if (marketcap !== null) {
        updateSnail(marketcap);
    } else {
        document.getElementById('currentMC').textContent = 'Error';
        document.getElementById('progressPercent').textContent = 'Retry...';
    }
}

// ===== LOADING SCREEN =====
function hideLoadingScreen() {
    setTimeout(() => {
        const loader = document.getElementById('loadingScreen');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                loader.remove();
                startSnailIntro();
            }, 600);
        }
    }, 2500);
}

function startSnailIntro() {
    const container = document.querySelector('.snail-container');
    if (container) {
        container.classList.add('intro');
        createSnailTrail();
        setTimeout(() => container.classList.remove('intro'), 3000);
    }
}

function createSnailTrail() {
    const positions = [
        { x: -30, y: -30, delay: 0 },
        { x: 40, y: 25, delay: 400 },
        { x: -25, y: -15, delay: 800 },
        { x: 20, y: 20, delay: 1200 },
    ];
    
    positions.forEach(pos => {
        setTimeout(() => {
            const trail = document.createElement('div');
            trail.className = 'snail-trail';
            trail.textContent = '🐌';
            trail.style.left = `calc(50% + ${pos.x}vw)`;
            trail.style.top = `calc(40% + ${pos.y}vh)`;
            document.body.appendChild(trail);
            setTimeout(() => trail.remove(), 1000);
        }, pos.delay);
    });
}

// ===== START =====
document.addEventListener('DOMContentLoaded', () => {
    init();
    hideLoadingScreen();
});

// Global functions
window.copyCA = copyCA;
window.postSnailTweet = postSnailTweet;
window.spawnConfetti = spawnConfetti;
window.selectStyle = selectStyle;
window.generatePost = generatePost;
window.downloadPost = downloadPost;
window.sharePost = sharePost;