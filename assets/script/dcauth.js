const url_params = new URLSearchParams(document.location.hash);
let access_token = url_params.get("#access_token") || url_params.get("access_token");

if (access_token) {
    fetch("https://discord.com/api/v9/users/@me", {
        headers: {
            "Authorization": "Bearer " + access_token
        }
    }).then(response => response.json())
    .then(data => {
        // put user in local storage
        console.log(data);
        localStorage.setItem("discord_user", JSON.stringify(data));
        document.getElementById("loading-container").style.display = "none";
        document.getElementById("user-info-hehe").innerHTML = "you can now close this tab and return to the editor!";
    }).catch(error => {
        console.error("Error:", error);
    });
}