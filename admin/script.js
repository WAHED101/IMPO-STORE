// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// DOM Elements - with proper existence checks
const modal = document.getElementById('product-modal');
const modalTitle = modal ? document.getElementById('modal-title') : null;
const productForm = document.getElementById('product-form');
const cancelProductBtn = document.getElementById('cancel-product');
const closeModalBtn = document.querySelector('.close-modal');
const productCategorySelect = document.getElementById('product-category');
const productSearchInput = document.getElementById('search-products');

// Direct form in Add section
const directProductForm = document.getElementById('direct-product-form');
const directProductCategory = document.getElementById('direct-product-category');

// Mobile detection for optimizing UI
const isMobile = window.innerWidth <= 768;

// Safely add event listener with existence check
function addSafeEventListener(element, event, callback) {
  if (element) {
    element.addEventListener(event, callback);
  }
}

// Handle category selection change in modal
addSafeEventListener(productCategorySelect, 'change', function() {
    // Hide all category-specific fields
    document.querySelectorAll('.category-specific').forEach(el => {
        el.style.display = 'none';
    });
    
    // Show fields for selected category
    const category = this.value;
    const popularToggle = document.getElementById('popular-toggle');
    const popularField = popularToggle ? popularToggle.closest('.form-group') : null;
    const priceField = document.getElementById('product-price');
    const priceFormGroup = priceField ? priceField.closest('.form-group') : null;
    
    if (category === 'ranks') {
    const rankFields = document.getElementById('rank-fields');
    const rankPerksField = document.getElementById('rank-perks-field');
    
    if (rankFields) rankFields.style.display = 'block';
    if (rankPerksField) rankPerksField.style.display = 'block';
    if (popularField) popularField.style.display = 'block';
    if (priceFormGroup) priceFormGroup.style.display = 'block';
  } else if (category === 'gems') {
    const gemFields = document.getElementById('gem-fields');
    if (gemFields) gemFields.style.display = 'block';
    if (popularField) popularField.style.display = 'block';
    if (priceFormGroup) priceFormGroup.style.display = 'block';
  } else if (category === 'voteSites') {
    const voteFields = document.getElementById('vote-fields');
    if (voteFields) voteFields.style.display = 'block';
    if (popularField) popularField.style.display = 'none';
    if (priceFormGroup) priceFormGroup.style.display = 'none';
  }
});

// Handle category selection change in direct form
addSafeEventListener(directProductCategory, 'change', function() {
  // Hide all category-specific fields
  document.querySelectorAll('.direct-category-specific').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show fields for selected category
  const category = this.value;
  const directPopularToggle = document.getElementById('direct-popular-toggle');
  const popularField = directPopularToggle ? directPopularToggle.closest('.form-group') : null;
  const priceField = document.getElementById('direct-product-price');
  const priceFormGroup = priceField ? priceField.closest('.form-group') : null;
  
  if (category === 'ranks') {
    const directRankFields = document.getElementById('direct-rank-fields');
    const directRankPerksField = document.getElementById('direct-rank-perks-field');
    
    if (directRankFields) directRankFields.style.display = 'block';
    if (directRankPerksField) directRankPerksField.style.display = 'block';
    if (popularField) popularField.style.display = 'block';
    if (priceFormGroup) priceFormGroup.style.display = 'block';
    } else if (category === 'gems') {
    const directGemFields = document.getElementById('direct-gem-fields');
    if (directGemFields) directGemFields.style.display = 'block';
    if (popularField) popularField.style.display = 'block';
    if (priceFormGroup) priceFormGroup.style.display = 'block';
  } else if (category === 'voteSites') {
    const directVoteFields = document.getElementById('direct-vote-fields');
    if (directVoteFields) directVoteFields.style.display = 'block';
    if (popularField) popularField.style.display = 'none';
    if (priceFormGroup) priceFormGroup.style.display = 'none';
  }
});

// Open modal for adding a new product
function openProductModal(editMode = false, productData = null, category = null) {
  if (!modal) return;
  
  modal.style.display = 'block';
  
  if (editMode && productData && modalTitle) {
    modalTitle.textContent = 'Edit Product';
    fillFormWithProductData(productData, category);
  } else if (modalTitle) {
    modalTitle.textContent = 'Add New Product';
    if (productForm) productForm.reset();
    
    if (category && productCategorySelect) {
      productCategorySelect.value = category;
      productCategorySelect.dispatchEvent(new Event('change'));
    }
  }
  
  // On mobile, scroll to top of modal
  if (isMobile) {
    setTimeout(() => {
      if (modal) modal.scrollTop = 0;
    }, 100);
  }
}

