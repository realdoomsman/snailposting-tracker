// ===== CONFIGURATION =====
// Update these values with your token information
const CONFIG = {
    contractAddress: 'YOUR_CONTRACT_ADDRESS_HERE',
    communityUrl: 'https://x.com/i/communities/1996366238260351235',
    updateInterval: 45000, // 45 seconds
    targetMC: 10000000 // $10M target
};

// ===== SNAIL GROWTH FORMULA =====
// Logarithmic growth: fast at low MC, slower at high MC
function calculateSnailSize(marketcap) {
    const minSize = 200;  // Minimum size in pixels
    const maxSize = 600; // Maximum size at $10M
    
    if (marketcap <= 0) return minSize;
    if (marketcap >= CONFIG.targetMC) return maxSize;
    
    // Logarithmic scale for smooth growth
    const logMC = Math.log10(marketcap);
    const logTarget = Math.log10(CONFIG.targetMC);
    const logMin = Math.log10(10000); // Start from $10k
    
    const progress = (logMC - logMin) / (logTarget - logMin);
    const size = minSize + (maxSize - minSize) * Math.max(0, Math.min(1, progress));
    
    return Math.round(size);
}

// ===== FETCH MARKETCAP FROM DEXSCREENER =====
async function fetchMarketcap() {
    try {
        // Use token endpoint instead of pair endpoint
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${CONFIG.contractAddress}`);
        const data = await response.json();
        
        // Get the first pair (usually the main one)
        if (data && data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            if (pair.fdv) {
                return parseFloat(pair.fdv);
            } else if (pair.marketCap) {
                return parseFloat(pair.marketCap);
            }
        }
        
        console.error('Unable to parse marketcap from Dexscreener response', data);
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
    
    // Scale the SVG
    snail.style.width = `${size}px`;
    snail.style.height = `${size * 0.8}px`; // Maintain aspect ratio
    
    // Update marketcap display
    const mcDisplay = document.getElementById('currentMC');
    mcDisplay.textContent = `$${formatNumber(marketcap)}`;
    
    // Update progress
    const progress = Math.min(100, (marketcap / CONFIG.targetMC) * 100);
    document.getElementById('progressPercent').textContent = `${progress.toFixed(1)}%`;
    
    // Animate progress bar
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    // Update milestones
    updateMilestones(marketcap);
}

// ===== UPDATE MILESTONE ACHIEVEMENTS =====
function updateMilestones(marketcap) {
    const milestones = document.querySelectorAll('.milestone');
    milestones.forEach(milestone => {
        const targetMC = parseInt(milestone.getAttribute('data-mc'));
        if (marketcap >= targetMC) {
            milestone.classList.add('achieved');
        } else {
            milestone.classList.remove('achieved');
        }
    });
}

// ===== FORMAT NUMBER WITH COMMAS =====
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

// ===== COPY CONTRACT ADDRESS =====
function copyCA() {
    const ca = CONFIG.contractAddress;
    navigator.clipboard.writeText(ca).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy. Please copy manually.');
    });
}

// ===== POST SNAIL TWEET =====
function postSnailTweet() {
    const tweetText = `🐌 Snailposting until our coin hits $10M MC. Join the snail.\n\nCA: ${CONFIG.contractAddress}\n\n#Snailposting #Crypto`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(twitterUrl, '_blank');
}

// ===== INITIALIZE =====
function init() {
    // Set contract address in HTML
    document.getElementById('contractAddress').textContent = CONFIG.contractAddress;
    
    // Update tweet CA
    const tweetCaElements = document.querySelectorAll('.tweet-ca');
    tweetCaElements.forEach(el => {
        el.textContent = CONFIG.contractAddress.substring(0, 20) + '...';
    });
    
    // Set chart link
    document.getElementById('chartLink').href = `https://dexscreener.com/solana/${CONFIG.contractAddress}`;
    
    // Initial fetch
    updateMarketcap();
    
    // Set up periodic updates
    setInterval(updateMarketcap, CONFIG.updateInterval);
}

// ===== UPDATE MARKETCAP =====
async function updateMarketcap() {
    // Check if config is set up
    if (CONFIG.contractAddress === 'YOUR_CONTRACT_ADDRESS_HERE') {
        document.getElementById('currentMC').textContent = 'Not configured';
        document.getElementById('progressPercent').textContent = 'Configure script.js';
        console.error('⚠️ Please update CONFIG.contractAddress in script.js');
        return;
    }
    
    const marketcap = await fetchMarketcap();
    
    if (marketcap !== null) {
        updateSnail(marketcap);
    } else {
        document.getElementById('currentMC').textContent = 'Error loading';
        document.getElementById('progressPercent').textContent = 'Check config';
        console.error('Failed to fetch marketcap. Check your dexscreenerPairAddress.');
    }
}

// ===== HIDE LOADING SCREEN =====
function hideLoadingScreen() {
    setTimeout(() => {
        const loader = document.getElementById('loadingScreen');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 600);
        }
    }, 2500);
}

// ===== START ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    init();
    hideLoadingScreen();
});

// Make functions available globally
window.copyCA = copyCA;
window.postSnailTweet = postSnailTweet;
