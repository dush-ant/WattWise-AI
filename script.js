const tariffPerUnit = 8;
const themeStorageKey = "smart-electricity-theme";
const usersStorageKey = "smart-electricity-users";
const sessionStorageKey = "smart-electricity-session";

const featureDefaults = {
  comparison: true,
  efficiency: true,
  alerts: true,
  history: true,
  suggestions: true
};

const usageHistoryLabels = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];
const usageHistoryData = [8.4, 7.8, 9.2, 8.7, 10.1, 9.4, 8.9];

const authShell = document.getElementById("authShell");
const appShell = document.getElementById("appShell");
const showLoginTab = document.getElementById("showLoginTab");
const showRegisterTab = document.getElementById("showRegisterTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const welcomeText = document.getElementById("welcomeText");
const logoutButton = document.getElementById("logoutButton");
const editProfileButton = document.getElementById("editProfileButton");

const form = document.getElementById("deviceForm");
const nameInput = document.getElementById("deviceName");
const powerInput = document.getElementById("devicePower");
const hoursInput = document.getElementById("deviceHours");
const clearAllButton = document.getElementById("clearAllButton");
const heroEfficiencyValue = document.getElementById("heroEfficiencyValue");
const totalUnitsElement = document.getElementById("totalUnits");
const estimatedBillElement = document.getElementById("estimatedBill");
const predictionDailyUnitsElement = document.getElementById("predictionDailyUnits");
const predictionMonthlyUnitsElement = document.getElementById("predictionMonthlyUnits");
const predictionMonthlyBillElement = document.getElementById("predictionMonthlyBill");
const highestDeviceNameElement = document.getElementById("highestDeviceName");
const highestDeviceUnitsElement = document.getElementById("highestDeviceUnits");
const lowestDeviceNameElement = document.getElementById("lowestDeviceName");
const lowestDeviceUnitsElement = document.getElementById("lowestDeviceUnits");
const efficiencyScoreElement = document.getElementById("efficiencyScore");
const efficiencyLabelElement = document.getElementById("efficiencyLabel");
const efficiencyTextElement = document.getElementById("efficiencyText");
const efficiencyBarFillElement = document.getElementById("efficiencyBarFill");
const alertsList = document.getElementById("alertsList");
const alertCount = document.getElementById("alertCount");
const suggestionsList = document.getElementById("suggestionsList");
const suggestionCount = document.getElementById("suggestionCount");
const deviceCount = document.getElementById("deviceCount");
const chartStatus = document.getElementById("chartStatus");
const chartEmptyState = document.getElementById("chartEmptyState");
const deviceTableBody = document.getElementById("deviceTableBody");
const themeToggle = document.getElementById("themeToggle");
const themeToggleLabel = document.getElementById("themeToggleLabel");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const usageChartCanvas = document.getElementById("usageChart");
const historyChartCanvas = document.getElementById("historyChart");

const featureToggleInputs = [...document.querySelectorAll("[data-feature-toggle]")];
const featureSections = [...document.querySelectorAll("[data-feature-section]")];

let currentUser = null;
let devices = [];

function getUsers() {
  return JSON.parse(localStorage.getItem(usersStorageKey) || "[]");
}

function saveUsers(users) {
  localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function setSession(user) {
  localStorage.setItem(sessionStorageKey, JSON.stringify({ email: user.email }));
}

function clearSession() {
  localStorage.removeItem(sessionStorageKey);
}

function getStoredSession() {
  return JSON.parse(localStorage.getItem(sessionStorageKey) || "null");
}

function getCurrentUserFromStorage() {
  const session = getStoredSession();

  if (!session?.email) {
    return null;
  }

  return getUsers().find((user) => user.email === session.email) || null;
}

function getUserStorageKey(type) {
  return currentUser ? `smart-electricity-${type}:${currentUser.email}` : "";
}

function getStoredTheme() {
  const storedTheme = localStorage.getItem(themeStorageKey);
  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
}

function getTheme() {
  return document.body.classList.contains("dark-mode") ? "dark" : "light";
}

function getChartThemeOptions() {
  if (getTheme() === "dark") {
    return {
      tickColor: "#cbd5e1",
      yTickColor: "#94a3b8",
      gridColor: "rgba(148, 163, 184, 0.18)",
      tooltipBg: "rgba(15, 23, 42, 0.95)",
      tooltipTitle: "#f8fafc",
      tooltipBody: "#cbd5e1",
      tooltipBorder: "rgba(148, 163, 184, 0.22)"
    };
  }

  return {
    tickColor: "#334155",
    yTickColor: "#64748b",
    gridColor: "rgba(148, 163, 184, 0.22)",
    tooltipBg: "rgba(255, 255, 255, 0.98)",
    tooltipTitle: "#0f172a",
    tooltipBody: "#475569",
    tooltipBorder: "rgba(203, 213, 225, 0.95)"
  };
}

const initialChartTheme = getChartThemeOptions();

const usageChart = new Chart(usageChartCanvas, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Units Consumed (kWh)",
        data: [],
        backgroundColor: [],
        borderRadius: 12,
        borderSkipped: false,
        maxBarThickness: 56
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: initialChartTheme.tooltipBg,
        titleColor: initialChartTheme.tooltipTitle,
        bodyColor: initialChartTheme.tooltipBody,
        borderColor: initialChartTheme.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} kWh per day`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: initialChartTheme.tickColor,
          font: { family: "Inter", weight: "600" }
        }
      },
      y: {
        beginAtZero: true,
        ticks: { color: initialChartTheme.yTickColor },
        grid: { color: initialChartTheme.gridColor }
      }
    }
  }
});

const historyChart = new Chart(historyChartCanvas, {
  type: "line",
  data: {
    labels: usageHistoryLabels,
    datasets: [
      {
        label: "Units (kWh)",
        data: usageHistoryData,
        borderColor: "#38bdf8",
        backgroundColor: "rgba(56, 189, 248, 0.16)",
        pointBackgroundColor: "#22c55e",
        pointBorderColor: "#ffffff",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
        tension: 0.38,
        fill: true
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Usage History",
        color: initialChartTheme.tooltipTitle,
        font: { family: "Inter", size: 16, weight: "700" },
        padding: { bottom: 16 }
      },
      tooltip: {
        backgroundColor: initialChartTheme.tooltipBg,
        titleColor: initialChartTheme.tooltipTitle,
        bodyColor: initialChartTheme.tooltipBody,
        borderColor: initialChartTheme.tooltipBorder,
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} kWh`
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Days",
          color: initialChartTheme.tickColor,
          font: { family: "Inter", weight: "700" }
        },
        grid: { display: false },
        ticks: {
          color: initialChartTheme.tickColor,
          font: { family: "Inter", weight: "600" }
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Units (kWh)",
          color: initialChartTheme.yTickColor,
          font: { family: "Inter", weight: "700" }
        },
        ticks: { color: initialChartTheme.yTickColor },
        grid: { color: initialChartTheme.gridColor }
      }
    }
  }
});

