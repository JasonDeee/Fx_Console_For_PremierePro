/*************************************************************************
 * FX CONSOLE FOR PREMIERE PRO
 * Basic search and navigation functionality
 **************************************************************************/

// Global references
const ppro = require("premierepro");

// UI Elements
let searchInput;
let resultsContainer;
let resultsList;
let noResults;
let searchCount;
let statusText;

// State
let currentResults = [];
let selectedIndex = -1;
let isVisible = true;

// Mock data for testing (will be replaced with real Premiere API calls)
const mockEffects = [
  {
    name: "Gaussian Blur",
    category: "Video Effects > Blur & Sharpen",
    type: "video",
    icon: "🌀",
  },
  {
    name: "Color Correction",
    category: "Video Effects > Color Correction",
    type: "video",
    icon: "🎨",
  },
  {
    name: "Cross Dissolve",
    category: "Transitions > Video",
    type: "transition",
    icon: "⚡",
  },
  {
    name: "Amplify",
    category: "Audio Effects > Amplitude",
    type: "audio",
    icon: "🔊",
  },
  {
    name: "Fade In",
    category: "Transitions > Audio",
    type: "transition",
    icon: "📈",
  },
  {
    name: "Lumetri Color",
    category: "Video Effects > Color Correction",
    type: "video",
    icon: "🎨",
  },
  {
    name: "Crop",
    category: "Video Effects > Transform",
    type: "video",
    icon: "✂️",
  },
  {
    name: "Echo",
    category: "Audio Effects > Delay",
    type: "audio",
    icon: "🔄",
  },
];

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initializeUI();
  setupEventListeners();
  updateStatus("Ready");
});

// Initialize UI references
function initializeUI() {
  searchInput = document.getElementById("search-input");
  resultsContainer = document.getElementById("results-container");
  resultsList = document.getElementById("results-list");
  noResults = document.getElementById("no-results");
  searchCount = document.getElementById("search-count");
  statusText = document.getElementById("status-text");

  // Enhanced initial focus with delay
  setTimeout(() => {
    focusSearchInput();
  }, 100);
}

// Setup event listeners
function setupEventListeners() {
  // Search input events
  searchInput.addEventListener("input", handleSearchInput);
  searchInput.addEventListener("keydown", handleSearchKeydown);

  // Global keyboard shortcuts
  document.addEventListener("keydown", handleGlobalKeydown);

  // Panel activation events
  document.addEventListener("click", handlePanelClick);
  window.addEventListener("focus", handleWindowFocus);

  // Settings and help buttons
  document.getElementById("settings-btn").addEventListener("click", () => {
    updateStatus("Settings coming soon...");
  });

  document.getElementById("help-btn").addEventListener("click", () => {
    updateStatus(
      "Help: Click panel → Type to search → ↑↓ navigate → Enter apply"
    );
  });
}

// Handle search input changes
function handleSearchInput(event) {
  const query = event.target.value.trim();

  if (query.length === 0) {
    showWelcomeMessage();
    return;
  }

  if (query.length < 2) {
    updateSearchCount(0);
    return;
  }

  performSearch(query);
}

// Handle keyboard navigation in search
function handleSearchKeydown(event) {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      navigateResults(1);
      break;
    case "ArrowUp":
      event.preventDefault();
      navigateResults(-1);
      break;
    case "Enter":
      event.preventDefault();
      applySelectedEffect();
      break;
    case "Escape":
      event.preventDefault();
      clearSearch();
      break;
  }
}

// Handle global keyboard shortcuts
function handleGlobalKeydown(event) {
  // Debug: Log all keyboard events with modifiers
  if (event.ctrlKey || event.altKey) {
    console.log("Keyboard event:", {
      key: event.key,
      code: event.code,
      ctrl: event.ctrlKey,
      alt: event.altKey,
      shift: event.shiftKey,
    });
  }

  // Ctrl+Alt+Space toggle (will be customizable later)
  if (event.ctrlKey && event.altKey && event.code === "Space") {
    event.preventDefault();
    event.stopPropagation();
    console.log("Shortcut detected! Focusing search...");
    focusSearchInput();
    updateStatus("🎯 Shortcut activated! (Ctrl+Alt+Space)");
    return;
  }

  // Focus search when typing (if not already focused)
  if (
    !searchInput.contains(document.activeElement) &&
    event.key.length === 1 &&
    !event.ctrlKey &&
    !event.altKey &&
    !event.metaKey
  ) {
    focusSearchInput();
  }
}

// Perform search
function performSearch(query) {
  updateStatus(`Searching for "${query}"...`);

  // Filter mock effects (will be replaced with Premiere API)
  currentResults = mockEffects.filter(
    (effect) =>
      effect.name.toLowerCase().includes(query.toLowerCase()) ||
      effect.category.toLowerCase().includes(query.toLowerCase())
  );

  displayResults(currentResults);
  updateSearchCount(currentResults.length);
  selectedIndex = currentResults.length > 0 ? 0 : -1;
  updateSelection();

  updateStatus(`Found ${currentResults.length} results`);
}

