// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyATm8V-vInYwYR0KPH1Kf06BzjjJ4xeQXU",
    authDomain: "impo-b098d.firebaseapp.com",
    databaseURL: "https://impo-b098d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "impo-b098d",
    storageBucket: "impo-b098d.firebasestorage.app",
    messagingSenderId: "498933533524",
    appId: "1:498933533524:web:aabb9888f4793025a0d6c1",
    measurementId: "G-7DZ2PNKY8N"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Firebase data loading functions
function loadVoteSites() {
    const voteGrid = document.querySelector('.vote-grid');
    const voteRef = database.ref('voteSites');
    
    voteRef.on('value', (snapshot) => {
        const voteSites = snapshot.val();
        voteGrid.innerHTML = '';
        
        if (!voteSites) {
            voteGrid.innerHTML = '<p class="no-data">No vote sites available at the moment.</p>';
            return;
        }
        
        const sitesArray = Array.isArray(voteSites) ? voteSites : Object.values(voteSites);
        
        if (sitesArray.length === 0) {
            voteGrid.innerHTML = '<p class="no-data">No vote sites available at the moment.</p>';
            return;
        }
        
        sitesArray.forEach((site) => {
            const voteCard = document.createElement('div');
            voteCard.className = 'vote-card';
            voteCard.innerHTML = `
                <div class="card-content">
                    <img src="${site.image || 'IMG/default-vote.png'}" alt="${site.name || 'Vote Site'}">
                    <h3>${site.name || 'Vote Site'}</h3>
                </div>
                <button class="btn btn-secondary">
                    <a target="_blank" href="${site.url || '#'}">
                        <i class="fas fa-vote-yea"></i> Vote Now
                    </a>
                </button>
            `;
            voteGrid.appendChild(voteCard);
        });
    }, (error) => {
        voteGrid.innerHTML = '<p class="error">Failed to load vote sites. Please try again later.</p>';
        console.error("Error loading vote sites:", error);
    });
}

function loadShopItems() {
    const shopRef = database.ref('shop');
    
    shopRef.on('value', (snapshot) => {
        const shopData = snapshot.val();
        
        if (!shopData) {
            document.querySelector('.gems-grid').innerHTML = '<p class="no-data">Shop data not available.</p>';
            document.querySelector('.rank-grid').innerHTML = '<p class="no-data">Shop data not available.</p>';
            return;
        }
        
        // Load Gems
        const gemsGrid = document.querySelector('.gems-grid');
        gemsGrid.innerHTML = '';
        
        if (shopData.gems) {
            const gemsArray = Array.isArray(shopData.gems) ? shopData.gems : Object.values(shopData.gems);
            
            gemsArray.forEach((gem) => {
                const gemCard = document.createElement('div');
                gemCard.className = `gem-card ${gem.popular ? 'popular' : ''}`;
                
                if (gem.popular) {
                    gemCard.innerHTML += '<div class="popular-badge">POPULAR</div>';
                }
                
                gemCard.innerHTML += `
                    <div class="card-content">
                        <img src="${gem.image || 'IMG/default-gem.png'}" alt="${gem.amount || '0'} Gems">
                        <h3>${gem.amount || '0'} Gems</h3>
                        <p class="price">${gem.price || '৳0.00'}</p>
                    </div>
                    <button class="btn ${gem.popular ? 'btn-primary' : 'btn-secondary'} purchase-btn" 
                            data-type="gem" data-id="${gem.id || ''}">
                        <i class="fas fa-shopping-cart"></i> Purchase
                    </button>
                `;
                gemsGrid.appendChild(gemCard);
            });
        }
        
        // Load Ranks
        const rankGrid = document.querySelector('.rank-grid');
        rankGrid.innerHTML = '';
        
        if (shopData.ranks) {
            const ranksArray = Array.isArray(shopData.ranks) ? shopData.ranks : Object.values(shopData.ranks);
            
            ranksArray.forEach((rank) => {
                const rankCard = document.createElement('div');
                rankCard.className = `rank-card ${rank.popular ? 'popular' : ''}`;
                
                if (rank.popular) {
                    rankCard.innerHTML += '<div class="popular-badge">POPULAR</div>';
                }
                
                let perksList = '';
                if (rank.perks && rank.perks.length > 0) {
                    perksList = rank.perks.map(perk => `<li>${perk}</li>`).join('');
                }
                
                rankCard.innerHTML += `
                    <div class="card-content">
                        <img src="${rank.image || 'IMG/default-rank.png'}" alt="${rank.name || 'Rank'}">
                        <h3>${rank.name || 'Rank'}</h3>
                        <p class="price">${rank.price || '৳0.00'}</p>
                        ${perksList ? `<ul>${perksList}</ul>` : ''}
                    </div>
                    <button class="btn ${rank.popular ? 'btn-primary' : 'btn-secondary'} purchase-btn" 
                            data-type="rank" data-id="${rank.id || ''}">
                        <i class="fas fa-crown"></i> Purchase
                    </button>
                `;
                rankGrid.appendChild(rankCard);
            });
        }
    }, (error) => {
        console.error("Error loading shop items:", error);
        document.querySelector('.gems-grid').innerHTML = '<p class="error">Failed to load shop items. Please try again later.</p>';
        document.querySelector('.rank-grid').innerHTML = '<p class="error">Failed to load shop items. Please try again later.</p>';
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadVoteSites();
    loadShopItems();
});




// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    loadVoteSites();
    loadShopItems();
    
    // Initialize modal (but the purchase buttons won't exist yet)
    initModal();
});






