// Simple sentiment analysis expression words
class SentimentAnalyzer {
  constructor() {
    // Positive words list
    this.positiveWords = [
      'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'good', 'wonderful',
      'brilliant', 'outstanding', 'perfect', 'love', 'like', 'enjoy', 'happy',
      'excited', 'pleased', 'delighted', 'thrilled', 'satisfied', 'impressed',
      'grateful', 'thankful', 'appreciate', 'welcome', 'congratulations',
      'success', 'achievement', 'victory', 'win', 'positive', 'beautiful',
      'nice', 'cool', 'super', 'best', 'better', 'improved', 'upgrade',
      'helpful', 'useful', 'valuable', 'benefit', 'advantage', 'opportunity'
    ];

    // Negative words list
    this.negativeWords = [
      'terrible', 'awful', 'horrible', 'bad', 'worst', 'hate', 'dislike',
      'angry', 'mad', 'furious', 'upset', 'disappointed', 'frustrated',
      'annoyed', 'irritated', 'sad', 'depressed', 'unhappy', 'miserable',
      'disgusted', 'appalled', 'shocked', 'outraged', 'concerned', 'worried',
      'anxious', 'stressed', 'problem', 'issue', 'trouble', 'difficult',
      'hard', 'challenging', 'impossible', 'failed', 'failure', 'mistake',
      'error', 'wrong', 'broken', 'damaged', 'poor', 'weak', 'slow',
      'expensive', 'costly', 'waste', 'useless', 'pointless', 'ridiculous'
    ];

    // Neutral words list
    this.neutralWords = [
      'very', 'really', 'extremely', 'incredibly', 'absolutely', 'totally',
      'completely', 'quite', 'rather', 'pretty', 'so', 'too', 'much'
    ];
  }

  analyze(content) {
    if (!content || typeof content !== 'string') {
      return { score: 0, sentiment: 'neutral', confidence: 0 };
    }

    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = words.length;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let multiplier = 1;

      // Check for neutralWords before the current word
      if (i > 0 && this.neutralWords.includes(words[i - 1])) {
        multiplier = 1.5;
      }

      if (this.positiveWords.includes(word)) {
        score += 1 * multiplier;
        positiveCount++;
      } else if (this.negativeWords.includes(word)) {
        score -= 1 * multiplier;
        negativeCount++;
      }
    }

    // Normalize score
    const normalizedScore = totalWords > 0 ? score / Math.sqrt(totalWords) : 0;
    
    // Determine sentiment
    let sentiment = 'neutral';
    let confidence = 0;

    if (normalizedScore > 0.1) {
      sentiment = 'positive';
      confidence = Math.min(normalizedScore * 0.5, 1);
    } else if (normalizedScore < -0.1) {
      sentiment = 'negative';
      confidence = Math.min(Math.abs(normalizedScore) * 0.5, 1);
    } else {
      confidence = 0.1;
    }

    return {
      score: Math.round(normalizedScore * 100) / 100,
      sentiment,
      confidence: Math.round(confidence * 100) / 100,
      wordCount: totalWords,
      positiveWords: positiveCount,
      negativeWords: negativeCount
    };
  }

  getSentimentEmoji(sentiment) {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  }

  getSentimentColor(sentiment) {
    switch (sentiment) {
      case 'positive': return '#4CAF50';
      case 'negative': return '#f44336';
      default: return '#9E9E9E';
    }
  }
}