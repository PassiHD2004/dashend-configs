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

let discord_check_interval;

const url_params = new URLSearchParams(document.location.hash);

let token = url_params.get("#token") || url_params.get("token");
let user_id = url_params.get("#id") || url_params.get("id");
let development = url_params.get("#development") || url_params.get("development");

console.log("token: " + token);
console.log("user_id: " + user_id);

if (development != "true") {
  history.pushState("", document.title, window.location.pathname + window.location.search);
}

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

  return parsed;
}

function get_modified_pronouns(pronouns, set, pronoun) {
  // pronouns is an array!! important!! (no i wont use typescript)
  if (pronouns.length < set) {
    pronouns.length = set;
  }

  // the code flow wants pronoun to be set, even if we're removing it
  if (pronoun == "" || pronoun == null) {
    pronoun = pronouns[set - 1];
  }

  if (pronouns[set - 1] == pronoun) {
    if (set == 1 && pronouns.length == 1) {
      return "";
    }
    pronouns.splice(set - 1, 1);
  } else {
    if (!(set > 1 && (pronouns[set - 2] == pronoun || set > 2 && pronouns[set - 3] == pronoun))) {
      pronouns[set - 1] = pronoun;
    } else {
      pronouns.splice(set - 1, 1);
    }
  }

  let pronoun_set_count = pronouns.length;
  let new_pronouns = "";

  for (let i = 0; i < pronoun_set_count; i++) {
    let p = pronouns[i];
    if (!(p == "" || p == null)) {
      new_pronouns += p + "/";
    } else {
      pronoun_set_count--;
    }
  }
  new_pronouns = new_pronouns.slice(0, -1);

  if (pronoun_set_count == 1) {
    second_pronoun = null;
    switch (new_pronouns) {
      case "they": {
        second_pronoun = "them";
        break;
      }
      case "it": {
        second_pronoun = "its";
        break;
      }
      case "she": {
        second_pronoun = "her";
        break;
      }
      case "he": {
        second_pronoun = "him";
        break;
      }
    }
    if (second_pronoun != null) {
      new_pronouns += "/" + second_pronoun;
    }
  }

  return new_pronouns;
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
    sub_div_input.classList.add("col-idk");

    if (key != "social_discord") {
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
    } else {
      let status_wrapper = document.createElement("div");
      status_wrapper.classList.add("col-eat-ass");

      let status = document.createElement("input");
      status.type = "text";
      status.autocomplete = "off";
      status.disabled = "true";
      status.innerHTML = "?";
      status.id = "form_" + key;
      status_wrapper.appendChild(status);

      sub_div_input.appendChild(status_wrapper);

      let button_wrapper = document.createElement("div");
      button_wrapper.classList.add("col-eat-shit");

      let button = document.createElement("button");
      button.innerHTML = "Link";
      button.onclick = function () {
        localStorage.removeItem("discord_user"); // remove old account information
        profile_data["social_discord"] = "";
        update_ui();

        // i should maybe not hardcode this but who cares lmao
        let url = "https://discord.com/oauth2/authorize?client_id=1228059447490908292&response_type=token&redirect_uri=http%3A%2F%2F0.0.0.0%3A5500%2Fdcauth.html&scope=identify";
        window.open(url, "_blank");

        discord_check_interval = setInterval(() => {
          query_discord_stuff();
        }, 100);
      };
      button_wrapper.appendChild(button)
      sub_div_input.appendChild(button_wrapper);
    }

    div.appendChild(sub_div_label);
    div.appendChild(sub_div_input);
    form.appendChild(div);
  }

  document.getElementById("form_bio").oninput = function () {
    let meow = document.getElementById("form_bio");
    profile_data.bio = meow.value == "" ? null : meow.value;
    let step_1 = fix_up_hex_tags(profile_data.bio || "");
    console.log("step 1: " + step_1);
    let step_2 = fix_up_normal_tags(step_1);
    console.log("step 2: " + step_2);
    let step_3 = marked.parse(step_2.replaceAll("\n", "\n\n")).replaceAll("</h1>", "</h1><hr>");
    console.log("step 3: " + step_3);
    let step_4 = add_colors_for_tags(step_3);

    document.getElementById("bio-preview").innerHTML = step_4;
  }

  document.getElementById("form_bio").oninput();

  for (i = 0; i < 3; i++) {
    document.getElementById("pronoun-set-" + (i + 1)).onchange = function () {
      let set = parseInt(this.id.split("-")[2]); // wow ok i hate this shit
      let pronoun = this.value;

      let new_pronouns = get_modified_pronouns(parse_pronouns(profile_data.pronouns), set, pronoun);
      profile_data.pronouns = new_pronouns;
      update_ui();
    }
  }

  update_ui();
}