// Fill form with product data for editing
function fillFormWithProductData(product, category) {
  const idField = document.getElementById('product-id');
  const nameField = document.getElementById('product-name');
  const categoryField = document.getElementById('product-category');
  const priceField = document.getElementById('product-price');
  const priceFormGroup = priceField ? priceField.closest('.form-group') : null;
  const imageField = document.getElementById('product-image');
  const popularField = document.getElementById('popular-toggle');
  const popularFormGroup = popularField ? popularField.closest('.form-group') : null;
  
  if (idField) idField.value = product.key || '';
  if (nameField) nameField.value = product.name || '';
  
  if (categoryField) {
    categoryField.value = category;
    categoryField.dispatchEvent(new Event('change'));
  }
  
  // Handle price (remove currency symbol if present)
  if (priceField && category !== 'voteSites') {
    const price = typeof product.price === 'string' 
      ? product.price.replace(/[^\d.]/g, '') 
      : product.price;
    priceField.value = price || '';
  }
  
  // Show/hide price field based on category
  if (priceFormGroup) {
    priceFormGroup.style.display = category === 'voteSites' ? 'none' : 'block';
  }
  
  if (imageField) imageField.value = product.image || '';
  
  // Handle popular toggle based on category
  if (popularField) {
    popularField.value = product.popular ? 'true' : 'false';
    
    // Show/hide popular field based on category
    if (popularFormGroup) {
      popularFormGroup.style.display = category === 'voteSites' ? 'none' : 'block';
    }
  }
  
  if (category === 'ranks') {
    const descField = document.getElementById('rank-description');
    const featuresField = document.getElementById('rank-features-textarea');
    
    if (descField) descField.value = product.description || '';
    
    // Handle perks if available
    if (product.perks && featuresField) {
      let perksText = '';
      if (typeof product.perks === 'object') {
        perksText = Object.values(product.perks).join('\n');
      } else if (Array.isArray(product.perks)) {
        perksText = product.perks.join('\n');
      }
      featuresField.value = perksText;
    }
  } else if (category === 'gems') {
    const amountField = document.getElementById('gem-amount');
    if (amountField) amountField.value = product.amount || '';
  } else if (category === 'voteSites') {
    const urlField = document.getElementById('vote-url');
    if (urlField) urlField.value = product.url || '';
  }
}

// Function specifically for adding/editing vote sites
function saveVoteSite(name, imageUrl, url, productId = null) {
  console.log('saveVoteSite called with:', { name, imageUrl, url, productId });
  
  // Validate inputs
  if (!name) {
    showNotification('Name is required for vote sites', 'error');
    return Promise.reject(new Error('Name is required'));
  }
  
  // Use a default URL if none is provided
  const safeUrl = url || '#';
  
  const voteSite = {
    name: name,
    image: imageUrl || getDefaultImage('voteSites'),
    url: safeUrl
  };
  
  console.log('Vote site data to save:', voteSite);
  
  let savePromise;
  const path = 'voteSites';
  
  try {
    if (productId) {
      console.log('Updating existing vote site with ID:', productId);
      savePromise = firebase.database().ref(`${path}/${productId}`).update(voteSite);
    } else {
      console.log('Creating new vote site');
      const newRef = firebase.database().ref(path).push();
      savePromise = newRef.set(voteSite);
    }
    
    return savePromise
      .then(() => {
        console.log('Vote site saved successfully');
        showNotification('Vote site saved successfully!', 'success');
        return true;
      })
      .catch((error) => {
        console.error('Error saving vote site to Firebase:', error);
        showNotification('Error: ' + (error.message || 'Failed to save vote site'), 'error');
        throw error;
      });
  } catch (error) {
    console.error('Exception while trying to save vote site:', error);
    showNotification('Error: ' + (error.message || 'Failed to save vote site'), 'error');
    return Promise.reject(error);
  }
}

// Update the modal form submission handler to use the specialized functions
addSafeEventListener(productForm, 'submit', function(e) {
    e.preventDefault();
    
  const productId = document.getElementById('product-id')?.value;
  const name = document.getElementById('product-name')?.value;
  const category = document.getElementById('product-category')?.value;
  const price = document.getElementById('product-price')?.value;
  const image = document.getElementById('product-image')?.value || getDefaultImage(category);
  const popular = document.getElementById('popular-toggle')?.value === 'true';
  
  // Debug logging
  console.log('Form submission - Category:', category);
  console.log('Form fields:', { name, category, price, image, popular });
  
  // Check required fields based on category
  if (!name || !category) {
    alert('Please fill out all required fields');
    return;
  }
  
  // Special handling for voteSites
  if (category === 'voteSites') {
    const urlField = document.getElementById('vote-url');
    const url = urlField?.value;
    
    // Check if the vote-fields container is visible
    const voteFieldsContainer = document.getElementById('vote-fields');
    const isVoteFieldsVisible = voteFieldsContainer && voteFieldsContainer.style.display !== 'none';
    
    // Only validate URL if the fields are visible
    if (isVoteFieldsVisible && !url) {
      alert('Please enter a URL for the vote site');
      return;
    }
    
    saveVoteSite(name, image, url || '', productId)
      .then(() => {
        if (modal) modal.style.display = 'none';
        productForm.reset();
      })
      .catch(error => {
        console.error('Failed to save vote site:', error);
      });
    return;
  }
  
  // For non-vote sites, verify price is provided
  if (category !== 'voteSites' && !price) {
    alert('Please enter a price for this product');
    return;
  }
  
  // Handle ranks category
    if (category === 'ranks') {
    const descField = document.getElementById('rank-description');
    const featuresField = document.getElementById('rank-features-textarea');
    let description = '';
    let perks = null;
    
    if (descField) description = descField.value;
    
    if (featuresField) {
      const featuresText = featuresField.value;
      const perksArray = featuresText.split('\n').filter(line => line.trim() !== '');
      const perksObject = {};
      perksArray.forEach((line, index) => {
          perksObject[index] = line.trim();
      });
      perks = perksObject;
    }
    
    saveRankProduct(name, image, price, popular, description, perks, productId)
      .then(() => {
        if (modal) modal.style.display = 'none';
        productForm.reset();
      })
      .catch(error => {
        console.error('Failed to save rank product:', error);
      });
    return;
  }
  
  // Handle gems category
  if (category === 'gems') {
    const gemAmount = document.getElementById('gem-amount')?.value;
    let amount = null;
    if (gemAmount) amount = parseInt(gemAmount);
    
    saveGemProduct(name, image, price, popular, amount, productId)
      .then(() => {
        if (modal) modal.style.display = 'none';
        productForm.reset();
      })
      .catch(error => {
        console.error('Failed to save gem product:', error);
      });
    return;
  }
  
  // If somehow we get here with an invalid category
        alert('Invalid category selected');
});