// Initialize modal functionality
function initModal() {
    const modal = document.getElementById('purchaseModal');
    const closeModal = document.querySelector('.close-modal');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');
    const bkashInstructions = document.getElementById('bkash-instructions');
    const nagadInstructions = document.getElementById('nagad-instructions');
    const bkashAmount = document.getElementById('bkash-amount');
    const nagadAmount = document.getElementById('nagad-amount');
    const purchaseForm = document.getElementById('purchaseForm');

    // Use event delegation for purchase buttons since they're dynamically loaded
    document.addEventListener('click', function(event) {
        if (event.target.closest('.purchase-btn')) {
            const button = event.target.closest('.purchase-btn');
            const card = button.closest('.gem-card, .rank-card');
            const itemName = card.querySelector('h3').textContent;
            const itemPrice = card.querySelector('.price').textContent;
            
            document.getElementById('item-name').value = itemName;
            document.getElementById('item-price').value = itemPrice;
            
            bkashAmount.textContent = itemPrice;
            nagadAmount.textContent = itemPrice;
            
            // Add the opening animation
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Animate form elements
            const formElements = purchaseForm.querySelectorAll('.form-group, button');
            formElements.forEach((element, index) => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    element.style.transition = 'all 0.3s ease';
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        }
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        closeModalWithAnimation();
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModalWithAnimation();
        }
    });

    // Function to close modal with animation
    function closeModalWithAnimation() {
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.animation = 'modalclose 0.3s forwards';
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modalContent.style.animation = 'modalopen 0.4s';
        }, 300);
    }

    // Payment method toggle
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'bkash') {
                bkashInstructions.style.display = 'block';
                nagadInstructions.style.display = 'none';
            } else {
                bkashInstructions.style.display = 'none';
                nagadInstructions.style.display = 'block';
            }
        });
    });

    // Form validation
    function validateForm() {
        const username = document.getElementById('username').value;
        const discord = document.getElementById('discord').value;
        const phone = document.getElementById('phone').value;
        const date = new Date().toISOString();

        let isValid = true;
        
        // Basic validation
        if (username.length < 3) {
            shakeElement(document.getElementById('username'));
            isValid = false;
        }
        
        if (discord.length < 2) {
            shakeElement(document.getElementById('discord'));
            isValid = false;
        }
        
        if (phone.length < 11) {
            shakeElement(document.getElementById('phone'));
            isValid = false;
        }
        
        return isValid;
    }

    // Shake animation for invalid inputs
    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 600);
    }

    // Form submission
