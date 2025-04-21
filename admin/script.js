

firebase.initializeApp(firebaseConfig);
const database = firebase.database();



  // Handle category selection change
  document.getElementById('product-category').addEventListener('change', function() {
    // Hide all category-specific fields
    document.querySelectorAll('.category-specific').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show fields for selected category
    const category = this.value;
    if (category === 'ranks') {
        document.getElementById('rank-features').style.display = 'block';
    } else if (category === 'gems') {
        document.getElementById('gem-fields').style.display = 'block';
    }
});

// Form submission
document.getElementById('minecraft-product-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const category = document.getElementById('product-category').value;
    const price = document.getElementById('product-price').value;
    const stock = document.getElementById('product-stock').value || null;
    const image = document.getElementById('product-image').value || getDefaultImage(category);
    
    const product = {
        name: name,
        image: image,
        price: `৳${parseFloat(price).toFixed(2)}`,
        popular: false
    };

    if (category === 'ranks') {
      const featuresText = document.getElementById('rank-features-textarea').value;
      const perksArray = featuresText.split('\n').filter(line => line.trim() !== '');
      const perksObject = {};
      perksArray.forEach((line, index) => {
          perksObject[index] = line.trim();
      });
      product.perks = perksObject;
    } else if (category === 'gems') {
        const gemAmount = document.getElementById('gem-amount').value;
        product.amount = parseInt(gemAmount);
    }
    
    // Determine Firebase path
    let firebasePath;
    if (category === 'ranks') firebasePath = 'shop/ranks';
    else if (category === 'gems') firebasePath = 'shop/gems';
    else if (category === 'votes') firebasePath = 'voteSites';
    else {
        alert('Invalid category selected');
        return;
    }
    
    // Save to Firebase
    saveToFirebase(product, firebasePath);
    
    // Reset form
    this.reset();
    document.getElementById('add-product-form').style.display = 'none';
});

// Helper function to save to Firebase
function saveToFirebase(product, path) {
    const newProductRef = database.ref(path).push(); // Auto-generates a unique ID
    newProductRef.set(product)
        .then(() => {
            alert('Product saved to Firebase successfully!');
        })
        .catch((error) => {
            alert('Error saving product: ' + error.message);
        });
}

// Helper function to generate ID (if needed)
function generateId(name) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Helper function for default image
function getDefaultImage(category) {
    if (category === 'ranks') return '../IMG/rank1.png';
    if (category === 'gems') return '../IMG/gem1.png';
    if (category === 'votes') return '../IMG/vote1.png';
    return '../IMG/gem1.png';
}





  // Navigation between sections
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected section
        const sectionId = this.getAttribute('data-section') + '-section';
        document.getElementById(sectionId).classList.add('active');
        
        // Update page title
        const pageTitle = this.querySelector('span').textContent;
        document.getElementById('page-title').textContent = pageTitle;
    });
});

// Product management
document.getElementById('add-product-btn').addEventListener('click', function() {
    document.getElementById('add-product-form').style.display = 'block';
});

document.getElementById('cancel-add-product').addEventListener('click', function() {
    document.getElementById('add-product-form').style.display = 'none';
});