// Direct form submission
addSafeEventListener(directProductForm, 'submit', function(e) {
  console.log('Direct form submit event triggered');
  // Prevent default form submission
  e.preventDefault();
  
  try {
    const productId = document.getElementById('direct-product-id')?.value;
    const name = document.getElementById('direct-product-name')?.value;
    const category = document.getElementById('direct-product-category')?.value;
    const price = document.getElementById('direct-product-price')?.value;
    const image = document.getElementById('direct-product-image')?.value || getDefaultImage(category);
    const popular = document.getElementById('direct-popular-toggle')?.value === 'true';
    
    console.log('Direct form submission - Category:', category);
    console.log('Direct form fields:', { name, category, price, image, popular });
    
    // Check required fields based on category
    if (!name || !category) {
      alert('Please fill out all required fields');
      return;
    }
    
    // Special handling for voteSites
    if (category === 'voteSites') {
      console.log('Processing vote site submission');
      const urlField = document.getElementById('direct-vote-url');
      console.log('URL field found:', !!urlField);
      const url = urlField?.value;
      console.log('URL value:', url);
      
      // Check if the direct-vote-fields container is visible
      const voteFieldsContainer = document.getElementById('direct-vote-fields');
      const isVoteFieldsVisible = voteFieldsContainer && voteFieldsContainer.style.display !== 'none';
      console.log('Vote fields container visible:', isVoteFieldsVisible);
      
      // Only validate URL if the fields are visible
      if (isVoteFieldsVisible && !url) {
        alert('Please enter a URL for the vote site');
        return;
      }
      
      console.log('Calling saveVoteSite with:', { name, image, url: url || '', productId });
      saveVoteSite(name, image, url || '', productId)
        .then(() => {
          console.log('Vote site saved successfully, resetting form');
          if (directProductForm) {
            directProductForm.reset();
            // Scroll back to top of form on mobile
            if (isMobile) {
              window.scrollTo({
                top: directProductForm.offsetTop - 20,
                behavior: 'smooth'
              });
            }
          }
        })
        .catch(error => {
          console.error('Failed to save vote site:', error);
        });
      return;
    }
    
    // For non-vote sites, verify price is provided
    if (category !== 'voteSites' && !price) {
      alert('Please enter a price for this product');
      return;
    }
    
    // Handle ranks category
    if (category === 'ranks') {
      const descField = document.getElementById('direct-rank-description');
      const featuresField = document.getElementById('direct-rank-features');
      let description = '';
      let perks = null;
      
      if (descField) description = descField.value;
      
      if (featuresField) {
        const featuresText = featuresField.value;
        const perksArray = featuresText.split('\n').filter(line => line.trim() !== '');
        const perksObject = {};
        perksArray.forEach((line, index) => {
          perksObject[index] = line.trim();
        });
        perks = perksObject;
      }
      
      saveRankProduct(name, image, price, popular, description, perks, productId)
        .then(() => {
          if (directProductForm) {
            directProductForm.reset();
            // Scroll back to top of form on mobile
            if (isMobile) {
              window.scrollTo({
                top: directProductForm.offsetTop - 20,
                behavior: 'smooth'
              });
            }
          }
        })
        .catch(error => {
          console.error('Failed to save rank product:', error);
        });
        return;
    }
    
    // Handle gems category
    if (category === 'gems') {
      const gemAmount = document.getElementById('direct-gem-amount')?.value;
      let amount = null;
      if (gemAmount) amount = parseInt(gemAmount);
      
      saveGemProduct(name, image, price, popular, amount, productId)
        .then(() => {
          if (directProductForm) {
            directProductForm.reset();
            // Scroll back to top of form on mobile
            if (isMobile) {
              window.scrollTo({
                top: directProductForm.offsetTop - 20,
                behavior: 'smooth'
              });
            }
          }
        })
        .catch(error => {
          console.error('Failed to save gem product:', error);
        });
      return;
    }
    
    // If somehow we get here with an invalid category
    alert('Invalid category selected');
  } catch (error) {
    console.error('Error in direct form submission handler:', error);
    showNotification('An error occurred while processing your request', 'error');
  }
});