// Form submission
purchaseForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        return false;
    }
    
    const formData = {
        username: document.getElementById('username').value,
        discord: document.getElementById('discord').value,
        phone: document.getElementById('phone').value,
        paymentMethod: document.querySelector('input[name="payment"]:checked').value,
        itemName: document.getElementById('item-name').value,
        itemPrice: document.getElementById('item-price').value,
        status: 'Pending',
        timestamp: Date.now()
    };
    
    // Save to Firebase database
    const newPurchaseRef = database.ref('purchases').push();
    newPurchaseRef.set(formData)
    console.log('Purchase Data:', formData);
    
    // Send to Discord webhook
    sendToDiscordWebhook(formData);
    
    // Show success message
    const form = purchaseForm;
    const successMessage = document.createElement('div');
    successMessage.classList.add('success-message');
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>Purchase request received!</h3>
        <p>Item: ${formData.itemName}</p>
        <p>Amount: ${formData.itemPrice}</p>
        <p>We'll contact you shortly on Discord to complete the transaction.</p>
    `;
    
    // Replace form with success message
    form.style.opacity = '0';
    setTimeout(() => {
        form.innerHTML = '';
        form.appendChild(successMessage);
        form.style.opacity = '1';
    }, 300);
    
    // Close modal after 5 seconds
    setTimeout(() => {
        closeModalWithAnimation();
        
        // Reset form after modal is closed
        setTimeout(() => {
            purchaseForm.innerHTML = '';
            location.reload(); // Reload to reset the form (for demo purposes)
        }, 300);
    }, 5000);
});

// Function to send data to Discord webhook
function sendToDiscordWebhook(formData) {
    const webhookURL = 'https://discord.com/api/webhooks/1361383845538304275/wQLBzYcYpFAani7avAPEZ-W4CkBA16EUTq0TC_LpJtXslfAM0n8UR6Y7yfQts9QW0_Q2';
    
    const embed = {
        title: "New Purchase Request",
        color: 0x00ff00, // Green color
        fields: [
            {
                name: "Username",
                value: formData.username,
                inline: true
            },
            {
                name: "Discord",
                value: formData.discord,
                inline: true
            },
            {
                name: "Phone",
                value: formData.phone || "Not provided",
                inline: true
            },
            {
                name: "Item",
                value: formData.itemName,
                inline: true
            },
            {
                name: "Price",
                value: formData.itemPrice,
                inline: true
            },
            {
                name: "Payment Method",
                value: formData.paymentMethod,
                inline: true
            },
            {
                name: "Status",
                value: formData.status,
                inline: true
            },
            {
                name: "Timestamp",
                value: new Date(formData.timestamp).toLocaleString(),
                inline: true
            }
        ],
        timestamp: new Date().toISOString()
    };
    
    const payload = {
        embeds: [embed],
        content: `New purchase request from ${formData.username} (${formData.discord}) <@1145987969384185908>`
    };
    
    fetch(webhookURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            console.error('Failed to send to Discord webhook:', response.status, response.statusText);
        }
    })
    .catch(error => {
        console.error('Error sending to Discord webhook:', error);
    });
}
}

// Add keyframe animation for modal closing
const style = document.createElement('style');
style.innerHTML = `
    @keyframes modalclose {
        from {opacity: 1; transform: translateY(0);}
        to {opacity: 0; transform: translateY(50px);}
    }
    
    @keyframes shake {
        0%, 100% {transform: translateX(0);}
        10%, 30%, 50%, 70%, 90% {transform: translateX(-5px);}
        20%, 40%, 60%, 80% {transform: translateX(5px);}
    }
    
    .shake {
        animation: shake 0.6s cubic-bezier(.36,.07,.19,.97) both;
    }
    
    .success-message {
        text-align: center;
        padding: 20px;
    }
    
    .success-message i {
        font-size: 48px;
        color: #00E676;
        margin-bottom: 20px;
    }
    
    .success-message h3 {
        margin-bottom: 20px;
        color: #55C5FF;
    }
    
    .copied {
        background: linear-gradient(45deg, #00E676, #00C853) !important;
    }
    
    .animated {
        animation: fadeInUp 0.6s ease forwards;
    }
    
    .nav-links a.active {
        color: var(--primary-color);
    }
    
    .nav-links a.active:after {
        transform: scaleX(1);
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);




// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        // Fix click handling for the menu toggle button and its icon
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior
            e.stopPropagation(); // Stop event from bubbling up
            
            navLinks.classList.toggle('active');
            
            // Update aria-expanded attribute for accessibility
            const expanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', expanded);
            
            // Prevent body scrolling when menu is open
            document.body.classList.toggle('menu-open');
        });
        
        // Make sure clicks on the icon inside the button also trigger the menu
        const menuIcon = menuToggle.querySelector('i');
        if (menuIcon) {
            menuIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Manually trigger a click on the parent button
                menuToggle.click();
            });
        }
        
        // Close menu when clicking on a link
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('menu-open');
            });
        });
    }
    
    // Close menu with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            e.target !== menuToggle &&
            !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }
});

