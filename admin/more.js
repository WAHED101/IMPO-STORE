let requestsRef = database.ref('purchases');

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;

// Function to format timestamp
function formatTimestamp(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
}

// Function to render requests
function renderRequests(requests) {
  const tbody = document.getElementById('requests-body');
  tbody.innerHTML = '';
  
  if (requests.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No requests found</td></tr>';
    return;
  }
  
  requests.forEach((request, index) => {
    const tr = document.createElement('tr');
    
    // Normalize the status - default to 'pending' if missing
    const status = (request.status || 'pending').toLowerCase();
    
    const statusClass = {
      'pending': 'warning',
      'completed': 'success',
      'rejected': 'danger'
    }[status] || 'secondary';
    
    // Format the status for display (capitalize first letter)
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    
    tr.innerHTML = `
  <td>${request.key.substring(0, 8)}</td>
  <td>${request.username || 'N/A'}</td>
  <td>${request.discord|| 'N/A'}</td>
  <td>${request.itemName || 'N/A'}</td>
  <td>${request.itemPrice || 'N/A'}</td>
  <td>${request.paymentMethod ? request.paymentMethod.charAt(0).toUpperCase() + request.paymentMethod.slice(1) : 'N/A'}</td>
  <td>${formatTimestamp(request.timestamp)}</td>
  <td>
    <span class="badge badge-${statusClass}">
          ${displayStatus}
    </span>
  </td>
      <td class="actions-cell">
        <button class="btn btn-primary btn-sm btn-view" data-id="${request.key}" title="View Details">
      <i class="fas fa-eye"></i>
    </button>
        <button class="btn btn-success btn-sm btn-complete" data-id="${request.key}" ${status === 'completed' ? 'disabled' : ''} title="Mark Completed">
      <i class="fas fa-check"></i>
    </button>
        <button class="btn btn-danger btn-sm btn-reject" data-id="${request.key}" ${status === 'rejected' ? 'disabled' : ''} title="Reject">
      <i class="fas fa-times"></i>
    </button>
        <button class="btn btn-dark btn-sm btn-delete" data-id="${request.key}" title="Delete">
      <i class="fas fa-trash"></i>
    </button>
  </td>
`;
    tbody.appendChild(tr);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteRequest(btn.dataset.id));
  });

  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => viewRequestDetails(btn.dataset.id));
  });
  
  document.querySelectorAll('.btn-complete').forEach(btn => {
    btn.addEventListener('click', () => updateRequestStatus(btn.dataset.id, 'completed'));
  });
  
  document.querySelectorAll('.btn-reject').forEach(btn => {
    btn.addEventListener('click', () => updateRequestStatus(btn.dataset.id, 'rejected'));
  });
}

function handleDeleteRequest(requestId) {
  const confirmDelete = confirm('Are you sure you want to delete this request? This action cannot be undone.');
  
  if (confirmDelete) {
    const requestRef = firebase.database().ref(`purchases/${requestId}`);
    
    requestRef.remove()
      .then(() => {
        showNotification('Request deleted successfully', 'success');
        // Refresh the requests list
        fetchRequests(currentPage);
      })
      .catch((error) => {
        console.error('Error deleting request:', error);
        showNotification('Failed to delete request', 'error');
      });
  }
}

