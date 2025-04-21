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
    const statusClass = {
      'pending': 'warning',
      'completed': 'success',
      'rejected': 'danger'
    }[request.status] || 'secondary';
    
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
      ${request.status ? request.status.charAt(0).toUpperCase() + request.status.slice(1) : 'Pending'}
    </span>
  </td>
  <td>
    <button class="btn btn-primary btn-view" data-id="${request.key}">
      <i class="fas fa-eye"></i>
    </button>
    <button class="btn btn-success btn-complete" data-id="${request.key}" ${request.status === 'completed' ? 'disabled' : ''}>
      <i class="fas fa-check"></i>
    </button>
    <button class="btn btn-danger btn-reject" data-id="${request.key}" ${request.status === 'rejected' ? 'disabled' : ''}>
      <i class="fas fa-times"></i>
    </button>
    <button class="btn btn-dark btn-delete" data-id="${request.key}">
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
        // Refresh the page after 1 second
        location.reload();
      })
      .catch((error) => {
        console.error('Error deleting request:', error);
        showNotification('Failed to delete request', 'error');
      });
  }
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
    
    if (statusFilter !== 'all') {
      filteredRequests = filteredRequests.filter(req => req.status === statusFilter);
    }
    
    if (searchQuery) {
      filteredRequests = filteredRequests.filter(req => 
        (req.minecraftUsername && req.minecraftUsername.toLowerCase().includes(searchQuery)) ||
        (req.discordUsername && req.discordUsername.toLowerCase().includes(searchQuery)) ||
        (req.itemName && req.itemName.toLowerCase().includes(searchQuery))
      );
    }
    
    // Sort by timestamp (newest first)
    filteredRequests.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    
    // Pagination
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const paginatedRequests = filteredRequests.slice(startIndex, startIndex + itemsPerPage);
    
    renderRequests(paginatedRequests);
    
    // Update pagination controls
    document.getElementById('page-info').textContent = `Page ${page} of ${totalPages}`;
    document.getElementById('prev-page').disabled = page === 1;
    document.getElementById('next-page').disabled = page === totalPages;
    
    currentPage = page;
  });
}

// Function to view request details
function viewRequestDetails(requestId) {
  requestsRef.child(requestId).once('value').then(snapshot => {
    const request = snapshot.val();
    
    // Show details in a modal or alert
    const details = `
      Minecraft Username: ${request.username || 'N/A'}
      Discord: ${request.discord || 'N/A'}
      Phone: ${request.phone || 'N/A'}
      Item: ${request.itemName || 'N/A'}
      Price: ${request.itemPrice || 'N/A'}
      Payment Method: ${request.paymentMethod || 'N/A'}
      Status: ${request.status || 'pending'}
      Date: ${formatTimestamp(request.timestamp)}
    `;
    
    alert(details.replace(/      /g, '\n'));
  });
}

// Function to update request status
function updateRequestStatus(requestId, status) {
  if (!confirm(`Are you sure you want to mark this request as ${status}?`)) return;
  
  requestsRef.child(requestId).update({ status })
    .then(() => {
      alert('Request status updated successfully!');
      fetchRequests(currentPage);
    })
    .catch(error => {
      console.error('Error updating request:', error);
      alert('Failed to update request status');
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  // Load initial requests
  fetchRequests();
  
  // Setup event listeners
  document.getElementById('search-requests').addEventListener('input', () => {
    fetchRequests(1);
  });
  
  document.getElementById('status-filter').addEventListener('change', () => {
    fetchRequests(1);
  });
  
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) fetchRequests(currentPage - 1);
  });
  
  document.getElementById('next-page').addEventListener('click', () => {
    fetchRequests(currentPage + 1);
  });
});



const ranklistRef = database.ref('shop/ranks');

// Function to delete an item
function deleteItem1(key) {
    if (confirm('Are you sure you want to delete this item?')) {
        ranklistRef.child(key).remove()
            .then(() => {
                console.log('Item deleted successfully');
            })
            .catch((error) => {
                console.error('Error deleting item:', error);
                alert('Error deleting item');
            });
    }
}