// Copy IP Address
document.getElementById('copy-ip').addEventListener('click', function() {
    const ip = document.getElementById('server-ip').textContent;
    navigator.clipboard.writeText(ip).then(() => {
        const originalText = this.textContent;
        this.textContent = 'Copied!';
        this.classList.add('copied');
        
        setTimeout(() => {
            this.textContent = originalText;
            this.classList.remove('copied');
        }, 2000);
    });
});

    // Smooth Scrolling for Anchor Links with better mobile handling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
                // Adjust scroll position based on viewport size
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar.offsetHeight;
                
                // On mobile, add additional offset for better visibility
                const isMobile = window.innerWidth < 768;
                const offset = isMobile ? navbarHeight + 10 : navbarHeight;
                
            window.scrollTo({
                    top: targetElement.offsetTop - offset,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
                navLinks.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
});

    // Improved scroll animations with throttling for better performance
    let isScrolling = false;
    
    // Throttled scroll handler for better performance
    const throttledScroll = function() {
        if (!isScrolling) {
            isScrolling = true;
            
            // Use requestAnimationFrame for better performance
            window.requestAnimationFrame(function() {
                animateOnScroll();
                isScrolling = false;
            });
        }
    };
    
    // Add animation classes when elements come into view
    const animateOnScroll = function() {
        // Separate handling for titles and cards for better performance
        const titles = document.querySelectorAll('section h2');
        const cards = document.querySelectorAll('.gem-card, .rank-card, .vote-card');
        
        // Different threshold for titles to appear sooner
        const titleThreshold = window.innerWidth < 768 ? 50 : 70;
        const cardThreshold = window.innerWidth < 768 ? 30 : 50;
            const windowHeight = window.innerHeight;
        
        // Animate titles first for better user experience
        titles.forEach((title, index) => {
            const elementPosition = title.getBoundingClientRect().top;
            
            if (elementPosition < windowHeight - titleThreshold) {
                // Add a slight delay between each title animation
                setTimeout(() => {
                    title.classList.add('animated');
                }, 100);
            }
        });
        
        // Then animate cards with a staggered effect
        cards.forEach((card, index) => {
            const elementPosition = card.getBoundingClientRect().top;
            
            if (elementPosition < windowHeight - cardThreshold) {
                // Calculate delay based on card position to create a wave effect
                const delay = (index % 4) * 100; // Stagger effect by row
                
                setTimeout(() => {
                    card.classList.add('animated');
                }, delay);
            }
        });
    };
    
    // Run on first load
    animateOnScroll();
    
    // Use the throttled version for scroll
    window.addEventListener('scroll', throttledScroll);
    
    // Re-check on resize for better responsiveness
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(animateOnScroll, 100);
    });

    // Improved navigation highlight with throttling
    let highlightScrolling = false;
    
    // Throttled scroll handler for better performance
    const throttledHighlightScroll = function() {
        if (!highlightScrolling) {
            highlightScrolling = true;
            
            window.requestAnimationFrame(function() {
                highlightActiveNav();
                highlightScrolling = false;
            });
        }
    };
    
    // Run on first load
    highlightActiveNav();
    
    // Use the throttled version for scroll
    window.addEventListener('scroll', throttledHighlightScroll);
    
    // Re-check on resize for better responsiveness
    resizeTimer = setTimeout(highlightActiveNav, 100);

    // Get all purchase buttons and tabs
    const purchaseButtons = document.querySelectorAll('.purchase-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    // Apply special handling for purchase buttons
    purchaseButtons.forEach(button => {
        // Make sure cursor changes
        button.addEventListener('mouseenter', function() {
            const cursorFollower = document.querySelector('.cursor-follower');
            if (cursorFollower) {
                cursorFollower.classList.add('active');
            }
            this.style.zIndex = '15';
        });
        
        button.addEventListener('mouseleave', function() {
            const cursorFollower = document.querySelector('.cursor-follower');
            if (cursorFollower) {
                cursorFollower.classList.remove('active');
            }
            this.style.zIndex = '5';
        });
        
        // Add magnetic hover effect
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const moveX = (x - centerX) / 8;
            const moveY = (y - centerY) / 8;
            
            this.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Apply special handling for tab buttons
    tabButtons.forEach(button => {
        // Make sure cursor changes
        button.addEventListener('mouseenter', function() {
            const cursorFollower = document.querySelector('.cursor-follower');
            if (cursorFollower) {
                cursorFollower.classList.add('active');
            }
            this.style.zIndex = '15';
        });
        
        button.addEventListener('mouseleave', function() {
            const cursorFollower = document.querySelector('.cursor-follower');
            if (cursorFollower) {
                cursorFollower.classList.remove('active');
            }
            this.style.zIndex = '5';
        });
        
        // Add special hover animation
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const moveX = (x - centerX) / 10;
            const moveY = (y - centerY) / 10;
            
            this.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });

    // Add magnetic effect to buttons
    const magneticButtons = document.querySelectorAll('.btn, .tab-btn, .hero-btn, #join-now, #copy-ip, .purchase-btn');
    
    magneticButtons.forEach(button => {
        // Add magnetic hover effect
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const moveX = (x - centerX) / 8; // Stronger magnetic effect
            const moveY = (y - centerY) / 8;
            
            this.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
        
        // Add click animation
        button.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
    
    // Add click animation to cursor follower
    document.addEventListener('mousedown', function() {
        const cursorFollower = document.querySelector('.cursor-follower');
        if (cursorFollower) {
            const originalTransform = cursorFollower.style.transform;
            cursorFollower.style.transform = `${originalTransform} scale(0.8)`;
            setTimeout(() => {
                cursorFollower.style.transform = originalTransform;
            }, 200);
        }
    });
});

function highlightActiveNav() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    let currentSection = '';
    const scrollPosition = window.scrollY;
    
    // Determine current section with more accurate calculation
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const navbar = document.querySelector('.navbar');
        const offset = navbar.offsetHeight + 20;
        
        if (scrollPosition >= (sectionTop - offset) && 
            scrollPosition < (sectionTop + sectionHeight - offset)) {
            currentSection = section.getAttribute('id');
        }
    });
    
    // Update active navigation link
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}