// Helper function to save to Firebase
function saveToFirebase(product, path, productId = null, isDirectForm = false) {
  console.log('saveToFirebase called with:', { product, path, productId, isDirectForm });
  
  let savePromise;
  
  try {
    if (productId) {
      console.log('Updating existing product with ID:', productId);
      // Update existing product
      savePromise = firebase.database().ref(`${path}/${productId}`).update(product);
    } else {
      console.log('Creating new product');
      // Create new product
      const newProductRef = firebase.database().ref(path).push();
      savePromise = newProductRef.set(product);
    }
    
    return savePromise
        .then(() => {
        console.log('Firebase save successful');
        showNotification('Product saved successfully!', 'success');
        if (isDirectForm && directProductForm) {
          directProductForm.reset();
          // Scroll back to top of form on mobile
          if (isMobile) {
            window.scrollTo({
              top: directProductForm.offsetTop - 20,
              behavior: 'smooth'
            });
          }
        }
        return true;
        })
        .catch((error) => {
        console.error('Firebase save error details:', error);
        showNotification('Error: ' + error.message, 'error');
        console.error('Firebase save error:', error);
        throw error;
        });
  } catch (error) {
    console.error('Exception while trying to save to Firebase:', error);
    showNotification('Error: ' + (error.message || 'Failed to save product'), 'error');
    return Promise.reject(error);
}
}

// Helper function for default image
function getDefaultImage(category) {
    if (category === 'voteSites') return '../IMG/vote1.png';
    if (category === 'ranks') return '../IMG/rank1.png';
    if (category === 'gems') return '../IMG/gem1.png';
    return '../IMG/default.png';
}

// Track deleted products
function trackDeletion(id, category, name) {
  try {
    // Get existing deletion history or initialize an empty array
    const deletionHistory = JSON.parse(localStorage.getItem('deletionHistory') || '[]');
    
    // Add this deletion to the history
    deletionHistory.push({
      id: id,
      category: category,
      name: name,
      timestamp: Date.now()
    });
    
    // Keep only the last 20 deletions
    while (deletionHistory.length > 20) {
      deletionHistory.shift(); // Remove the oldest
    }
    
    // Save back to localStorage
    localStorage.setItem('deletionHistory', JSON.stringify(deletionHistory));
    console.log(`Tracked deletion of ${category} '${name}' with ID ${id}`);
  } catch (e) {
    console.error('Error tracking deletion:', e);
  }
}

// Modify the handleDeleteRequest function
function handleDeleteRequest(requestId) {
  if (confirm('Are you sure you want to delete this request?')) {
    firebase.database().ref('purchases/' + requestId).remove()
      .then(() => {
        // Track the deletion
        trackDeletion(requestId, 'request', 'Purchase Request');
        showNotification('Request deleted successfully', 'success');
        // Refresh requests
        fetchRequests();
      })
      .catch(error => {
        console.error('Error deleting request:', error);
        showNotification('Error deleting request: ' + error.message, 'error');
      });
  }
}

// Find the deleteProduct function and modify it
function deleteProduct(id, category) {
  if (!id || !category) {
    console.error('Missing product ID or category for deletion');
    return;
  }
  
  if (confirm('Are you sure you want to delete this product?')) {
    console.log(`Deleting product: ${id} from category: ${category}`);
    
    // Determine the correct path based on category
    let path;
    if (category === 'voteSites') {
      path = 'voteSites';
    } else {
      path = `shop/${category}`;
    }
    
    // Get the product name for tracking before deletion
    firebase.database().ref(`${path}/${id}`).once('value')
      .then(snapshot => {
        const product = snapshot.val();
        const productName = product ? (product.name || 'Unknown product') : 'Unknown product';
        
        // Delete the product
        return firebase.database().ref(`${path}/${id}`).remove()
          .then(() => {
            // Track the deletion
            trackDeletion(id, category, productName);
            showNotification('Product deleted successfully', 'success');
            if (typeof loadProducts === 'function') {
              loadProducts();
            } else {
              // If loadProducts is not defined, refresh the specific tables
              if (category === 'voteSites') {
                // Refresh vote sites table by reloading the page
                location.reload();
              }
            }
            loadRecentActivity(); // Refresh activity feed
          });
      })
      .catch(error => {
        console.error('Error deleting product:', error);
        showNotification('Error: ' + error.message, 'error');
      });
  }
}

// Edit a product
function editProduct(key, category) {
  if (!key || !category) {
    showNotification('Invalid edit request', 'error');
    return;
  }
  
  let path;
  if (category === 'ranks') path = 'shop/ranks';
  else if (category === 'gems') path = 'shop/gems';
  else if (category === 'voteSites') path = 'voteSites';
  
  firebase.database().ref(`${path}/${key}`).once('value')
    .then(snapshot => {
      const productData = snapshot.val();
      if (!productData) {
        showNotification('Product not found', 'error');
        return;
      }
      productData.key = key;
      openProductModal(true, productData, category);
    })
    .catch(error => {
      console.error('Error fetching product data:', error);
      showNotification('Error loading product data', 'error');
    });
}

// Search functionality
addSafeEventListener(productSearchInput, 'input', function() {
  const searchTerm = this.value.toLowerCase();
  
  // Search in all tables
  searchTable('gemTableBody', searchTerm);
  searchTable('gems', searchTerm);
  searchTable('votes', searchTerm);
});

function searchTable(tableId, searchTerm) {
  const tableElement = document.getElementById(tableId);
  if (!tableElement) return;
  
  const rows = tableElement.querySelectorAll('tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
  });
}