// Function to show notifications
function showNotification(message, type = 'info') {
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

// Function to fetch requests with pagination
function fetchRequests(page = 1) {
  requestsRef.once('value').then(snapshot => {
    const allRequests = [];
    snapshot.forEach(childSnapshot => {
      allRequests.push({
        key: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Apply filters
    let filteredRequests = [...allRequests];
    const statusFilter = document.getElementById('status-filter').value;
    const searchQuery = document.getElementById('search-requests').value.toLowerCase();
    
    console.log('Status filter value:', statusFilter);
    console.log('All requests:', allRequests);
    
    if (statusFilter !== 'all') {
      filteredRequests = filteredRequests.filter(req => {
        // Check for various status formats (case insensitive, or missing status which defaults to pending)
        const reqStatus = (req.status || 'pending').toLowerCase();
        console.log(`Request ${req.key} status: "${reqStatus}", comparing to filter: "${statusFilter}"`);
        return reqStatus === statusFilter.toLowerCase();
      });
    }
    
    if (searchQuery) {
      filteredRequests = filteredRequests.filter(req => 
        (req.username && req.username.toLowerCase().includes(searchQuery)) ||
        (req.discord && req.discord.toLowerCase().includes(searchQuery)) ||
        (req.itemName && req.itemName.toLowerCase().includes(searchQuery))
      );
    }
    
    console.log('Filtered requests:', filteredRequests);
    
    // Sort by timestamp (newest first)
    filteredRequests.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Pagination
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);
    
    renderRequests(paginatedRequests);
    
    // Update pagination controls
    document.getElementById('page-info').textContent = `Page ${page} of ${totalPages || 1}`;
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === totalPages || totalPages === 0;
    
    currentPage = page;
  });
}

// Function to view request details
function viewRequestDetails(requestId) {
  requestsRef.child(requestId).once('value').then(snapshot => {
    const request = snapshot.val();
    
    // Normalize the status - default to 'pending' if missing
    const status = (request.status || 'pending').toLowerCase();
    
    // Display details in a modal
    const detailsModal = document.getElementById('request-details-modal');
    const detailsContent = document.getElementById('request-details-content');
    
    if (detailsModal && detailsContent) {
      // Format the details
      let details = `
        <h3>Purchase Request Details</h3>
        <div class="details-grid">
          <div class="detail-item">
            <strong>ID:</strong> ${requestId.substring(0, 8)}...
          </div>
          <div class="detail-item">
            <strong>Status:</strong> 
            <span class="badge badge-${status === 'completed' ? 'success' : status === 'rejected' ? 'danger' : 'warning'}">
              ${status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          <div class="detail-item">
            <strong>Minecraft Username:</strong> ${request.username || 'N/A'}
          </div>
          <div class="detail-item">
            <strong>Discord:</strong> ${request.discord || 'N/A'}
          </div>
          <div class="detail-item">
            <strong>Phone:</strong> ${request.phone || 'N/A'}
          </div>
          <div class="detail-item">
            <strong>Item:</strong> ${request.itemName || 'N/A'}
          </div>
          <div class="detail-item">
            <strong>Price:</strong> ${request.itemPrice || 'N/A'}
          </div>
          <div class="detail-item">
            <strong>Payment Method:</strong> ${request.paymentMethod || 'N/A'}
          </div>
          <div class="detail-item">
            <strong>Date:</strong> ${formatTimestamp(request.timestamp)}
          </div>
        </div>
        
        <div class="request-actions">
          <button class="btn btn-success btn-complete-detail" data-id="${requestId}" ${status === 'completed' ? 'disabled' : ''}>
            Mark as Completed
          </button>
          <button class="btn btn-danger btn-reject-detail" data-id="${requestId}" ${status === 'rejected' ? 'disabled' : ''}>
            Reject Request
          </button>
        </div>
      `;
      
      detailsContent.innerHTML = details;
      detailsModal.style.display = 'block';
      
      // Add event listeners for action buttons
      document.querySelector('.btn-complete-detail').addEventListener('click', () => {
        updateRequestStatus(requestId, 'completed');
        detailsModal.style.display = 'none';
      });
      
      document.querySelector('.btn-reject-detail').addEventListener('click', () => {
        updateRequestStatus(requestId, 'rejected');
        detailsModal.style.display = 'none';
      });
      
      // Close modal button
      document.querySelector('.close-details-modal').addEventListener('click', () => {
        detailsModal.style.display = 'none';
      });
      
      // Close on outside click
      window.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
          detailsModal.style.display = 'none';
        }
      });
    } else {
      // Fallback to alert if modal not available
    const details = `
      Minecraft Username: ${request.username || 'N/A'}
      Discord: ${request.discord || 'N/A'}
      Phone: ${request.phone || 'N/A'}
      Item: ${request.itemName || 'N/A'}
      Price: ${request.itemPrice || 'N/A'}
      Payment Method: ${request.paymentMethod || 'N/A'}
        Status: ${status.charAt(0).toUpperCase() + status.slice(1)}
      Date: ${formatTimestamp(request.timestamp)}
    `;
    
    alert(details.replace(/      /g, '\n'));
    }
  });
}

// Function to update request status
function updateRequestStatus(requestId, status) {
  if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;
  
  requestsRef.child(requestId).update({ status })
    .then(() => {
      showNotification(`Request marked as ${status}`, 'success');
      fetchRequests(currentPage);
    })
    .catch(error => {
      console.error('Error updating request:', error);
      showNotification('Failed to update request status', 'error');
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded in more.js - initializing purchase requests');
  
  // Load initial requests
  fetchRequests();
  
  // We'll handle these event listeners in the consolidated initialization at the bottom
  // No need for duplicate event listeners here
});

// Products - Ranklist
const ranklistRef = database.ref('shop/ranks');

// Function to delete a rank
function deleteItem1(key) {
  deleteProduct(key, 'ranks');
}

// Fetch ranks data
ranklistRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('gemTableBody');
    tableBody.innerHTML = ''; // Clear existing data
    
    if (!data) {
    document.getElementById('loading-ranks').textContent = 'No rank products found';
        return;
    }

  document.getElementById('loading-ranks').style.display = 'none';
    
    // Iterate through each item
    Object.keys(data).forEach(key => {
        const item = data[key];
        
    // Only display items that have price information
        if (item.price) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
        <td>${item.id || key.substring(0, 6)}</td>
                <td>${item.name || 'N/A'}</td>
                <td>${item.description || 'N/A'}</td>
        <td>${item.image ? `<img src="${item.image}" alt="${item.name || 'Rank'}" style="max-width: 60px; max-height: 60px;">` : 'N/A'}</td>
                <td>${item.price || 'N/A'}</td>
                <td>${item.popular ? 'Yes' : 'No'}</td>
        <td class="actions-cell">
          <button class="btn btn-primary btn-sm" onclick="editProduct('${key}', 'ranks')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem1('${key}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
            `;
            
            tableBody.appendChild(row);
        }
    });
    
    if (tableBody.children.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">No rank items found</td></tr>';
    }
}, (error) => {
    console.error('Error fetching data:', error);
  document.getElementById('loading-ranks').textContent = 'Error loading data';
});

// Products - Gems
const gems = database.ref('shop/gems');

// Function to delete a gem
function deleteItem(key) {
  deleteProduct(key, 'gems');
}

// Fetch gems data
gems.on('value', (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('gems');
    tableBody.innerHTML = ''; // Clear existing data
    
    if (!data) {
    document.getElementById('loading-gems').textContent = 'No gem products found';
        return;
    }

  document.getElementById('loading-gems').style.display = 'none';
    
    // Iterate through each item
    Object.keys(data).forEach(key => {
        const item = data[key];
        
    // Only display items that have price information
        if (item.price) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
        <td>${item.name || 'N/A'}</td>
        <td>${item.image ? `<img src="${item.image}" alt="${item.name || 'Gem'}" style="max-width: 60px; max-height: 60px;">` : 'N/A'}</td>
                <td>${item.price || 'N/A'}</td>
                <td>${item.popular ? 'Yes' : 'No'}</td>
        <td class="actions-cell">
          <button class="btn btn-primary btn-sm" onclick="editProduct('${key}', 'gems')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteItem('${key}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </td>
            `;
            
            tableBody.appendChild(row);
        }
    });
    
    if (tableBody.children.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5">No gem items found</td></tr>';
    }
}, (error) => {
    console.error('Error fetching data:', error);
  document.getElementById('loading-gems').textContent = 'Error loading data';
});

