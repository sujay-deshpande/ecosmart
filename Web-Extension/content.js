// Create floating eco-score badge
function createEcoBadge(score) {
  const badge = document.createElement('div');
  badge.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: conic-gradient(#4ade80 ${score}%, #e5e7eb ${score}%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #1f2937;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    z-index: 9999;
  `;
  
  badge.innerHTML = `<span>${score}</span>`;
  document.body.appendChild(badge);
  
  badge.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
}

// Analyze the current page
async function analyzePage() {
  try {
    const response = await fetch('http://127.0.0.1:8000/product/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: window.location.href })
    });

    if (!response.ok) throw new Error('Analysis failed');
    
    const data = await response.json();
    const score = parseInt(data.analysis["Product Analysis"].eco_score.score);
    createEcoBadge(score);
  } catch (error) {
    console.error('Error analyzing page:', error);
  }
}

// Run analysis when page loads
window.addEventListener('load', analyzePage);