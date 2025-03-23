

// document.addEventListener('DOMContentLoaded', async () => {
//   const loading = document.getElementById('loading');
//   const content = document.getElementById('content');
//   const scoreValue = document.getElementById('score-value');
//   const co2Value = document.getElementById('co2-value');
//   const offsetValue = document.getElementById('offset-value');
  
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   console.log(tab)
//   loading.style.display = 'block';
//   content.style.display = 'none';

//   try {
//     const response = await fetch('http://127.0.0.1:8000/product/analyze', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ url: tab.url })
//     });

//     if (!response.ok) throw new Error(`Analysis failed: ${response.status}`);
//     const data = await response.json();
//     const analysis = data.analysis["Product Analysis"];

//     // Update eco score
//     const score = parseInt(analysis.eco_score.score);
//     scoreValue.textContent = score;
//     document.querySelector('.score-circle').style.setProperty('--progress', `${score}%`);

//     // Update metrics
//     co2Value.textContent = analysis.co2_footprint.level;
//     offsetValue.textContent = analysis.carbon_offset.value;

//   } catch (error) {
//     content.innerHTML = `
//       <div class="error-state">
//         <p>⚠️ Error analyzing product</p>
//         <p style="font-size: 13px; margin-top: 8px;">${error.message}</p>
//       </div>
//     `;
//   } finally {
//     loading.style.display = 'none';
//     content.style.display = 'block';
//   }
// });


// ===================

document.addEventListener('DOMContentLoaded', async () => {
  const loading = document.getElementById('loading');
  const content = document.getElementById('content');
  const scoreValue = document.getElementById('score-value');
  const co2Value = document.getElementById('co2-value');
  const offsetValue = document.getElementById('offset-value');

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  console.log(tab);
  loading.style.display = 'block';
  content.style.display = 'none';

  try {
    const response = await fetch('http://127.0.0.1:8000/product/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: tab.url })
    });

    if (!response.ok) throw new Error(`Analysis failed: ${response.status}`);
    const data = await response.json();
    const analysis = data.analysis["Product Analysis"];

    const score = parseInt(analysis.eco_score.score);
    scoreValue.textContent = score;
    document.querySelector('.score-circle').style.setProperty('--progress', `${score}%`);

    co2Value.textContent = analysis.co2_footprint.level;
    offsetValue.textContent = analysis.carbon_offset.value;

    const analyzeButton = document.createElement('button');
    analyzeButton.textContent = 'Analyze Further ';
    analyzeButton.style.marginTop = '20px';
    analyzeButton.style.padding = '10px 15px';
    analyzeButton.style.border = 'none';
    analyzeButton.style.background = '#16a34a';
    analyzeButton.style.color = 'white';
    analyzeButton.style.fontSize = '16px';
    analyzeButton.style.cursor = 'pointer';
    analyzeButton.style.borderRadius = '8px';

    analyzeButton.addEventListener('click', () => {
      chrome.tabs.create({
        url: `http://localhost:3000/analyze?data=${encodeURIComponent(JSON.stringify(data))}`
      });
    });
    content.appendChild(analyzeButton);
  } catch (error) {
    content.innerHTML = `
      <div class="error-state">
        <p>⚠️ Error analyzing product</p>
        <p style="font-size: 13px; margin-top: 8px;">${error.message}</p>
      </div>
    `;
  } finally {
    loading.style.display = 'none';
    content.style.display = 'block';
  }
});
