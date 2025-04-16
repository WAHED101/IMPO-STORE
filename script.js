
// Mobile Menu Toggle
document.querySelector('.menu-toggle').addEventListener('click', function() {
    document.querySelector('.nav-links').classList.toggle('active');
});

// Copy IP Address
document.getElementById('copy-ip').addEventListener('click', function() {
    const ip = document.getElementById('server-ip').textContent;
    navigator.clipboard.writeText(ip).then(() => {
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        setTimeout(() => {
            this.textContent = originalText;
        }, 2000);
    });
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            document.querySelector('.nav-links').classList.remove('active');
        }
    });
});

// Purchase Buttons
document.querySelectorAll('.btn-secondary, .btn-primary').forEach(button => {
    if (button.textContent.includes('Purchase') || button.textContent.includes('Vote Now')) {
        button.addEventListener('click', function() {
            const item = this.parentElement.querySelector('h3').textContent;
            
            // In a real implementation, you would connect to a payment processor or vote site
            
        });
    }
});
    // Copy IP functionality
    document.getElementById('copy-ip').addEventListener('click', function() {
        const ip = document.getElementById('server-ip').textContent;
        navigator.clipboard.writeText(ip).then(() => {
            this.textContent = 'Copied!';
            setTimeout(() => {
                this.textContent = 'Play';
            }, 2000);
        });
    });
    
    // Mobile menu toggle
    document.querySelector('.menu-toggle').addEventListener('click', function() {
        document.querySelector('.nav-links').classList.toggle('active');
    });


    
  // ====================== Firebase Initialization ======================
  const firebaseConfig = {
    apiKey: "AIzaSyATm8V-vInYwYR0KPH1Kf06BzjjJ4xeQXU",
    authDomain: "impo-b098d.firebaseapp.com",
    databaseURL: "https://impo-b098d-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "impo-b098d",
    storageBucket: "impo-b098d.firebasestorage.app",
    messagingSenderId: "498933533524",
    appId: "1:498933533524:web:aabb9888f4793025a0d6c1"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  
  // ====================== Data Display Logic ======================
  document.addEventListener('DOMContentLoaded', function() {
    fetchAndDisplayData('gems', '.gems-grid', createGemCard);
    fetchAndDisplayData('ranklist', '.rank-grid', createRankCard);
    fetchAndDisplayData('votes', '.vote-grid', createVoteCard);
  });
  
  // ====================== Helper Functions ======================
  function saveToFirebase(product, path) {
    const newProductRef = database.ref(path).push();
    newProductRef.set(product)
      .then(() => {
        alert('Product saved to Firebase successfully!');
        document.getElementById('minecraft-product-form').reset();
        document.getElementById('add-product-form').style.display = 'none';
        
        // Refresh the displayed data
        if (path === 'gems') fetchAndDisplayData('gems', '.gems-grid', createGemCard);
        else if (path === 'ranklist') fetchAndDisplayData('ranklist', '.rank-grid', createRankCard);
        else if (path === 'votes') fetchAndDisplayData('votes', '.vote-grid', createVoteCard);
      })
      .catch((error) => {
        alert('Error saving product: ' + error.message);
      });
  }
  
  function fetchAndDisplayData(path, containerSelector, createCardFunction) {
    database.ref(path).once('value')
      .then((snapshot) => {
        const data = snapshot.val();
        const container = document.querySelector(containerSelector);
        
        if (!data) {
          container.innerHTML = '<p>No items found.</p>';
          return;
        }
        
        container.innerHTML = '';
        Object.keys(data).forEach((key) => {
          const item = data[key];
          const card = createCardFunction(item);
          container.appendChild(card);
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        document.querySelector(containerSelector).innerHTML = '<p>Failed to load data.</p>';
      });
  }
  
  function createGemCard(gem) {
    const card = document.createElement('div');
    card.className = 'gem-card';
    card.innerHTML = `
      <div class="gem-image">
        <img src="${gem.image || 'IMG/gem-1.png'}" alt="${gem.name}" onerror="this.src='IMG/gem-1.png'">
        ${gem.popular ? '<span class="popular-badge">POPULAR</span>' : ''}
      </div>
      <div class="gem-info">
        <h3>${gem.name}</h3>
        <p class="price">${gem.price}</p>
        <button class="btn ${gem.popular ? 'btn-primary' : 'btn-secondary'} purchase-btn" 
                data-name="${gem.name}" 
                data-price="${gem.price}">
          Purchase
        </button>
      </div>
    `;
    return card;
  }
  
  function createRankCard(rank) {
    const card = document.createElement('div');
    card.className = 'rank-card';
    
    if (rank.popular) {
      card.classList.add('popular');
    }
  
    // Robust feature extraction with multiple fallbacks
    let features = [];
    
    // Case 1: Features exist as array
    if (Array.isArray(rank.features)) {
      features = rank.features;
    } 
    // Case 2: Features exist as string
    else if (typeof rank.features === 'string') {
      // First try splitting by literal '\n'
      if (rank.features.includes('\\n')) {
        features = rank.features.split('\\n');
      }
      // Then try actual newlines
      else if (rank.features.includes('\n')) {
        features = rank.features.split('\n');
      }
      // Fallback to comma separation
      else {
        features = rank.features.split(',').map(f => f.trim());
      }
    }
    // Case 3: Use description as fallback
    else if (rank.description) {
      if (rank.description.includes('\\n')) {
        features = rank.description.split('\\n');
      }
      else if (rank.description.includes('\n')) {
        features = rank.description.split('\n');
      }
      else {
        features = [rank.description];
      }
    }
    // Case 4: No features available
    else {
      features = ['No features listed'];
    }
  
    // Clean up features (remove empty entries, trim whitespace)
    features = features.map(f => f.trim()).filter(f => f.length > 0);
    if (features.length === 0) features = ['No features listed'];
  
    const defaultImage = getDefaultImage('ranks');
  
    card.innerHTML = `
      <img src="${rank.image || defaultImage}" alt="${rank.name}" onerror="this.src='${defaultImage}'">
      ${rank.popular ? '<div class="popular-badge">POPULAR</div>' : ''}
      <h3>${rank.name || 'Unnamed Rank'}</h3>
      <p class="price">${rank.price || 'Price not set'}</p>
      <ul>
        ${features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <button class="btn ${rank.popular ? 'btn-primary' : 'btn-secondary'} buy-btn" 
              data-name="${rank.name}" 
              data-price="${rank.price}">
        Purchase
      </button>
    `;
    
    return card;
  }
  
  
  function createVoteCard(vote) {
    const card = document.createElement('div');
    card.className = 'vote-card';
    card.innerHTML = `
      <div class="vote-image">
        <img src="${vote.image || 'IMG/vote1.png'}" alt="${vote.name}">
      </div>
      <div class="vote-info">
        <h3>${vote.name}</h3>
        <a href="${vote.description}" target="_blank" class="btn btn-primary btn-secondary">Vote Now</a>
      </div>
    `;
    return card;
  }
  
  function generateId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  
  function getDefaultImage(category) {
    if (category === 'ranks') return 'IMG/rank-default.png';
    if (category === 'gems') return 'IMG/gem-default.png';
    if (category === 'votes') return 'IMG/vote-default.png';
    return 'IMG/gem1.png';
  }
  
  
  document.addEventListener('DOMContentLoaded', function() {
    // This will handle both rank and gem purchase buttons
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('purchase-btn') || e.target.classList.contains('buy-btn')) {
        const itemName = e.target.getAttribute('data-name');
        const itemPrice = e.target.getAttribute('data-price');
        
        // Set modal content
        document.getElementById('item-name').value = itemName;
        document.getElementById('item-price').value = itemPrice;
        document.getElementById('bkash-amount').textContent = itemPrice;
        document.getElementById('nagad-amount').textContent = itemPrice;
        
        // Show modal
        document.getElementById('purchaseModal').style.display = 'block';
      }
    });
  });
  // Modal functionality
  document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('purchaseModal');
    const closeBtn = document.querySelector('.close-modal');
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    
    // Handle buy button clicks
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('buy-btn')) {
        const itemName = e.target.getAttribute('data-name');
        const itemPrice = e.target.getAttribute('data-price');
        
        // Set modal content
        document.getElementById('item-name').value = itemName;
        document.getElementById('item-price').value = itemPrice;
        document.getElementById('bkash-amount').textContent = itemPrice;
        document.getElementById('nagad-amount').textContent = itemPrice;
        
        // Show modal
        modal.style.display = 'block';
      }
    });
    
    // Close modal
    closeBtn.addEventListener('click', function() {
      modal.style.display = 'none';
    });
    
    // Close when clicking outside modal
    window.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Handle payment method switching
    paymentOptions.forEach(option => {
      option.addEventListener('change', function() {
        document.querySelectorAll('.payment-instructions').forEach(inst => {
          inst.style.display = 'none';
        });
        document.getElementById(`${this.value}-instructions`).style.display = 'block';
      });
    });
    
    // Handle form submission
    document.getElementById('purchaseForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = {
        minecraftUsername: document.getElementById('username').value,
        discordUsername: document.getElementById('discord').value,
        phoneNumber: document.getElementById('phone').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        itemName: document.getElementById('item-name').value,
        itemPrice: document.getElementById('item-price').value
      };
      
      // Here you would typically send this data to your server
      console.log('Purchase data:', formData);
      
      // Show success message
      alert('Purchase request received! We will contact you shortly.');
      
      // Close modal
      modal.style.display = 'none';
      
      // Reset form
      this.reset();
    });
  });

  // Handle form submission
document.getElementById('purchaseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
      minecraftUsername: document.getElementById('username').value.trim(),
      discordUsername: document.getElementById('discord').value.trim(),
      phoneNumber: document.getElementById('phone').value.trim(),
      paymentMethod: document.querySelector('input[name="payment"]:checked').value,
      itemName: document.getElementById('item-name').value,
      itemPrice: document.getElementById('item-price').value,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      status: "pending"
    };
    
    // Validate inputs
    if (!formData.minecraftUsername || !formData.discordUsername || !formData.phoneNumber) {
      alert('Please fill all required fields');
      return;
    }
  
    // Reference to Firebase database
    const purchasesRef = firebase.database().ref('purchases');
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    // Save to Firebase
    purchasesRef.push(formData)
      .then(() => {
        // Success
        alert('Purchase submitted successfully! We will contact you shortly.');
        
        // Close modal
        modal.style.display = 'none';
        
        // Reset form
        this.reset();
      })
      .catch((error) => {
        // Error
        console.error('Error saving purchase:', error);
        alert('Error submitting purchase. Please try again.');
      })
      .finally(() => {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Purchase';
        modal.style.display = 'none';
      });
  });