// Products - Vote Sites
const votes = database.ref('voteSites');

// Function to delete a vote site
function deleteItem4(key) {
  if (confirm('Are you sure you want to delete this vote site?')) {
    deleteProduct(key, 'voteSites');
  }
}

// Fetch vote sites data
votes.on('value', (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('votes');
    tableBody.innerHTML = ''; // Clear existing data
    
    if (!data) {
    document.getElementById('loading-votes').textContent = 'No vote sites found';
        return;
    }

  document.getElementById('loading-votes').style.display = 'none';
    
    // Iterate through each item
    Object.keys(data).forEach(key => {
        const item = data[key];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.name || 'N/A'}</td>
      <td>${item.image ? `<img src="${item.image}" alt="${item.name || 'Vote Site'}" style="max-width: 60px; max-height: 60px;">` : 'N/A'}</td>
      <td>${item.url ? `<a href="${item.url}" target="_blank">${item.url.substring(0, 30)}...</a>` : 'N/A'}</td>
      <td class="actions-cell">
        <button class="btn btn-primary btn-sm" onclick="editProduct('${key}', 'voteSites')" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteItem4('${key}')" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    if (tableBody.children.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">No vote sites found</td></tr>';
    }
}, (error) => {
    console.error('Error fetching data:', error);
  document.getElementById('loading-votes').textContent = 'Error loading data';
});