function calculateUnits(power, hours) {
  return (power * hours) / 1000;
}

function formatUnits(units) {
  return `${units.toFixed(2)} kWh`;
}

function formatCurrency(amount) {
  return `&#8377;${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  })}`;
}

function getChartColors(size) {
  const palette = ["#38bdf8", "#22c55e", "#f59e0b", "#a78bfa", "#fb7185", "#14b8a6", "#f97316"];
  return Array.from({ length: size }, (_, index) => palette[index % palette.length]);
}

function applyChartTheme() {
  const theme = getChartThemeOptions();
  usageChart.options.plugins.tooltip.backgroundColor = theme.tooltipBg;
  usageChart.options.plugins.tooltip.titleColor = theme.tooltipTitle;
  usageChart.options.plugins.tooltip.bodyColor = theme.tooltipBody;
  usageChart.options.plugins.tooltip.borderColor = theme.tooltipBorder;
  usageChart.options.scales.x.ticks.color = theme.tickColor;
  usageChart.options.scales.y.ticks.color = theme.yTickColor;
  usageChart.options.scales.y.grid.color = theme.gridColor;
  usageChart.update();

  historyChart.options.plugins.title.color = theme.tooltipTitle;
  historyChart.options.plugins.tooltip.backgroundColor = theme.tooltipBg;
  historyChart.options.plugins.tooltip.titleColor = theme.tooltipTitle;
  historyChart.options.plugins.tooltip.bodyColor = theme.tooltipBody;
  historyChart.options.plugins.tooltip.borderColor = theme.tooltipBorder;
  historyChart.options.scales.x.title.color = theme.tickColor;
  historyChart.options.scales.x.ticks.color = theme.tickColor;
  historyChart.options.scales.y.title.color = theme.yTickColor;
  historyChart.options.scales.y.ticks.color = theme.yTickColor;
  historyChart.options.scales.y.grid.color = theme.gridColor;
  historyChart.update();
}

