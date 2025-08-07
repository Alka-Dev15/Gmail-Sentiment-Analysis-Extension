// Gmail Sentiment Analyzer Content Script
class GmailSentimentAnalyzer {
  constructor() {
    this.analyzer = new SentimentAnalyzer();
    this.processedEmails = new Set();
    this.init();
  }

  init() {
    // Wait for Gmail to load
    this.waitForGmail().then(() => {
      console.log('Gmail Sentiment Analyzer loaded');
      this.startAnalysis();
    });
  }

  waitForGmail() {
    return new Promise((resolve) => {
      const checkGmail = () => {
        if (document.querySelector('[role="main"]') || document.querySelector('.nH')) {
          resolve();
        } else {
          setTimeout(checkGmail, 1000);
        }
      };
      checkGmail();
    });
  }

  startAnalysis() {
    // Analyze existing emails
    this.analyzeEmails();
    
    // Set up observer for new emails
    this.setupObserver();
    
    // Re-analyze when navigating
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => this.analyzeEmails(), 2000);
      }
    }, 1000);
  }

  setupObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldAnalyze = false;
      
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if new email content was added
              if (node.querySelector && (
                node.querySelector('[data-message-id]') ||
                node.querySelector('.ii.gt') ||
                node.classList.contains('ii') ||
                node.classList.contains('gt')
              )) {
                shouldAnalyze = true;
              }
            }
          });
        }
      });
      
      if (shouldAnalyze) {
        setTimeout(() => this.analyzeEmails(), 1000);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  analyzeEmails() {
    // Gmail conversation view selectors
    const emailSelectors = [
      '[data-message-id]',
      '.ii.gt',
      '.a3s.aiL',
      '.ii.gt .a3s',
      '[role="listitem"] .a3s'
    ];

    emailSelectors.forEach(selector => {
      const emails = document.querySelectorAll(selector);
      emails.forEach(email => this.processEmail(email));
    });

    // Gmail list view
    this.processListView();
  }

  processEmail(emailElement) {
    if (!emailElement || this.processedEmails.has(emailElement)) {
      return;
    }

    const emailText = this.extractEmailText(emailElement);
    if (!emailText || emailText.length < 10) {
      return;
    }

    const analysis = this.analyzer.analyze(emailText);
    this.addSentimentIndicator(emailElement, analysis);
    this.processedEmails.add(emailElement);
  }

  processListView() {
    const listItems = document.querySelectorAll('tr.zA, .zA');
    
    listItems.forEach(item => {
      if (this.processedEmails.has(item)) return;
      
      const snippet = item.querySelector('.y2, .bog, .y6 span[id]');
      if (snippet) {
        const textData = snippet.textContent || snippet.innerText;
        if (textData && textData.length > 10) {
          const analysis = this.analyzer.analyze(text);
          this.addListSentimentIndicator(item, analysis);
          this.processedEmails.add(item);
        }
      }
    });
  }

  extractEmailText(element) {
    // Remove quoted text and signatures
    const clone = element.cloneNode(true);
    
    // Remove common quoted text elements
    const quotedSelectors = [
      '.gmail_quote',
      '.quoted-text',
      '.gmail_signature',
      '.signature',
      '[class*="quote"]'
    ];
    
    quotedSelectors.forEach(selector => {
      const quotedElements = clone.querySelectorAll(selector);
      quotedElements.forEach(el => el.remove());
    });
    
    return clone.textContent || clone.innerText || '';
  }

  addSentimentIndicator(emailElement, analysis) {
    // Check if indicator already exists
    if (emailElement.querySelector('.sentiment-indicator')) {
      return;
    }

    const indicator = document.createElement('div');
    indicator.className = 'sentiment-indicator';
    indicator.innerHTML = `
      <div class="sentiment-badge" style="background-color: ${this.analyzer.getSentimentColor(analysis.sentiment)}">
        <span class="sentiment-emoji">${this.analyzer.getSentimentEmoji(analysis.sentiment)}</span>
        <span class="sentiment-text">${analysis.sentiment.toUpperCase()}</span>
        <div class="sentiment-details">
          Score: ${analysis.score} | Confidence: ${Math.round(analysis.confidence * 100)}%
        </div>
      </div>
    `;

    // Try to find the best position for the indicator
    const headerElement = emailElement.querySelector('.gD') || 
                         emailElement.querySelector('.go') || 
                         emailElement;
    
    if (headerElement) {
      headerElement.appendChild(indicator);
    }
  }

  addListSentimentIndicator(listItem, analysis) {
    if (listItem.querySelector('.sentiment-list-indicator')) {
      return;
    }

    const indicator = document.createElement('span');
    indicator.className = 'sentiment-list-indicator';
    indicator.innerHTML = `
      <span class="sentiment-dot" style="background-color: ${this.analyzer.getSentimentColor(analysis.sentiment)}" 
            title="Sentiment: ${analysis.sentiment} (${Math.round(analysis.confidence * 100)}%)">
        ${this.analyzer.getSentimentEmoji(analysis.sentiment)}
      </span>
    `;

    // Add to the subject line area
    const subjectArea = listItem.querySelector('.bog, .y6');
    if (subjectArea) {
      subjectArea.appendChild(indicator);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GmailSentimentAnalyzer();
  });
} else {
  new GmailSentimentAnalyzer();
}