// Load product data
function loadProductTables() {
  console.log('Loading product tables...');
  
  // Show loading indicators
  const loadingRanks = document.getElementById('loading-ranks');
  const loadingGems = document.getElementById('loading-gems');
  const loadingVotes = document.getElementById('loading-votes');
  
  if (loadingRanks) loadingRanks.style.display = 'block';
  if (loadingGems) loadingGems.style.display = 'block';
  if (loadingVotes) loadingVotes.style.display = 'block';
  
  // References to Firebase paths
  const ranksRef = firebase.database().ref('shop/ranks');
  const gemsRef = firebase.database().ref('shop/gems');
  const votesRef = firebase.database().ref('voteSites');
  
  // Load ranks
  ranksRef.once('value').then(snapshot => {
    const rankData = snapshot.val();
    const rankTableBody = document.getElementById('gemTableBody');
    const loadingIndicator = document.getElementById('loading-ranks');
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    if (rankTableBody) {
      if (!rankData) {
        rankTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No ranks found</td></tr>';
        return;
      }
      
      rankTableBody.innerHTML = '';
      
      // Convert to array if needed
      const ranks = typeof rankData === 'object' ? Object.keys(rankData).map(key => ({
        key,
        ...rankData[key]
      })) : [];
      
      // Populate table
      ranks.forEach(rank => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${rank.key.substring(0, 8)}</td>
          <td>${rank.name || 'N/A'}</td>
          <td>${rank.description || 'N/A'}</td>
          <td><img src="${rank.image || '../IMG/rank1.png'}" alt="${rank.name}" style="width: 50px; height: 50px;"></td>
          <td>${rank.price || 'N/A'}</td>
          <td>${rank.popular ? 'Yes' : 'No'}</td>
          <td class="actions-cell">
            <button class="btn btn-primary btn-sm" onclick="editProduct('${rank.key}', 'ranks')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${rank.key}', 'ranks')" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        rankTableBody.appendChild(tr);
      });
      
      console.log('Loaded', ranks.length, 'ranks');
    }
  }).catch(error => {
    console.error('Error loading ranks:', error);
    showNotification('Failed to load ranks', 'error');
  });
  
  // Load gems
  gemsRef.once('value').then(snapshot => {
    const gemData = snapshot.val();
    const gemTableBody = document.getElementById('gems');
    const loadingIndicator = document.getElementById('loading-gems');
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    if (gemTableBody) {
      if (!gemData) {
        gemTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No gems found</td></tr>';
        return;
      }
      
      gemTableBody.innerHTML = '';
      
      // Convert to array if needed
      const gems = typeof gemData === 'object' ? Object.keys(gemData).map(key => ({
        key,
        ...gemData[key]
      })) : [];
      
      // Populate table
      gems.forEach(gem => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${gem.name || `${gem.amount || 0} Gems`}</td>
          <td><img src="${gem.image || '../IMG/gem1.png'}" alt="${gem.name}" style="width: 50px; height: 50px;"></td>
          <td>${gem.price || 'N/A'}</td>
          <td>${gem.popular ? 'Yes' : 'No'}</td>
          <td class="actions-cell">
            <button class="btn btn-primary btn-sm" onclick="editProduct('${gem.key}', 'gems')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${gem.key}', 'gems')" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        gemTableBody.appendChild(tr);
      });
      
      console.log('Loaded', gems.length, 'gems');
    }
  }).catch(error => {
    console.error('Error loading gems:', error);
    showNotification('Failed to load gems', 'error');
  });
  
  // Load vote sites
  votesRef.once('value').then(snapshot => {
    const voteData = snapshot.val();
    const voteTableBody = document.getElementById('votes');
    const loadingIndicator = document.getElementById('loading-votes');
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    if (voteTableBody) {
      if (!voteData) {
        voteTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No vote sites found</td></tr>';
        return;
      }
      
      voteTableBody.innerHTML = '';
      
      // Convert to array if needed
      const votes = typeof voteData === 'object' ? Object.keys(voteData).map(key => ({
        key,
        ...voteData[key]
      })) : [];
      
      // Populate table
      votes.forEach(vote => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${vote.name || 'N/A'}</td>
          <td><img src="${vote.image || '../IMG/vote1.png'}" alt="${vote.name}" style="width: 50px; height: 50px;"></td>
          <td><a href="${vote.url || '#'}" target="_blank">${vote.url || 'N/A'}</a></td>
          <td class="actions-cell">
            <button class="btn btn-primary btn-sm" onclick="editProduct('${vote.key}', 'voteSites')" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteProduct('${vote.key}', 'voteSites')" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        voteTableBody.appendChild(tr);
      });
      
      console.log('Loaded', votes.length, 'vote sites');
    }
  }).catch(error => {
    console.error('Error loading vote sites:', error);
    showNotification('Failed to load vote sites', 'error');
  });
}

// Initialize the admin panel when the document is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing admin panel from more.js');
  
  // Initial fetch of requests
  fetchRequests(1);
  
  // Load product tables
  loadProductTables();
  
  // Add event listeners for pagination controls
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        fetchRequests(currentPage - 1);
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      fetchRequests(currentPage + 1);
    });
  }
  
  // Add event listeners for search and filter
  const searchInput = document.getElementById('search-requests');
  const statusFilter = document.getElementById('status-filter');
  
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      fetchRequests(1);
    }, 300));
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      fetchRequests(1);
    });
  }
});

// Debounce function (if not already defined in script.js)
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}