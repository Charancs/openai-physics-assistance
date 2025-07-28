document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const inputMethods = document.querySelectorAll('.input-method');
    const inputAreas = document.querySelectorAll('.input-area');
    const batchInputMethods = document.querySelectorAll('.batch-input-method');
    const batchInputAreas = document.querySelectorAll('.batch-input-area');
    const questionInput = document.getElementById('question-input');
    const submitQuestionBtn = document.getElementById('submit-question');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const previewContainer = document.querySelector('.preview-container');
    const submitImageBtn = document.getElementById('submit-image');
    const batchQuestionInput = document.getElementById('batch-question-input');
    const addQuestionBtn = document.getElementById('add-question');
    const questionsList = document.getElementById('questions-list');
    const processBatchBtn = document.getElementById('process-batch');
    const resultsContainer = document.getElementById('results-container');
    const loadingIndicator = document.querySelector('.loading');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportDocxBtn = document.getElementById('export-docx');
    const useBatchApiCheckbox = document.getElementById('use-batch-api');
    const useBatchApiFileCheckbox = document.getElementById('use-batch-api-file');
    
    // Bulk input elements
    const showBulkInputBtn = document.getElementById('show-bulk-input');
    const bulkInputArea = document.querySelector('.bulk-input-area');
    const bulkQuestionsInput = document.getElementById('bulk-questions-input');
    const addBulkQuestionsBtn = document.getElementById('add-bulk-questions');
    
    // File upload elements
    const questionsFileUpload = document.getElementById('questions-file-upload');
    const filePreviewContainer = document.querySelector('.file-preview-container');
    const filePreview = document.getElementById('file-preview');
    const processFileBatchBtn = document.getElementById('process-file-batch');

    // Application State
    let batchQuestions = [];
    let fileQuestions = [];
    let currentResults = [];
    let currentBatchJobId = null;
    let batchStatusCheckInterval = null;

    // Tab Switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-tab`).classList.add('active');
        });
    });

    // Input Method Switching
    inputMethods.forEach(method => {
        method.addEventListener('click', () => {
            inputMethods.forEach(m => m.classList.remove('active'));
            inputAreas.forEach(area => area.classList.add('hidden'));
            
            method.classList.add('active');
            document.getElementById(`${method.dataset.method}-input-area`).classList.remove('hidden');
        });
    });
    
    // Batch Input Method Switching
    batchInputMethods.forEach(method => {
        method.addEventListener('click', () => {
            batchInputMethods.forEach(m => m.classList.remove('active'));
            batchInputAreas.forEach(area => area.classList.add('hidden'));
            
            method.classList.add('active');
            document.getElementById(`${method.dataset.method}-batch-area`).classList.remove('hidden');
        });
    });
    
    // Show/Hide Bulk Input Area
    showBulkInputBtn.addEventListener('click', () => {
        bulkInputArea.classList.toggle('hidden');
        showBulkInputBtn.textContent = bulkInputArea.classList.contains('hidden') 
            ? 'Enter Multiple Questions at Once' 
            : 'Hide Bulk Input';
    });
    
    // Add Bulk Questions
    addBulkQuestionsBtn.addEventListener('click', () => {
        const bulkText = bulkQuestionsInput.value.trim();
        if (!bulkText) {
            alert('Please enter some questions');
            return;
        }
        
        const lines = bulkText.split('\n');
        let addedCount = 0;
        
        lines.forEach(line => {
            const question = line.trim();
            if (question) {
                batchQuestions.push(question);
                addedCount++;
            }
        });
        
        updateQuestionsList();
        bulkQuestionsInput.value = '';
        bulkInputArea.classList.add('hidden');
        showBulkInputBtn.textContent = 'Enter Multiple Questions at Once';
        
        // Enable batch processing button if we have questions
        if (batchQuestions.length > 0) {
            processBatchBtn.classList.remove('disabled');
        }
        
        alert(`Added ${addedCount} questions to the batch`);
    });
    
    // File Upload Preview
    questionsFileUpload.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            if (!file.name.endsWith('.txt')) {
                alert('Please upload a .txt file');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const content = e.target.result;
                const lines = content.split('\n');
                
                // Filter out empty lines
                fileQuestions = lines.filter(line => line.trim()).map(line => line.trim());
                
                if (fileQuestions.length === 0) {
                    alert('No questions found in the file');
                    filePreviewContainer.classList.add('hidden');
                    return;
                }
                
                // Display preview
                filePreview.innerHTML = '';
                fileQuestions.slice(0, 10).forEach((question, index) => {
                    const questionItem = document.createElement('div');
                    questionItem.classList.add('file-question-item');
                    questionItem.textContent = question;
                    filePreview.appendChild(questionItem);
                });
                
                if (fileQuestions.length > 10) {
                    const moreItem = document.createElement('div');
                    moreItem.classList.add('file-question-more');
                    moreItem.textContent = `... and ${fileQuestions.length - 10} more questions`;
                    filePreview.appendChild(moreItem);
                }
                
                filePreviewContainer.classList.remove('hidden');
                processFileBatchBtn.classList.remove('disabled');
                processFileBatchBtn.textContent = `Process ${fileQuestions.length} Questions`;
            };
            
            reader.readAsText(file);
        }
    });
    
    // Process File Batch
    processFileBatchBtn.addEventListener('click', () => {
        if (fileQuestions.length === 0 || processFileBatchBtn.classList.contains('disabled')) {
            return;
        }
        
        const formData = new FormData();
        formData.append('file', questionsFileUpload.files[0]);
        formData.append('use_batch_api', useBatchApiFileCheckbox.checked);
        
        processFileQuestions(formData);
    });

    // Image Upload Preview
    imageUpload.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                previewContainer.classList.remove('hidden');
                console.log('Image preview loaded');
            }
            
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Submit Question (Text)
    submitQuestionBtn.addEventListener('click', () => {
        const question = questionInput.value.trim();
        if (!question) {
            alert('Please enter a question');
            return;
        }
        
        processQuestion(question);
    });

    // Submit Question (Image)
    submitImageBtn.addEventListener('click', () => {
        if (!imageUpload.files || !imageUpload.files[0]) {
            alert('Please select an image');
            return;
        }
        
        console.log('Processing image:', imageUpload.files[0].name);
        processImage(imageUpload.files[0]);
    });

    // Add Question to Batch
    addQuestionBtn.addEventListener('click', () => {
        const question = batchQuestionInput.value.trim();
        if (!question) {
            alert('Please enter a question');
            return;
        }
        
        batchQuestions.push(question);
        updateQuestionsList();
        batchQuestionInput.value = '';
        
        // Enable batch processing button if we have questions
        if (batchQuestions.length > 0) {
            processBatchBtn.classList.remove('disabled');
        }
    });

    // Process Batch Questions
    processBatchBtn.addEventListener('click', () => {
        if (batchQuestions.length === 0 || processBatchBtn.classList.contains('disabled')) {
            return;
        }
        
        const useBatchApi = useBatchApiCheckbox && useBatchApiCheckbox.checked;
        processBatchQuestions(batchQuestions, useBatchApi);
    });

    // Export Results
    exportPdfBtn.addEventListener('click', () => {
        if (currentResults.length === 0 || exportPdfBtn.classList.contains('disabled')) {
            return;
        }
        
        exportResults('pdf');
    });

    exportDocxBtn.addEventListener('click', () => {
        if (currentResults.length === 0 || exportDocxBtn.classList.contains('disabled')) {
            return;
        }
        
        exportResults('docx');
    });

    // Functions
    function updateQuestionsList() {
        questionsList.innerHTML = '';
        
        if (batchQuestions.length === 0) {
            questionsList.innerHTML = '<p class="empty-message">No questions added yet.</p>';
            return;
        }
        
        batchQuestions.forEach((question, index) => {
            const questionItem = document.createElement('div');
            questionItem.classList.add('question-item');
            
            const questionText = document.createElement('p');
            questionText.textContent = question;
            
            const removeBtn = document.createElement('button');
            removeBtn.classList.add('remove-question');
            removeBtn.innerHTML = '&times;';
            removeBtn.addEventListener('click', () => {
                batchQuestions.splice(index, 1);
                updateQuestionsList();
                
                // Disable batch processing button if no questions
                if (batchQuestions.length === 0) {
                    processBatchBtn.classList.add('disabled');
                }
            });
            
            questionItem.appendChild(questionText);
            questionItem.appendChild(removeBtn);
            questionsList.appendChild(questionItem);
        });
    }

    function showLoading() {
        loadingIndicator.classList.remove('hidden');
    }

    function hideLoading() {
        loadingIndicator.classList.add('hidden');
    }

    function processQuestion(question) {
        showLoading();
        
        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            displayResults([data]);
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            alert('An error occurred while processing your question');
        });
    }

    function processImage(imageFile) {
        showLoading();
        console.log('Starting image upload...');
        
        const formData = new FormData();
        formData.append('image', imageFile);
        
        fetch('/process_image', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            console.log('Image upload response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Image processed successfully');
            hideLoading();
            displayResults([data]);
        })
        .catch(error => {
            hideLoading();
            console.error('Error processing image:', error);
            alert('An error occurred while processing your image: ' + error.message);
        });
    }

    function processBatchQuestions(questions, useBatchApi = false) {
        showLoading();
        
        // Clear any existing batch status check interval
        if (batchStatusCheckInterval) {
            clearInterval(batchStatusCheckInterval);
            batchStatusCheckInterval = null;
        }
        
        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                questions,
                use_batch_api: useBatchApi 
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (useBatchApi && data.job_id) {
                // For batch API, start polling for results
                currentBatchJobId = data.job_id;
                resultsContainer.innerHTML = '<div class="batch-status">Batch job submitted. Processing...</div>';
                
                // Start checking status
                batchStatusCheckInterval = setInterval(() => {
                    checkBatchStatus(data.job_id);
                }, 5000); // Check every 5 seconds
            } else {
                // For synchronous processing
                hideLoading();
                displayResults(data.results);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            alert('An error occurred while processing your questions');
        });
    }
    
    function processFileQuestions(formData) {
        showLoading();
        
        // Clear any existing batch status check interval
        if (batchStatusCheckInterval) {
            clearInterval(batchStatusCheckInterval);
            batchStatusCheckInterval = null;
        }
        
        fetch('/process_file', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.job_id) {
                // For batch API, start polling for results
                currentBatchJobId = data.job_id;
                resultsContainer.innerHTML = `<div class="batch-status">Batch job submitted with ${data.question_count} questions. Processing...</div>`;
                
                // Start checking status
                batchStatusCheckInterval = setInterval(() => {
                    checkBatchStatus(data.job_id);
                }, 5000); // Check every 5 seconds
            } else if (data.results) {
                // For synchronous processing
                hideLoading();
                displayResults(data.results);
            } else {
                hideLoading();
                alert('No results returned');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            alert('An error occurred while processing your file');
        });
    }

    function checkBatchStatus(jobId) {
        fetch(`/batch_status/${jobId}`, {
            method: 'GET',
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'completed' && data.results) {
                // Batch is complete
                clearInterval(batchStatusCheckInterval);
                batchStatusCheckInterval = null;
                hideLoading();
                displayResults(data.results);
            } else if (data.error) {
                // Error occurred
                clearInterval(batchStatusCheckInterval);
                batchStatusCheckInterval = null;
                hideLoading();
                alert(`Batch processing error: ${data.error}`);
            } else {
                // Update status display
                resultsContainer.innerHTML = `<div class="batch-status">Batch job status: ${data.status}...</div>`;
            }
        })
        .catch(error => {
            console.error('Error checking batch status:', error);
            // Don't stop polling on a single error
        });
    }

    function displayResults(results) {
        currentResults = results;
        resultsContainer.innerHTML = '';
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            
            const questionText = document.createElement('div');
            questionText.classList.add('question-text');
            questionText.textContent = result.question;
            
            const answerText = document.createElement('div');
            answerText.classList.add('answer-text');
            answerText.textContent = result.answer;
            
            resultItem.appendChild(questionText);
            resultItem.appendChild(answerText);
            
            // Add token usage information if available
            if (result.token_usage) {
                const tokenInfo = document.createElement('div');
                tokenInfo.classList.add('token-info');
                tokenInfo.innerHTML = `
                    <strong>Token Usage:</strong> 
                    Prompt: ${result.token_usage.prompt_tokens} | 
                    Completion: ${result.token_usage.completion_tokens} | 
                    Total: ${result.token_usage.total_tokens}
                `;
                resultItem.appendChild(tokenInfo);
            }
            
            resultsContainer.appendChild(resultItem);
        });
        
        // Enable export buttons
        exportPdfBtn.classList.remove('disabled');
        exportDocxBtn.classList.remove('disabled');
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function exportResults(format) {
        showLoading();
        
        fetch('/export', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                results: currentResults,
                format: format
            }),
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            if (data.file_url) {
                window.location.href = data.file_url;
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Error:', error);
            alert(`An error occurred while exporting as ${format.toUpperCase()}`);
        });
    }

    // Initialize the questions list
    updateQuestionsList();
});