// Fetch data
ranklistRef.on('value', (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('gemTableBody');
    tableBody.innerHTML = ''; // Clear existing data
    
    if (!data) {
        document.getElementById('loading').textContent = 'No data available';
        return;
    }

    document.getElementById('loading').style.display = 'none';
    
    // Iterate through each item
    Object.keys(data).forEach(key => {
        const item = data[key];
        
        // Only display items that have price information (gems)
        if (item.price) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${item.id || 'N/A'}</td>
                <td>${item.name || 'N/A'}</td>
                <td>${item.description || 'N/A'}</td>
                <td>${item.image ? `<img src="${item.image}" alt="${item.name || 'Gem'}">` : 'N/A'}</td>
                <td>${item.price || 'N/A'}</td>
                <td>${item.popular ? 'Yes' : 'No'}</td>
                <td><button class="delete-btn" onclick="deleteItem1('${key}')">Delete</button></td>
            `;
            
            tableBody.appendChild(row);
        }
    });
    
    if (tableBody.children.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No gem items found</td></tr>';
    }
}, (error) => {
    console.error('Error fetching data:', error);
    document.getElementById('loading').textContent = 'Error loading data';
});






const gems = database.ref('shop/gems');

// Function to delete an item
function deleteItem(key) {
    if (confirm('Are you sure you want to delete this item?')) {
        gems.child(key).remove()
            .then(() => {
                console.log('Item deleted successfully');
            })
            .catch((error) => {
                console.error('Error deleting item:', error);
                alert('Error deleting item');
            });
    }
}

// Fetch data
gems.on('value', (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('gems');
    tableBody.innerHTML = ''; // Clear existing data
    
    if (!data) {
        document.getElementById('loading').textContent = 'No data available';
        return;
    }

    document.getElementById('loading').style.display = 'none';
    
    // Iterate through each item
    Object.keys(data).forEach(key => {
        const item = data[key];
        
        // Only display items that have price information (gems)
        if (item.price) {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${item.id || 'N/A'}</td>
                <td>${item.image ? `<img src="${item.image}" alt="${item.name || 'Gem'}">` : 'N/A'}</td>
                <td>${item.price || 'N/A'}</td>
                <td>${item.popular ? 'Yes' : 'No'}</td>
                <td><button class="delete-btn" onclick="deleteItem('${key}')">Delete</button></td>
            `;
            
            tableBody.appendChild(row);
        }
    });
    
    if (tableBody.children.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No gem items found</td></tr>';
    }
}, (error) => {
    console.error('Error fetching data:', error);
    document.getElementById('loading').textContent = 'Error loading data';
});






const votes = database.ref('voteSites');

// Function to delete an item
function deleteItem4(key) {
    if (confirm('Are you sure you want to delete this item?')) {
        votes.child(key).remove()
            .then(() => {
                console.log('Item deleted successfully');
            })
            .catch((error) => {
                console.error('Error deleting item:', error);
                alert('Error deleting item');
            });
    }
}

// Fetch data
votes.on('value', (snapshot) => {
    const data = snapshot.val();
    const tableBody = document.getElementById('votes');
    tableBody.innerHTML = ''; // Clear existing data
    
    if (!data) {
        document.getElementById('loading').textContent = 'No data available';
        return;
    }

    document.getElementById('loading').style.display = 'none';
    
    // Iterate through each item
    Object.keys(data).forEach(key => {
        const item = data[key];
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.name || 'N/A'}</td>
            <td>${item.image ? `<img src="${item.image}" alt="${item.name || 'Item'}" style="max-width: 100px; max-height: 100px;">` : 'N/A'}</td>
            <td>${item.url ? `<a href="${item.url}" target="_blank">Link</a>` : 'N/A'}</td>
            <td><button class="delete-btn" onclick="deleteItem4('${key}')">Delete</button></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    if (tableBody.children.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5">No items found</td></tr>';
    }
}, (error) => {
    console.error('Error fetching data:', error);
    document.getElementById('loading').textContent = 'Error loading data';
});