// Display search results
function displayResults(results) {
  hideWelcomeMessage();

  if (results.length === 0) {
    resultsList.innerHTML =
      '<div class="no-results"><p>No effects found</p></div>';
    return;
  }

  const html = results
    .map(
      (result, index) => `
    <div class="result-item" data-index="${index}">
      <div class="result-icon category-${result.type}">${result.icon}</div>
      <div class="result-content">
        <div class="result-name">${result.name}</div>
        <div class="result-category">${result.category}</div>
      </div>
    </div>
  `
    )
    .join("");

  resultsList.innerHTML = html;

  // Add click listeners to result items
  resultsList.querySelectorAll(".result-item").forEach((item) => {
    item.addEventListener("click", () => {
      selectedIndex = parseInt(item.dataset.index);
      updateSelection();
      applySelectedEffect();
    });
  });
}

// Navigate through results
function navigateResults(direction) {
  if (currentResults.length === 0) return;

  selectedIndex += direction;

  if (selectedIndex < 0) {
    selectedIndex = currentResults.length - 1;
  } else if (selectedIndex >= currentResults.length) {
    selectedIndex = 0;
  }

  updateSelection();
  scrollToSelected();
}

// Update visual selection
function updateSelection() {
  resultsList.querySelectorAll(".result-item").forEach((item, index) => {
    item.classList.toggle("selected", index === selectedIndex);
  });
}

// Scroll to selected item
function scrollToSelected() {
  if (selectedIndex === -1) return;

  const selectedItem = resultsList.querySelector(
    `[data-index="${selectedIndex}"]`
  );
  if (selectedItem) {
    selectedItem.scrollIntoView({ block: "nearest" });
  }
}

// Apply selected effect
function applySelectedEffect() {
  if (selectedIndex === -1 || !currentResults[selectedIndex]) return;

  const effect = currentResults[selectedIndex];
  updateStatus(`Applying "${effect.name}"...`);

  // TODO: Implement actual effect application using Premiere API
  setTimeout(() => {
    updateStatus(`Applied "${effect.name}" successfully`);
  }, 500);

  // Clear search after applying
  setTimeout(() => {
    clearSearch();
  }, 1000);
}

// Show welcome message
function showWelcomeMessage() {
  noResults.classList.remove("hidden");
  currentResults = [];
  selectedIndex = -1;
  updateSearchCount(0);
}

// Hide welcome message
function hideWelcomeMessage() {
  noResults.classList.add("hidden");
}

// Clear search
function clearSearch() {
  searchInput.value = "";
  showWelcomeMessage();
  updateStatus("Ready");
}

// Handle panel click events
function handlePanelClick(event) {
  // UXP-compatible way to check if click is within panel
  let target = event.target;
  let isWithinPanel = false;

  // Traverse up the DOM tree manually (UXP doesn't support closest)
  while (target && target !== document) {
    if (target.classList && target.classList.contains("fx-console")) {
      isWithinPanel = true;
      break;
    }
    target = target.parentNode;
  }

  if (isWithinPanel) {
    setTimeout(() => {
      if (document.activeElement !== searchInput) {
        searchInput.focus();
      }
    }, 10);
  }
}

// Handle window focus events
function handleWindowFocus() {
  // When panel gets focus, focus the search input
  setTimeout(() => {
    if (searchInput && !searchInput.value) {
      searchInput.focus();
    }
  }, 100);
}

// Focus search input with enhanced reliability
function focusSearchInput() {
  try {
    // Don't clear search if user is actively typing
    if (!searchInput.value) {
      clearSearch();
    }

    // Force focus with multiple attempts
    searchInput.focus();

    // Backup focus attempt with selection
    setTimeout(() => {
      if (document.activeElement !== searchInput) {
        searchInput.focus();
        if (searchInput.value) {
          searchInput.select();
        }
      }
    }, 50);

    // Visual feedback
    searchInput.style.borderColor = "#0078d4";
    setTimeout(() => {
      searchInput.style.borderColor = "";
    }, 300);

    updateStatus("Search input focused");
  } catch (error) {
    updateStatus("Focus error: " + error.message);
  }
}

// Toggle panel visibility
function togglePanel() {
  isVisible = !isVisible;
  document.body.style.display = isVisible ? "block" : "none";

  if (isVisible) {
    focusSearchInput();
    updateStatus("Panel opened");
  }
}

// Update search count
function updateSearchCount(count) {
  searchCount.textContent = `${count} result${count !== 1 ? "s" : ""}`;
}

// Update status text
function updateStatus(message) {
  statusText.textContent = message;
}