// Tab functionality for Shop section
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Function to activate a tab
    function setActiveTab(tabId) {
        // Deactivate all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Activate the selected tab
        const selectedTabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        const selectedTabContent = document.getElementById(`${tabId}-tab`);
        
        if (selectedTabBtn && selectedTabContent) {
            selectedTabBtn.classList.add('active');
            selectedTabContent.classList.add('active');
            
            // Trigger animation for the content
            selectedTabContent.style.animation = 'none';
            setTimeout(() => {
                selectedTabContent.style.animation = 'fadeIn 0.5s ease forwards';
            }, 10);
        }
    }
    
    // Set up click handlers for tabs
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            setActiveTab(tabId);
        });
    });
    
    // Check for hash in URL to activate specific tab
    const hash = window.location.hash;
    if (hash && (hash === '#gems' || hash === '#ranks')) {
        setActiveTab(hash.substring(1));
    }
    
    // Add tab handling to navigation links
    document.querySelectorAll('a[href="#shop"]').forEach(link => {
        link.addEventListener('click', function(e) {
            // If there's a data-default-tab attribute, use it
            const defaultTab = this.getAttribute('data-default-tab') || 'gems';
            setTimeout(() => {
                setActiveTab(defaultTab);
            }, 100);
        });
    });
    
    // Run animation on scroll for tab content
    const animateTabContent = function() {
        // Only target the active tab to improve performance
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) return;
        
        const cards = activeTab.querySelectorAll('.gem-card, .rank-card');
        const windowHeight = window.innerHeight;
        const cardThreshold = window.innerWidth < 768 ? 30 : 50;
        
        cards.forEach((card, index) => {
            const elementPosition = card.getBoundingClientRect().top;
            
            if (elementPosition < windowHeight - cardThreshold) {
                // Calculate delay based on card position to create a wave effect
                const delay = (index % 4) * 100; // Stagger effect by row
                
                setTimeout(() => {
                    card.classList.add('animated');
                }, delay);
            }
        });
    };
    
    // Add to existing scroll event listener
    window.addEventListener('scroll', animateTabContent);
    
    // Run animation when tabs change
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            setTimeout(animateTabContent, 100);
        });
    });
});

