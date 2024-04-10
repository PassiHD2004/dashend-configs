let sex = false;
let sex2 = false;

// my "struct"
let profile_data = {
  id: 0,
  bio: null,
  pronouns: null,
  // socials
  website: null,
  social_github: null,
  social_bluesky: null,
  social_fediverse: null,
  social_discord: null,
  social_matrix: null,
  social_tumblr: null,
  social_myspace: null,
  social_facebook: null,
};
let profile_original;

let parsed_pronouns = [];

const url_params = new URLSearchParams(document.location.hash);
console.log(url_params);

let token = url_params.get("#token") || url_params.get("token");
let user_id = url_params.get("#id") || url_params.get("id");

console.log("token: " + token);
console.log("user_id: " + user_id);

// window.location = window.location.toString().replace(window.location.hash, "");

fetch("https://gd-backend.foxgirl.wtf/api/v1/profiles/" + user_id)
  .then(response => response.json())
  .then(data => {
    // copy every key
    for (let key in data["data"]) {
      profile_data[key] = data["data"][key];
    }
    profile_original = profile_data;
    if (sex) {
      init_ui();
    } else {
      sex = true;
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  console.log("loaded!");

  if (sex) {
    init_ui();
  } else {
    sex = true;
  }
});

setTimeout(() => {
  if (!sex2) {
    document.getElementById("loading-text").innerHTML = "error (timeout)";
  }
}, 5000);

function parse_pronouns(pronouns) {
  let parsed = [];

  pronouns.split("/").forEach(pronoun => {
    if (pronoun == "her" || pronoun == "him" || pronoun == "them" || pronoun == "its") return; // if its the secondary part, ignore
    parsed.push(pronoun);
  });

  console.log(parsed);
  return parsed;
}

function get_ui_name_for_key(key) {
  switch (key) {
    case "website":
      return ["Website", "example.org"];
    case "social_github":
      return ["GitHub", "github user name"];
    case "social_bluesky":
      return ["Bluesky", "Bluesky Handle"];
    case "social_fediverse":
      return ["Fediverse", "@user@example.org"];
    case "social_discord":
      return ["Discord", "discord tag"] // TODO: discord needs special handling (maybe client side oauth?)
    case "social_matrix":
      return ["Matrix", "@user:example.org"];
    case "social_tumblr":
      return ["Tumblr", "user.tumblr.com"]
    case "social_myspace":
      return ["MySpace", "do people use this? :trol:"]
    case "social_facebook":
      return ["Facebook", "h"]
    default:
      return null;
  }
}

function init_ui() {
  // create form
  let form = document.getElementById("form_socials");

  for (let key in profile_data) {
    if (key == "id" || key == "pronouns" || key == "bio") continue;
    let ui_name = get_ui_name_for_key(key) || [key, "?"];
    let div = document.createElement("div");
    div.classList.add("row");

    let sub_div_label = document.createElement("div");
    sub_div_label.classList.add("col-25");

    let label = document.createElement("label");
    label.innerHTML = ui_name[0];
    sub_div_label.appendChild(label);

    let sub_div_input = document.createElement("div");
    sub_div_input.classList.add("col-75");

    let input = document.createElement("input");
    input.type = "text";
    input.id = "form_" + key;
    input.name = ui_name[0];
    input.placeholder = ui_name[1];
    input.autocomplete = "off";
    input.oninput = function () {
      profile_data[key] = input.value == "" ? null : input.value;
    }
    sub_div_input.appendChild(input);

    div.appendChild(sub_div_label);
    div.appendChild(sub_div_input);
    form.appendChild(div);
  }

  parsed_pronouns = parse_pronouns(profile_data.pronouns || "");
  // set pronouns initially
  let set = 0;
  parsed_pronouns.forEach(pronoun => {
    set++;
    document.getElementById("pronoun-set-" + set).value = pronoun;
  });
  // todo add change listener to pronouns

  update_ui();
}

function update_ui() {
  sex2 = true;
  // piss off loading prompt
  document.getElementById("loading-container").style.display = "none";

  // set form values
  //document.getElementById("form_bio").value = profile_data.bio;

  // yeah...
  for (let key in profile_data) {
    if (key == "id" || key == "pronouns") continue;
    console.log("key: "+ key);
    document.getElementById("form_"+key).value = profile_data[key];
  }
}

/*
  document.getElementById('profileForm').addEventListener('submit', function (event) {
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
    xhr.onreadystatechange = function () {
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
  */