function getFeaturePreferences() {
  if (!currentUser) {
    return { ...featureDefaults };
  }

  return {
    ...featureDefaults,
    ...(JSON.parse(localStorage.getItem(getUserStorageKey("features")) || "null") || {})
  };
}

function saveFeaturePreferences(preferences) {
  if (!currentUser) {
    return;
  }

  localStorage.setItem(getUserStorageKey("features"), JSON.stringify(preferences));
}

function applyFeaturePreferences(preferences) {
  featureToggleInputs.forEach((input) => {
    input.checked = Boolean(preferences[input.dataset.featureToggle]);
  });

  featureSections.forEach((section) => {
    const isVisible = Boolean(preferences[section.dataset.featureSection]);
    section.classList.toggle("feature-section--hidden", !isVisible);
  });
}

function saveDevices() {
  if (!currentUser) {
    return;
  }

  localStorage.setItem(getUserStorageKey("devices"), JSON.stringify(devices));
}

function loadDevices() {
  if (!currentUser) {
    devices = [];
    return;
  }

  devices = JSON.parse(localStorage.getItem(getUserStorageKey("devices")) || "[]");
}

function getEmptyDashboardStats() {
  return {
    totalUnits: 0,
    estimatedBill: 0,
    monthlyUnits: 0,
    monthlyBill: 0,
    highestPower: null,
    highestUsage: null,
    highestUnitsDevice: null,
    lowestUnitsDevice: null
  };
}

function deriveDashboardStats(deviceList) {
  if (!deviceList.length) {
    return getEmptyDashboardStats();
  }

  return deviceList.reduce((stats, device) => {
    stats.totalUnits += device.units;

    if (!stats.highestPower || device.power > stats.highestPower.power) {
      stats.highestPower = device;
    }

    if (!stats.highestUsage || device.hours > stats.highestUsage.hours) {
      stats.highestUsage = device;
    }

    if (!stats.highestUnitsDevice || device.units > stats.highestUnitsDevice.units) {
      stats.highestUnitsDevice = device;
    }

    if (!stats.lowestUnitsDevice || device.units < stats.lowestUnitsDevice.units) {
      stats.lowestUnitsDevice = device;
    }

    return stats;
  }, getEmptyDashboardStats());
}

function finalizeDashboardStats(stats) {
  stats.estimatedBill = stats.totalUnits * tariffPerUnit;
  stats.monthlyUnits = stats.totalUnits * 30;
  stats.monthlyBill = stats.monthlyUnits * tariffPerUnit;
  return stats;
}

