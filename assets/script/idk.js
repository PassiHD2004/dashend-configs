document.addEventListener("DOMContentLoaded", function() {
document.getElementById('profileForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission
  
  // Collect form data
  var formData = {
    pronoun1: document.getElementById('pronoun.1').value,
    pronoun2: document.getElementById('pronoun.2').value,
    pronoun3: document.getElementById('pronoun.3').value,
    discord: document.getElementById('discord').value,
    // Collect other form fields similarly
  };
  
  // Convert form data to JSON
  var jsonData = JSON.stringify(formData);
  
  // Send JSON data to server
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://172.27.40.146:82', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        console.log('Data sent successfully');
        // Handle success
      } else {
        console.error('Error sending data');
        // Handle error
      }
    }
  };
  xhr.send(jsonData);
});
});