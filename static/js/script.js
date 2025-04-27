document.addEventListener('DOMContentLoaded', () => {
  const dropArea = document.getElementById('drop-area');
  const fileElem = document.getElementById('fileElem');
  const fileSelect = document.getElementById('fileSelect');
  const fileInfo = document.getElementById('file-info');
  const fileName = document.getElementById('file-name');
  const progress = document.getElementById('progress');
  const resultsContainer = document.getElementById('results-container');
  const originalCode = document.getElementById('original-code');
  const optimizedCode = document.getElementById('optimized-code');
  const diffOutput = document.getElementById('diff-output');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const analyzeErrorBtn = document.getElementById('analyze-error');
  const errorMessage = document.getElementById('error-message');
  const errorAnalysisResult = document.getElementById('error-analysis-result');
  const errorBugStatus = document.getElementById('error-bug-status');
  const errorAnalysisText = document.getElementById('error-analysis-text');

  // Event listeners for file upload
  fileSelect.addEventListener('click', () => fileElem.click());
  fileElem.addEventListener('change', (e) => handleFiles(e.target.files));

  // Drag and drop handlers
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.backgroundColor = "#f0f8ff";
    dropArea.style.borderColor = "#007bff";
  });

  dropArea.addEventListener('dragleave', () => {
    dropArea.style.backgroundColor = "";
    dropArea.style.borderColor = "#aaa";
  });

  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.backgroundColor = "";
    dropArea.style.borderColor = "#aaa";
    handleFiles(e.dataTransfer.files);
  });

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));

      // Add active class to clicked button and corresponding pane
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Add event listener for error analysis button
  analyzeErrorBtn.addEventListener('click', () => {
    const errorText = errorMessage.value.trim();
    
    if (errorText === '') {
      alert('Please enter an error message to analyze.');
      return;
    }
    
    // Show loading state
    errorAnalysisResult.classList.remove('hidden');
    errorBugStatus.textContent = 'Analyzing...';
    errorBugStatus.className = 'bug-status';
    errorAnalysisText.textContent = '';
    
    // Send error message to the server for analysis
    fetch('/analyze-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error_message: errorText })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Update UI with the analysis result
      errorBugStatus.textContent = data.bug_prediction;
      errorAnalysisText.textContent = data.analysis || 'Analysis complete.';
      
      if (data.bug_prediction === 'Bug') {
        errorBugStatus.classList.add('bug');
        errorBugStatus.classList.remove('no-bug');
      } else {
        errorBugStatus.classList.add('no-bug');
        errorBugStatus.classList.remove('bug');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      errorBugStatus.textContent = 'Error';
      errorBugStatus.classList.add('bug');
      errorAnalysisText.textContent = 'An error occurred while analyzing. Please try again.';
    });
  });

  // Handle the uploaded file
  function handleFiles(files) {
    const file = files[0];
    if (file) {
      // Show file name and progress bar
      fileInfo.classList.remove('hidden');
      fileName.textContent = file.name;
      
      // Show uploading progress
      let percent = 0;
      progress.style.width = '0%';
      const interval = setInterval(() => {
        if (percent >= 100) {
          clearInterval(interval);
          uploadFile(file);
        } else {
          percent += 10;
          progress.style.width = percent + '%';
        }
      }, 100);
    }
  }

  // Upload file to server
  function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    // Show uploading state
    progress.style.width = '100%';

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.error || 'Network response was not ok');
        });
      }
      return response.json();
    })
    .then(data => {
      // Show results container
      resultsContainer.classList.remove('hidden');
      
      // Display code in respective sections
      originalCode.textContent = data.original_code;
      optimizedCode.textContent = data.optimized_code;
      diffOutput.textContent = data.diff;
      
      // We don't need to update the bug status since we removed it
      // bugStatus.textContent = data.bug_prediction;
      // if (data.bug_prediction === 'Bug') {
      //   bugStatus.classList.add('bug');
      //   bugStatus.classList.remove('no-bug');
      // } else {
      //   bugStatus.classList.add('no-bug');
      //   bugStatus.classList.remove('bug');
      // }
    })
    .catch(error => {
      console.error('Error:', error);
      
      // Show a more detailed error message to the user
      alert(`Error uploading file: ${error.message || 'Please try again with a different file.'}`);
      
      // Reset the progress bar
      progress.style.width = '0%';
      
      // Log more detailed error info to help diagnose issues
      console.error('Error details:', error.message, error.stack);
    });
  }
}); 