function buildSuggestions(deviceList, stats) {
  if (!deviceList.length) {
    return [
      {
        icon: "AI",
        title: "No devices added yet",
        description: "Add your first device to unlock usage insights, bill estimates, and tailored energy-saving suggestions."
      }
    ];
  }

  const items = [];
  const { highestPower, highestUsage, highestUnitsDevice } = stats;

  if (highestPower && highestPower.power >= 1000) {
    items.push({
      icon: "HP",
      title: `Review ${highestPower.name} power load`,
      description: `${highestPower.name} is your highest power device at ${highestPower.power} W. Use eco settings or stagger usage to reduce spikes.`
    });
  }

  if (highestUsage && highestUsage.hours >= 10) {
    items.push({
      icon: "HU",
      title: `Trim long runtime for ${highestUsage.name}`,
      description: `${highestUsage.name} runs for ${highestUsage.hours} hours per day. Reducing runtime slightly can noticeably cut daily consumption.`
    });
  }

  if (highestUnitsDevice && highestUnitsDevice.units >= 5) {
    items.push({
      icon: "AI",
      title: `Prioritize ${highestUnitsDevice.name} for savings`,
      description: `${highestUnitsDevice.name} consumes ${highestUnitsDevice.units.toFixed(2)} units per day, making it the best place to target savings first.`
    });
  }

  if (items.length < 3) {
    items.push({
      icon: "EF",
      title: "Shift usage away from peak hours",
      description: "Move flexible appliance usage to off-peak times where possible for better bill control and lower grid strain."
    });
  }

  if (items.length < 3) {
    items.push({
      icon: "MT",
      title: "Maintain appliances regularly",
      description: "Clean filters, check airflow, and keep devices serviced so they do not consume extra power for the same output."
    });
  }

  return items.slice(0, 3);
}

function renderTable(deviceList) {
  if (!deviceList.length) {
    deviceTableBody.innerHTML = `
      <tr>
        <td class="table-empty" colspan="5">No devices added yet</td>
      </tr>
    `;
    return;
  }

  deviceTableBody.innerHTML = deviceList
    .map((device, index) => `
      <tr>
        <td class="device-name">${device.name}</td>
        <td>${device.power} W</td>
        <td>${device.hours} hrs/day</td>
        <td>${device.units.toFixed(2)} kWh</td>
        <td><button type="button" class="delete-button" data-index="${index}">Delete</button></td>
      </tr>
    `)
    .join("");
}

function renderSuggestions(deviceList, stats) {
  const items = buildSuggestions(deviceList, stats);
  suggestionCount.textContent = `${items.length} actions`;
  suggestionsList.innerHTML = items
    .map((item) => `
      <article class="suggestion-item">
        <div class="suggestion-item__icon" aria-hidden="true">${item.icon}</div>
        <div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      </article>
    `)
    .join("");
}

function renderAlerts(totalUnits, estimatedBill) {
  const alerts = [];

  if (totalUnits > 15) {
    alerts.push({
      type: "caution",
      icon: "!",
      title: "High electricity usage detected",
      description: "Your total daily usage is above 15 kWh. Review high-running devices to avoid extra energy costs."
    });
  }

  if (estimatedBill > 2000) {
    alerts.push({
      type: "warning",
      icon: "!!",
      title: "Warning: Bill may exceed Rs 2000",
      description: "Your projected electricity bill has crossed the Rs 2000 threshold. Consider reducing high-consumption devices."
    });
  }

  alertCount.textContent = `${alerts.length} alert${alerts.length === 1 ? "" : "s"}`;

  if (!alerts.length) {
    alertsList.innerHTML = `<div class="alert-empty">No smart alerts right now. Your usage is within the monitored thresholds.</div>`;
    return;
  }

  alertsList.innerHTML = alerts
    .map((alert) => `
      <article class="alert-item alert-item--${alert.type}">
        <div class="alert-item__icon" aria-hidden="true">${alert.icon}</div>
        <div class="alert-item__content">
          <strong>${alert.title}</strong>
          <span>${alert.description}</span>
        </div>
      </article>
    `)
    .join("");
}

function renderComparison(stats) {
  if (!stats.highestUnitsDevice || !stats.lowestUnitsDevice) {
    highestDeviceNameElement.textContent = "No devices added yet";
    highestDeviceUnitsElement.textContent = "0.00 kWh";
    lowestDeviceNameElement.textContent = "No devices added yet";
    lowestDeviceUnitsElement.textContent = "0.00 kWh";
    return;
  }

  const highest = stats.highestUnitsDevice;
  const lowest = stats.lowestUnitsDevice;

  highestDeviceNameElement.textContent = highest.name;
  highestDeviceUnitsElement.textContent = `${highest.units.toFixed(2)} kWh`;
  lowestDeviceNameElement.textContent = lowest.name;
  lowestDeviceUnitsElement.textContent = `${lowest.units.toFixed(2)} kWh`;
}