function query_discord_stuff() {
  console.log("query_discord_stuff");
  // check if discord_user is set in localStorage
  let discord_user = localStorage.getItem("discord_user");

  if (discord_user != null) {
    console.log("got discord user !!");
    // unset interval
    clearInterval(discord_check_interval);

    let discord_user_json = JSON.parse(discord_user);
    let discord_id = discord_user_json["id"];
    let discord_username = discord_user_json["username"];
    profile_data.social_discord = discord_username + ":" + discord_id;

    update_ui();
  }
}

function update_ui() {
  sex2 = true;
  // piss off loading prompt
  document.getElementById("loading-container").style.display = "none";

  let parsed_pronouns = parse_pronouns(profile_data.pronouns || "");
  for (i = 0; i < 3; i++) {
    document.getElementById("pronoun-set-" + (i + 1)).value = parsed_pronouns[i] || "";
  }

  if (profile_data.pronouns == "he/she/it") {
    // german easter :egg:
    document.getElementById("pronouns-preview").innerHTML = "he, she, it - das S muss mit! (" + profile_data.pronouns + ")";
  } else {
    document.getElementById("pronouns-preview").innerHTML = profile_data.pronouns;
  }

  // yeah...
  for (let key in profile_data) {
    if (key == "id" || key == "pronouns" || key == "social_discord") continue;
    document.getElementById("form_" + key).value = profile_data[key];
  }

  document.getElementById("form_social_discord").value = profile_data.social_discord || "not linked";
}

function save_stuff() {
  let body = JSON.stringify(profile_data);
  console.log(body);
  fetch("https://gd-backend.foxgirl.wtf/api/v1/profiles/13949595", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: body,
  }).then(response => {
    if (response.ok) {
      alert("saved !! :3");
    } else {
      alert("failed to save data: " + response.status);
    }
  });
}

function fix_up_hex_tags(meow) {
  // hex color tags are in the format <c hex> and always end with a </c>
  // sadly, the space causes marked to not recognize it as a tag
  // so we have to fix it up

  let color_tag = /<c ([0-9a-fA-F]{6})>(.*.)<\/c>/g;

  // deal with inner tags too
  while (color_tag.test(meow)) {
    meow = meow.replace(color_tag, "<c-$1>$2</c-$1>");
  }

  return meow;
}

function fix_up_normal_tags(meow) {
  let unfixed_color_tag = /<c([abgljyorp])>(.*.)<\/c>/g;

  while (unfixed_color_tag.test(meow)) {
    meow = meow.replace(unfixed_color_tag, "<c$1>$2</c$1>");
  }

  return meow;
}

function add_colors_for_tags(meow) {
  document.getElementById("cursed-color-stuff").innerHTML = "";

  let original = meow;
  let tag = /<c-([0-9a-fA-F]{6})>/g;

  let matches = meow.matchAll(tag);

  for (let match of matches) {
    let color = match[1];
    document.getElementById("cursed-color-stuff").innerHTML += "c-" + color + "{ color: #" + color + ";}";
  }

  return original;
}