// Show notification
function showNotification(message, type = 'info') {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notif => {
    notif.remove();
  });
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after timeout
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Handle window resize for responsive adjustments
window.addEventListener('resize', debounce(function() {
  const newIsMobile = window.innerWidth <= 768;
  if (newIsMobile !== isMobile) {
    // Refresh layout if mobile state changed
    location.reload();
  } else {
    // Just enhance the navigation when resizing
  }
}, 250));

// Debounce function to limit expensive operations
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Function to check Firebase connectivity
function checkFirebaseConnectivity() {
  console.log('Checking Firebase connectivity...');
  const connectedRef = firebase.database().ref('.info/connected');
  connectedRef.on('value', (snap) => {
    if (snap.val() === true) {
      console.log('Connected to Firebase database');
    } else {
      console.log('Not connected to Firebase database');
    }
  });
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM fully loaded - Initializing admin panel');
  
  // Check Firebase connectivity first
  checkFirebaseConnectivity();
  
  // Make sure all product sections are visible
  const rankSection = document.getElementById('ranks-table')?.closest('.table-responsive')?.parentElement;
  const gemsSection = document.getElementById('gems-table')?.closest('.table-responsive')?.parentElement;
  const votesSection = document.getElementById('vote-sites-table')?.closest('.table-responsive')?.parentElement;
  
  if (rankSection) rankSection.style.display = 'block';
  if (gemsSection) gemsSection.style.display = 'block';
  if (votesSection) votesSection.style.display = 'block';
  
  // Setup the direct category selector if it exists
  if (directProductCategory) {
    directProductCategory.dispatchEvent(new Event('change'));
  }
  
  // Close modal handlers
  addSafeEventListener(closeModalBtn, 'click', () => {
    if (modal) modal.style.display = 'none';
  });

  addSafeEventListener(cancelProductBtn, 'click', () => {
    if (modal) modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (modal && e.target === modal) {
      modal.style.display = 'none';
    }
  });
  
  // Enhance touch experience for mobile
  if (isMobile) {
    // Make tables swipeable with touch
    const tables = document.querySelectorAll('.table-responsive');
    tables.forEach(table => {
      table.addEventListener('touchstart', function(e) {
        this.setAttribute('data-x-start', e.touches[0].clientX);
      });
      
      table.addEventListener('touchmove', function(e) {
        const xStart = parseInt(this.getAttribute('data-x-start') || 0);
        const xDiff = xStart - e.touches[0].clientX;
        this.scrollLeft += xDiff / 3; // Smooth scrolling
        this.setAttribute('data-x-start', e.touches[0].clientX);
      });
    });
  }

  // Make the sidebar responsive
  makeSidebarResponsive();

  // Set up back to site button
  const backToSiteBtn = document.getElementById('back-to-site');
  if (backToSiteBtn) {
    backToSiteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToMainSite();
    });
  }

  // Update any absolute URLs to use relative paths
  const updateRelativePaths = () => {
    // Update image sources
    document.querySelectorAll('img[src^="/"]').forEach(img => {
      img.src = getAdjustedPath(img.src);
    });

    // Update links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      link.href = getAdjustedPath(link.href);
    });

    // Handle any iframe sources
    document.querySelectorAll('iframe[src^="/"]').forEach(iframe => {
      iframe.src = getAdjustedPath(iframe.src);
    });
  };

  // Adjust paths after content loads
  setTimeout(updateRelativePaths, 1000);
});

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
    const targetSection = document.getElementById(sectionId);
    
    if (targetSection) {
      targetSection.classList.add('active');
        
        // Update page title
      const pageTitle = this.querySelector('span')?.textContent || 'Dashboard';
      const pageTitleElement = document.getElementById('page-title');
      if (pageTitleElement) pageTitleElement.textContent = pageTitle;
      
      // If dashboard section is selected, refresh the activity feed
      if (sectionId === 'dashboard-section') {
        loadRecentActivity();
      }
      
      // Scroll to top on mobile
      if (isMobile) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }
    });
});