function getEfficiencyData(totalUnits) {
  if (totalUnits < 5) {
    const score = Math.max(90, Math.round(100 - totalUnits * 2));
    return { score, label: "Excellent", description: "Excellent efficiency based on current daily usage." };
  }

  if (totalUnits <= 10) {
    const score = Math.max(70, Math.round(90 - (totalUnits - 5) * 4));
    return { score, label: "Good", description: "Good efficiency. Your daily usage is under healthy control." };
  }

  if (totalUnits <= 15) {
    const score = Math.max(50, Math.round(70 - (totalUnits - 10) * 4));
    return { score, label: "Average", description: "Average efficiency. A few device optimizations can improve your score." };
  }

  const score = Math.max(20, Math.round(50 - Math.min(totalUnits - 15, 15) * 2));
  return { score, label: "Poor", description: "Poor efficiency. High daily usage is pulling your score down." };
}

function renderEfficiency(totalUnits) {
  const efficiency = getEfficiencyData(totalUnits);
  const scoreAngle = `${(efficiency.score / 100) * 360}deg`;
  const tone = efficiency.score >= 90 ? "var(--green)" : efficiency.score >= 70 ? "var(--blue)" : efficiency.score >= 50 ? "var(--orange)" : "var(--red)";

  efficiencyScoreElement.textContent = efficiency.score;
  efficiencyLabelElement.textContent = efficiency.label;
  efficiencyTextElement.textContent = efficiency.description;
  efficiencyBarFillElement.style.width = `${efficiency.score}%`;
  heroEfficiencyValue.textContent = `${efficiency.score} / 100`;
  document.documentElement.style.setProperty("--efficiency-angle", scoreAngle);
  document.documentElement.style.setProperty("--efficiency-tone", tone);
}

function updateMetrics(deviceList, stats) {
  totalUnitsElement.textContent = formatUnits(stats.totalUnits);
  estimatedBillElement.innerHTML = formatCurrency(stats.estimatedBill);
  predictionDailyUnitsElement.textContent = formatUnits(stats.totalUnits);
  predictionMonthlyUnitsElement.textContent = formatUnits(stats.monthlyUnits);
  predictionMonthlyBillElement.innerHTML = formatCurrency(stats.monthlyBill);
  deviceCount.textContent = deviceList.length === 1 ? "1 device" : `${deviceList.length} devices`;
  renderComparison(stats);
  renderEfficiency(stats.totalUnits);
  renderAlerts(stats.totalUnits, stats.estimatedBill);
}

function syncChartState(deviceList) {
  const isEmpty = deviceList.length === 0;
  chartStatus.textContent = isEmpty ? "No devices added yet" : `${deviceList.length} device${deviceList.length === 1 ? "" : "s"} tracked`;
  chartEmptyState.classList.toggle("is-hidden", !isEmpty);
}

function rebuildChart(deviceList) {
  usageChart.data.labels.length = 0;
  usageChart.data.datasets[0].data.length = 0;

  deviceList.forEach((device) => {
    usageChart.data.labels.push(device.name);
    usageChart.data.datasets[0].data.push(Number(device.units.toFixed(2)));
  });

  usageChart.data.datasets[0].backgroundColor = getChartColors(deviceList.length);
  usageChart.update();
  syncChartState(deviceList);
}

function renderDashboard() {
  const stats = finalizeDashboardStats(deriveDashboardStats(devices));
  updateMetrics(devices, stats);
  renderTable(devices);
  renderSuggestions(devices, stats);
  rebuildChart(devices);
  saveDevices();
}

function renderProfile() {
  if (!currentUser) {
    return;
  }

  profileName.textContent = currentUser.name;
  profileEmail.textContent = currentUser.email;
  welcomeText.textContent = `Welcome, ${currentUser.name}. Your personalized dashboard is ready with live device controls, billing projections, and efficiency insights.`;
}

function applyTheme(theme) {
  document.body.classList.toggle("dark-mode", theme === "dark");
  themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
  themeToggleLabel.textContent = theme === "dark" ? "Dark Mode" : "Light Mode";
  themeToggleIcon.textContent = theme === "dark" ? "DK" : "LT";
  localStorage.setItem(themeStorageKey, theme);
  applyChartTheme();
}