// About section functionality
document.addEventListener('DOMContentLoaded', function() {
    // Join Discord button
    const joinDiscordBtn = document.getElementById('join-discord');
    if (joinDiscordBtn) {
        joinDiscordBtn.addEventListener('click', function() {
            window.open('https://discord.impomc.xyz/', '_blank');
        });
    }
    
    // Add About section to animations
    const animateAboutFeatures = function() {
        const features = document.querySelectorAll('.feature');
        const windowHeight = window.innerHeight;
        const threshold = window.innerWidth < 768 ? 30 : 50;
        
        features.forEach((feature, index) => {
            const elementPosition = feature.getBoundingClientRect().top;
            
            if (elementPosition < windowHeight - threshold) {
                setTimeout(() => {
                    feature.classList.add('animated');
                }, index * 150); // Stagger the animations
            }
        });
    };
    
    // Add to scroll event
    window.addEventListener('scroll', function() {
        animateAboutFeatures();
    });
    
    // Run once on load
    animateAboutFeatures();
});

// Hero section functionality
document.addEventListener('DOMContentLoaded', function() {
    // Copy IP functionality
    const copyIpBtn = document.getElementById('copy-ip');
    const serverIp = document.getElementById('server-ip');
    
    if (copyIpBtn && serverIp) {
        copyIpBtn.addEventListener('click', function() {
            const ip = serverIp.textContent;
            navigator.clipboard.writeText(ip).then(() => {
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                this.classList.add('copied');
                
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.classList.remove('copied');
                }, 2000);
            });
        });
    }
    
    // Join Now button
    const joinNowBtn = document.getElementById('join-now');
    if (joinNowBtn && serverIp) {
        joinNowBtn.addEventListener('click', function() {
            const ip = serverIp.textContent;
            navigator.clipboard.writeText(ip).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i> IP Copied!';
                this.classList.add('copied');
                
                // Show a tooltip or notification
                const notification = document.createElement('div');
                notification.className = 'ip-notification';
                notification.innerHTML = `<i class="fas fa-info-circle"></i> Server IP <strong>${ip}</strong> copied to clipboard!`;
                document.body.appendChild(notification);
                
                // Remove the notification after a delay
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 500);
                }, 3000);
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-play"></i> Play Now';
                    this.classList.remove('copied');
                }, 2000);
            });
        });
    }
    
    // Create notification styles
    const style = document.createElement('style');
    style.innerHTML = `
        .ip-notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(30, 30, 30, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease forwards;
            border-left: 4px solid var(--primary-color);
        }
        
        .ip-notification strong {
            color: var(--primary-color);
        }
        
        .ip-notification.fade-out {
            animation: slideOut 0.5s ease forwards;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});

// Cursor follower effect
document.addEventListener('DOMContentLoaded', function() {
    // Create cursor follower element
    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursorFollower);
    
    // Variables for smooth movement
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    let speed = 0.10; // Slower for more dramatic trailing effect
    let isHovering = false; // Track if we're hovering an interactive element
    
    // Update cursor position with smooth following
    function animate() {
        // Calculate distance to move
        let distX = mouseX - followerX;
        let distY = mouseY - followerY;
        
        // Move the follower
        followerX += distX * speed;
        followerY += distY * speed;
        
        // Apply position with transform for better performance
        cursorFollower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
        
        // Continue animation
        requestAnimationFrame(animate);
    }
    
    // Start animation loop
    animate();
    
    // Track mouse position with high precision
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Show the cursor follower whenever mouse moves
        cursorFollower.style.opacity = '1';
    });
    
    // Use event delegation for better performance and fewer bugs
    document.addEventListener('mouseover', function(e) {
        // Check if we're hovering over an interactive element
        const element = e.target;
        
        // Check if element is interactive
        const isInteractive = 
            element.tagName === 'A' || 
            element.tagName === 'BUTTON' || 
            element.tagName === 'INPUT' || 
            element.classList.contains('btn') ||
            element.classList.contains('feature') ||
            element.classList.contains('mini-card') ||
            element.classList.contains('social-links') ||
            element.classList.contains('purchase-btn') ||
            element.classList.contains('tab-btn') ||
            element.classList.contains('scroll-indicator') ||
            element.classList.contains('fa-discord') ||
            element.classList.contains('fa-chevron-down') ||
            element.closest('a, button, .btn, .feature, .social-links a, .footer-section a');
        
        if (isInteractive) {
            isHovering = true;
            cursorFollower.classList.add('active');
        }
    });
    
    document.addEventListener('mouseout', function(e) {
        // Only handle if we're leaving an element that doesn't have an interactive child
        if (!e.relatedTarget || !e.relatedTarget.closest('a, button, .btn, .feature, .social-links a, .footer-section a')) {
            isHovering = false;
            cursorFollower.classList.remove('active');
        }
    });
    
    // Special handling for problematic sections (About & Footer)
    const aboutSection = document.querySelector('.about-section');
    const footerSection = document.querySelector('.footer');
    
    [aboutSection, footerSection].forEach(section => {
        if (section) {
            // Add more robust mouseout detection
            section.addEventListener('mouseleave', function() {
                setTimeout(() => {
                    if (!document.querySelector(':hover').closest('a, button, .btn, .feature, .social-links a, .footer-section a')) {
                        isHovering = false;
                        cursorFollower.classList.remove('active');
                    }
                }, 50);
            });
            
            // Add more specific handling for links in these sections
            const interactiveElements = section.querySelectorAll('a, button, .btn, .feature, .social-links a');
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', function() {
                    isHovering = true;
                    cursorFollower.classList.add('active');
                    // Increase z-index to ensure proper hover
                    this.style.zIndex = '100';
                });
                
                el.addEventListener('mouseleave', function() {
                    // Only remove active state if we're not moving to another interactive element
                    setTimeout(() => {
                        if (!document.querySelector(':hover').closest('a, button, .btn, .feature, .social-links a, .footer-section a')) {
                            isHovering = false;
                            cursorFollower.classList.remove('active');
                        }
                        this.style.zIndex = '';
                    }, 50);
                });
            });
        }
    });
    
    // Handle mouse leaving/entering window
    document.addEventListener('mouseout', function(e) {
        if (e.relatedTarget === null) {
            cursorFollower.style.opacity = '0';
            isHovering = false;
        }
    });
    
    // Add initial pulse animation
    setTimeout(() => {
        cursorFollower.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cursorFollower.style.transform = 'scale(1)';
        }, 400);
    }, 1000);
    
    // Disable on touch devices
    if ('ontouchstart' in window) {
        cursorFollower.style.display = 'none';
    }
});