// Load recent activity for the dashboard
function loadRecentActivity(limit = 10) {
  console.log('Loading recent activity...');
  const activityFeed = document.getElementById('activity-feed');
  const loadingIndicator = document.getElementById('activity-feed-loading');
  
  if (!activityFeed) return;
  
  // Initialize activity feed
  activityFeed.innerHTML = '';
  if (loadingIndicator) loadingIndicator.style.display = 'block';
  
  // Create an array to hold all activity items
  const allActivities = [];
  
  // Get purchase requests (most recent first)
  const purchasesPromise = firebase.database().ref('purchases')
    .orderByChild('timestamp')
    .limitToLast(30) // Increased limit to capture more activities
    .once('value')
    .then(snapshot => {
      const purchases = [];
      snapshot.forEach(childSnapshot => {
        const purchase = childSnapshot.val();
        
        // Basic purchase activity
        let activityTitle = `New purchase request: ${purchase.itemName || 'Item'}`;
        let activityIcon = 'fa-shopping-cart';
        let activityClass = 'activity-purchase';
        
        // Check if status exists and is not 'pending'
        if (purchase.status && purchase.status !== 'pending') {
          if (purchase.status === 'completed') {
            activityTitle = `Completed purchase: ${purchase.itemName || 'Item'}`;
            activityIcon = 'fa-check-circle';
            activityClass = 'activity-completed';
          } else if (purchase.status === 'rejected') {
            activityTitle = `Rejected purchase: ${purchase.itemName || 'Item'}`;
            activityIcon = 'fa-times-circle';
            activityClass = 'activity-rejected';
          }
        }
        
        purchases.push({
          id: childSnapshot.key,
          type: 'purchase',
          title: activityTitle,
          description: `${purchase.username || 'User'} requested ${purchase.itemName || 'an item'} for ${purchase.itemPrice || 'N/A'}`,
          timestamp: purchase.timestamp || Date.now(),
          icon: activityIcon,
          iconClass: activityClass,
          data: purchase,
          status: purchase.status || 'pending'
        });
      });
      return purchases;
    });
  
  // Get product additions/updates (most recent rank changes)
  const ranksPromise = firebase.database().ref('shop/ranks')
    .limitToLast(10) // Increased limit
    .once('value')
    .then(snapshot => {
      const ranks = [];
      snapshot.forEach(childSnapshot => {
        const rank = childSnapshot.val();
        ranks.push({
          id: childSnapshot.key,
          type: 'product',
          title: `Rank product: ${rank.name || 'Unnamed rank'}`,
          description: `${rank.name || 'A rank'} is available for ${rank.price || 'N/A'}`,
          // Since Firebase doesn't store timestamps for all entries by default,
          // we'll use a recent timestamp but slightly older than purchases
          timestamp: Date.now() - (Math.random() * 24 * 60 * 60 * 1000), // Random time within last day
          icon: 'fa-crown',
          iconClass: 'activity-product',
          data: rank
        });
      });
      return ranks;
    });
  
  // Get gem product activity
  const gemsPromise = firebase.database().ref('shop/gems')
    .limitToLast(10) // Increased limit
    .once('value')
    .then(snapshot => {
      const gems = [];
      snapshot.forEach(childSnapshot => {
        const gem = childSnapshot.val();
        gems.push({
          id: childSnapshot.key,
          type: 'product',
          title: `Gem product: ${gem.name || (gem.amount + ' Gems') || 'Gems'}`,
          description: `${gem.name || (gem.amount + ' Gems') || 'Gems'} are available for ${gem.price || 'N/A'}`,
          timestamp: Date.now() - (Math.random() * 48 * 60 * 60 * 1000), // Random time within last 2 days
          icon: 'fa-gem',
          iconClass: 'activity-product',
          data: gem
        });
      });
      return gems;
    });
    
  // Get vote site activity
  const votesPromise = firebase.database().ref('voteSites')
    .limitToLast(5)
    .once('value')
    .then(snapshot => {
      const votes = [];
      snapshot.forEach(childSnapshot => {
        const vote = childSnapshot.val();
        votes.push({
          id: childSnapshot.key,
          type: 'vote',
          title: `Vote site: ${vote.name || 'Unnamed site'}`,
          description: `Vote site ${vote.name || 'Unnamed'} is available`,
          timestamp: Date.now() - (Math.random() * 72 * 60 * 60 * 1000), // Random time within last 3 days
          icon: 'fa-check-square',
          iconClass: 'activity-vote',
          data: vote
        });
      });
      return votes;
    });
    
  // Add deletion events from localStorage if available
  const deletionPromise = new Promise(resolve => {
    const deletions = [];
    try {
      // Try to retrieve deletion history from localStorage
      const deletionHistory = JSON.parse(localStorage.getItem('deletionHistory') || '[]');
      deletionHistory.forEach(deletion => {
        deletions.push({
          id: deletion.id || 'unknown',
          type: 'deletion',
          title: `Deleted ${deletion.category || 'item'}: ${deletion.name || 'Unknown item'}`,
          description: `${deletion.category || 'Item'} was deleted from the system`,
          timestamp: deletion.timestamp || Date.now(),
          icon: 'fa-trash-alt',
          iconClass: 'activity-error',
          data: deletion
        });
      });
    } catch (e) {
      console.error('Error loading deletion history:', e);
    }
    resolve(deletions);
  });
  
  // Combine all promises to get all activity
  Promise.all([purchasesPromise, ranksPromise, gemsPromise, votesPromise, deletionPromise])
    .then(([purchases, ranks, gems, votes, deletions]) => {
      // Combine all activities
      const allActivities = [...purchases, ...ranks, ...gems, ...votes, ...deletions];
      
      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => b.timestamp - a.timestamp);
      
      // Limit to the specified number
      const limitedActivities = allActivities.slice(0, limit);
      
      // Hide loading indicator
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      
      // If no activities found
      if (limitedActivities.length === 0) {
        activityFeed.innerHTML = '<div class="text-center p-4">No recent activity found</div>';
        return;
      }
      
      // Render activities
      limitedActivities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Add status class if applicable
        if (activity.status) {
          activityItem.classList.add(`status-${activity.status}`);
        }
        
        // Format the timestamp
        const activityDate = new Date(activity.timestamp);
        const formattedDate = activityDate.toLocaleDateString();
        const formattedTime = activityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Create HTML content
        activityItem.innerHTML = `
          <div class="activity-icon ${activity.iconClass || ''}">
            <i class="fas ${activity.icon}"></i>
          </div>
          <div class="activity-content">
            <div class="activity-title">${activity.title}</div>
            <div class="activity-desc">${activity.description}</div>
            <div class="activity-time">${formattedDate} at ${formattedTime}</div>
            ${activity.type === 'purchase' ? 
              `<div class="activity-actions">
                <button class="btn btn-sm btn-primary view-activity" data-id="${activity.id}" data-type="${activity.type}">
                  <i class="fas fa-eye"></i> View Details
                </button>
              </div>` 
            : ''}
          </div>
        `;
        
        activityFeed.appendChild(activityItem);
      });
      
      // Add event listeners to view buttons
      document.querySelectorAll('.view-activity').forEach(btn => {
        btn.addEventListener('click', function() {
          const id = this.getAttribute('data-id');
          const type = this.getAttribute('data-type');
          
          if (type === 'purchase') {
            // Find the request section link and click it
            const requestLink = document.querySelector('.nav-link[data-section="request"]');
            if (requestLink) {
              requestLink.click();
              // After a short delay, view the details of this request
              setTimeout(() => {
                viewRequestDetails(id);
              }, 500);
            }
          }
        });
      });
      
      // Add click event for "Load More" button
      const loadMoreBtn = document.getElementById('load-more-activity');
      if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
          loadRecentActivity(limit + 10);
        });
      }
    })
    .catch(error => {
      console.error('Error loading activity feed:', error);
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      activityFeed.innerHTML = '<div class="text-center p-4">Error loading activity feed</div>';
    });
}