function showAuthMessage(message, isError = false) {
  authMessage.textContent = message;
  authMessage.style.color = isError ? "var(--red)" : "var(--green)";
}

function switchAuthTab(tab) {
  const showLogin = tab === "login";
  showLoginTab.classList.toggle("is-active", showLogin);
  showRegisterTab.classList.toggle("is-active", !showLogin);
  loginForm.classList.toggle("is-hidden", !showLogin);
  registerForm.classList.toggle("is-hidden", showLogin);
  showAuthMessage("");
}

function showDashboard() {
  authShell.classList.add("is-hidden");
  appShell.classList.remove("is-hidden");
  renderProfile();
  loadDevices();
  applyFeaturePreferences(getFeaturePreferences());
  renderDashboard();
}

function showAuth() {
  appShell.classList.add("is-hidden");
  authShell.classList.remove("is-hidden");
  loginForm.reset();
  registerForm.reset();
  switchAuthTab("login");
}

function handleRegister(event) {
  event.preventDefault();

  const name = registerName.value.trim();
  const email = registerEmail.value.trim().toLowerCase();
  const password = registerPassword.value.trim();

  if (!name || !email || !password) {
    showAuthMessage("All registration fields are required.", true);
    return;
  }

  const users = getUsers();

  if (users.some((user) => user.email === email)) {
    showAuthMessage("An account with this email already exists.", true);
    return;
  }

  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);
  currentUser = newUser;
  setSession(newUser);
  showDashboard();
}

function handleLogin(event) {
  event.preventDefault();

  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value.trim();

  if (!email || !password) {
    showAuthMessage("Email and password are required.", true);
    return;
  }

  const user = getUsers().find((item) => item.email === email && item.password === password);

  if (!user) {
    showAuthMessage("Invalid email or password.", true);
    return;
  }

  currentUser = user;
  setSession(user);
  showDashboard();
}

function handleFeatureToggleChange(event) {
  const input = event.target;
  const preferences = getFeaturePreferences();
  preferences[input.dataset.featureToggle] = input.checked;
  saveFeaturePreferences(preferences);
  applyFeaturePreferences(preferences);
}

function handleEditProfile() {
  if (!currentUser) {
    return;
  }

  const updatedName = window.prompt("Edit your name", currentUser.name);

  if (!updatedName || !updatedName.trim()) {
    return;
  }

  const users = getUsers().map((user) => (
    user.email === currentUser.email ? { ...user, name: updatedName.trim() } : user
  ));

  saveUsers(users);
  currentUser = users.find((user) => user.email === currentUser.email) || currentUser;
  renderProfile();
}

loginForm.addEventListener("submit", handleLogin);
registerForm.addEventListener("submit", handleRegister);
showLoginTab.addEventListener("click", () => switchAuthTab("login"));
showRegisterTab.addEventListener("click", () => switchAuthTab("register"));

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const power = Number(powerInput.value);
  const hours = Number(hoursInput.value);

  if (!name || power <= 0 || hours <= 0) {
    return;
  }

  devices.push({
    name,
    power,
    hours,
    units: calculateUnits(power, hours)
  });

  form.reset();
  nameInput.focus();
  renderDashboard();
});

clearAllButton.addEventListener("click", () => {
  devices = [];
  form.reset();
  nameInput.focus();
  renderDashboard();
});

deviceTableBody.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-button");

  if (!deleteButton) {
    return;
  }

  const index = Number(deleteButton.dataset.index);

  if (Number.isNaN(index)) {
    return;
  }

  devices.splice(index, 1);
  renderDashboard();
});

themeToggle.addEventListener("click", () => {
  applyTheme(getTheme() === "light" ? "dark" : "light");
});

featureToggleInputs.forEach((input) => {
  input.addEventListener("change", handleFeatureToggleChange);
});

logoutButton.addEventListener("click", () => {
  clearSession();
  currentUser = null;
  devices = [];
  showAuth();
});

editProfileButton.addEventListener("click", handleEditProfile);

applyTheme(getStoredTheme());
currentUser = getCurrentUserFromStorage();

if (currentUser) {
  showDashboard();
} else {
  showAuth();
}