// Function specifically for adding/editing rank products
function saveRankProduct(name, imageUrl, price, popular, description, perks, productId = null) {
  console.log('saveRankProduct called with:', { name, imageUrl, price, popular, description, perks, productId });
  
  if (!name || !price) {
    showNotification('Name and price are required for rank products', 'error');
    return Promise.reject(new Error('Name and price are required'));
  }
  
  const rankProduct = {
    name: name,
    image: imageUrl || getDefaultImage('ranks'),
    price: `৳${parseFloat(price).toFixed(2)}`,
    popular: popular === true || popular === 'true',
    description: description || ''
  };
  
  if (perks) {
    rankProduct.perks = perks;
  }
  
  console.log('Rank product data to save:', rankProduct);
  
  let savePromise;
  const path = 'shop/ranks';
  
  try {
    if (productId) {
      console.log('Updating existing rank with ID:', productId);
      savePromise = firebase.database().ref(`${path}/${productId}`).update(rankProduct);
    } else {
      console.log('Creating new rank');
      const newRef = firebase.database().ref(path).push();
      savePromise = newRef.set(rankProduct);
    }
    
    return savePromise
      .then(() => {
        console.log('Rank product saved successfully');
        showNotification('Rank product saved successfully!', 'success');
        return true;
      })
      .catch((error) => {
        console.error('Error saving rank product to Firebase:', error);
        showNotification('Error: ' + (error.message || 'Failed to save rank product'), 'error');
        throw error;
      });
  } catch (error) {
    console.error('Exception while trying to save rank product:', error);
    showNotification('Error: ' + (error.message || 'Failed to save rank product'), 'error');
    return Promise.reject(error);
  }
}

// Function specifically for adding/editing gem products
function saveGemProduct(name, imageUrl, price, popular, amount, productId = null) {
  console.log('saveGemProduct called with:', { name, imageUrl, price, popular, amount, productId });
  
  if (!name || !price) {
    showNotification('Name and price are required for gem products', 'error');
    return Promise.reject(new Error('Name and price are required'));
  }
  
  const gemProduct = {
    name: name,
    image: imageUrl || getDefaultImage('gems'),
    price: `৳${parseFloat(price).toFixed(2)}`,
    popular: popular === true || popular === 'true'
  };
  
  if (amount) {
    gemProduct.amount = parseInt(amount);
  }
  
  console.log('Gem product data to save:', gemProduct);
  
  let savePromise;
  const path = 'shop/gems';
  
  try {
    if (productId) {
      console.log('Updating existing gem with ID:', productId);
      savePromise = firebase.database().ref(`${path}/${productId}`).update(gemProduct);
    } else {
      console.log('Creating new gem');
      const newRef = firebase.database().ref(path).push();
      savePromise = newRef.set(gemProduct);
    }
    
    return savePromise
      .then(() => {
        console.log('Gem product saved successfully');
        showNotification('Gem product saved successfully!', 'success');
        return true;
      })
      .catch((error) => {
        console.error('Error saving gem product to Firebase:', error);
        showNotification('Error: ' + (error.message || 'Failed to save gem product'), 'error');
        throw error;
      });
  } catch (error) {
    console.error('Exception while trying to save gem product:', error);
    showNotification('Error: ' + (error.message || 'Failed to save gem product'), 'error');
    return Promise.reject(error);
  }
}

// Mobile navigation enhancements
function enhanceMobileNavigation() {
  const isMobileView = window.innerWidth <= 992;
  
  if (isMobileView) {
    // Center active nav item in mobile view
    const activeNavLink = document.querySelector('.nav-link.active');
    if (activeNavLink) {
      // Wait for rendering to complete
      setTimeout(() => {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
          const navItem = activeNavLink.closest('.nav-item');
          if (navItem) {
            const navItemLeft = navItem.offsetLeft;
            const navMenuWidth = navMenu.offsetWidth;
            const navItemWidth = navItem.offsetWidth;
            
            // Center the active item
            navMenu.scrollLeft = navItemLeft - (navMenuWidth / 2) + (navItemWidth / 2);
          }
        }
      }, 100);
    }
  }
}

// Function to make the sidebar responsive
function makeSidebarResponsive() {
  const isMobileView = window.innerWidth <= 992;
  const isSmallMobile = window.innerWidth <= 576;
  const isVerySmallMobile = window.innerWidth <= 360;
  const sidebar = document.querySelector('.sidebar');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (!sidebar || !navMenu) return;
  
  if (isMobileView) {
    // Make sidebar fixed at the top
    sidebar.style.position = 'sticky';
    sidebar.style.top = '0';
    sidebar.style.zIndex = '1001';
    sidebar.style.width = '100%';
    sidebar.style.height = 'auto';
    sidebar.style.minHeight = 'unset';
    sidebar.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    
    // Set up the nav menu for horizontal scrolling
    navMenu.style.display = 'flex';
    navMenu.style.overflowX = 'auto';
    navMenu.style.whiteSpace = 'nowrap';
    navMenu.style.padding = isSmallMobile ? '5px' : '8px';
    navMenu.style.margin = '0';
    navMenu.style.justifyContent = isSmallMobile ? 'space-around' : 'center';
    
    // Remove scrollbar
    navMenu.style.scrollbarWidth = 'none';
    navMenu.style.msOverflowStyle = 'none';
    
    // Fix nav links for mobile
    navLinks.forEach(link => {
      link.style.flexDirection = 'column';
      link.style.alignItems = 'center';
      link.style.justifyContent = 'center';
      
      if (isVerySmallMobile) {
        link.style.padding = '6px 8px';
        link.style.minWidth = '65px';
      } else if (isSmallMobile) {
        link.style.padding = '8px 10px';
        link.style.minWidth = '70px';
      } else {
        link.style.padding = '10px 15px';
        link.style.minWidth = '85px';
      }
      
      link.style.borderRadius = '8px';
      link.style.transition = 'all 0.2s';
      
      // Icon styling
      const icon = link.querySelector('i');
      if (icon) {
        icon.style.marginRight = '0';
        icon.style.marginBottom = isSmallMobile ? '3px' : '5px';
        icon.style.fontSize = isVerySmallMobile ? '15px' : (isSmallMobile ? '16px' : '18px');
      }
      
      // Text styling
      const span = link.querySelector('span');
      if (span) {
        span.style.fontSize = isVerySmallMobile ? '10px' : (isSmallMobile ? '11px' : '13px');
        span.style.textAlign = 'center';
      }
    });
    
    // Add hover/active effects
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      });
      
      link.addEventListener('mouseleave', function() {
        if (!this.classList.contains('active')) {
          this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
          this.style.transform = 'none';
          this.style.boxShadow = 'none';
        }
      });
      
      if (link.classList.contains('active')) {
        link.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
        link.style.transform = 'translateY(-2px)';
        link.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      } else {
        link.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
      }
    });
    
    // Center active nav item
    const activeNavLink = document.querySelector('.nav-link.active');
    if (activeNavLink) {
      setTimeout(() => {
        const navItem = activeNavLink.closest('.nav-item');
        if (navItem) {
          const navItemLeft = navItem.offsetLeft;
          const navMenuWidth = navMenu.offsetWidth;
          const navItemWidth = navItem.offsetWidth;
          
          navMenu.scrollLeft = navItemLeft - (navMenuWidth / 2) + (navItemWidth / 2);
        }
      }, 100);
    }
    
    // Hide sidebar header on mobile
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
      sidebarHeader.style.display = 'none';
    }
  } else {
    // Reset styles for desktop
    sidebar.style = '';
    navMenu.style = '';
    
    // Reset nav links
    navLinks.forEach(link => {
      link.style = '';
      
      const icon = link.querySelector('i');
      if (icon) {
        icon.style = '';
      }
      
      const span = link.querySelector('span');
      if (span) {
        span.style = '';
      }
      
      // Remove event listeners (proper way would use named functions)
      link.onmouseenter = null;
      link.onmouseleave = null;
    });
    
    // Show sidebar header
    const sidebarHeader = document.querySelector('.sidebar-header');
    if (sidebarHeader) {
      sidebarHeader.style.display = 'block';
    }
  }
}

// Run on window resize
window.addEventListener('resize', debounce(function() {
  makeSidebarResponsive();
}, 250));

// Run when navigation occurs
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function() {
    setTimeout(makeSidebarResponsive, 50);
  });
});

// GitHub Pages Compatibility
document.addEventListener('DOMContentLoaded', function() {
  // Set up back to site button
  const backToSiteBtn = document.getElementById('back-to-site');
  if (backToSiteBtn) {
    backToSiteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      navigateToMainSite();
    });
  }

  // Update any absolute URLs to use relative paths
  const updateRelativePaths = () => {
    // Update image sources
    document.querySelectorAll('img[src^="/"]').forEach(img => {
      img.src = getAdjustedPath(img.src);
    });

    // Update links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      link.href = getAdjustedPath(link.href);
    });

    // Handle any iframe sources
    document.querySelectorAll('iframe[src^="/"]').forEach(iframe => {
      iframe.src = getAdjustedPath(iframe.src);
    });
  };

  // Adjust paths after content loads
  setTimeout(updateRelativePaths, 1000);
});
