function onElementReady(querySelector,callBack) {
  if (document.querySelector(querySelector)) {
    callBack();
  } else {
    setTimeout(() => onElementReady.call(this,...arguments), 100);
  }
}

function handleUpdate(isAddPage) {
  const root = document.getElementById("rss_mergefeed_root");
  if (root == null) { 
    alert("Unable to find root div")
    return;
  }
  
  const items = root.getElementsByClassName("rss_mergefeed_item_url");
  if (items == null || items.length == 0) {
    alert("No merge feed inputs found, nothing to update.");
    return;
  }
  
  urls = [];
  for(var i=0, j=0; i < items.length; i++) {
    var value = items[i].value;
    if (value != null && value.length > 0) {
      urls[j++] = value;
    }
  }
  
  var url = urls.length == 0 ? "" : urls[0];
  
  // Only use the bridge url format if there is more than one url.
  if (urls.length > 1) {
    url = MERGEFEED_RSSBRIDGE_HOST + "/?action=display&bridge=" + MERGEFEED_RSSBRIDGE_NAME + "&feed_name=";
    for (var i=0; i < 10; i++) {
      url += "&feed_" + (i+1) + "=" + encodeURIComponent(urls[i] || "");
    }
    url += "&limit=" + MERGEFEED_BRIDGE_LIMIT + "&format=Atom"
  }
  
  const url_control = document.getElementById(isAddPage ? "url_rss" : "url");
  url_control.value = url;
}

function handleButtonAddRemove(amount, isAddPage) {
  const root = document.getElementById("rss_mergefeed_root");
  if (root == null) { 
    alert("Unable to find root div")
    return;
  }
  
  const inputs_div = document.getElementById("rss_mergefeed_inputs");
  if (inputs_div == null) {
    alert("Failed to retrieve the inputs div");
    return;
  }
  
  const items = inputs_div.getElementsByClassName("rss_mergefeed_item_div");
  if (items == null) {
    alert("Failed to retrieve the items div");
    return;
  }
  
  if (items.length >= 10 && amount > 0) {
    alert("Added the maximum number of merge feeds.");
    return;
  }
  else if (items.length == 1 && amount < 0) {
    return;
  }
  
  if (amount > 0) {
    addNewInputDiv(inputs_div, (items.length + 1), "", isAddPage);
  }
  else if(amount < 0) {
    inputs_div.removeChild(items[items.length - 1]);
  }
  else {
    alert("Unknown amount value in handleButtonAddRemove.");
  }
  
  if (MERGEFEED_AUTO_UPDATE) {
    handleUpdate(isAddPage);
  }
}

function addNewInputDiv(inputs_div, number, url, isAddPage) {
  var div = document.createElement("div");
  div.className = "rss_mergefeed_item_div";
  
  var input = document.createElement("input");
  input.className = "rss_mergefeed_item_url " + (isAddPage ? "" : "w100");
  input.id = "rss_mergefeed_item_url_" + number;
  input.required = true;
  input.value = decodeURIComponent(url);
  if (MERGEFEED_AUTO_UPDATE) {
    input.oninput = () => handleUpdate(isAddPage);
  }
  div.appendChild(input);
  
  inputs_div.appendChild(div);
}

function addNewControls(group_control, matches, url, isAddPage) {
  var root = document.createElement("div");
  root.id = "rss_mergefeed_root";
  
  var inputs_div = document.createElement("div");
  inputs_div.id = "rss_mergefeed_inputs";
  
  if (matches == null || matches.length == 0) {
    addNewInputDiv(inputs_div, 1, url, isAddPage);
  }
  else {
    for (var i=0, j=0; i < matches.length; i++) { 
      const match = matches[i];
      if (match != null && match.length > 0) {
        addNewInputDiv(inputs_div, ++j, match, isAddPage);
      }
    }
  }
  root.appendChild(inputs_div);
  
  if (MERGEFEED_AUTO_UPDATE == false) {
    var button_update = document.createElement("button");
    button_update.className = "btn";
    button_update.type = "button";
    button_update.innerHTML = "Update"
    button_update.onclick = () => handleUpdate(isAddPage);
    root.appendChild(button_update);
  }
  
  var button_add = document.createElement("button");
  button_add.className = "btn";
  button_add.type = "button";
  button_add.innerHTML = "+1"
  button_add.onclick = () => handleButtonAddRemove(1, isAddPage);
  root.appendChild(button_add);
  
  var button_remove = document.createElement("button");
  button_remove.className = "btn";
  button_remove.type = "button";
  button_remove.innerHTML = "-1"
  button_remove.onclick = () => handleButtonAddRemove(-1, isAddPage);
  root.appendChild(button_remove);
  
  if (MERGEFEED_AUTO_UPDATE == false) {
    var button_reset = document.createElement("button");
    button_reset.className = "btn";
    button_reset.type = "button";
    button_reset.innerHTML = "Reset"
    button_reset.onclick = () => {
        if (isAddPage) {
            pageAdd_handleEventAddControls();
        }
        else {
          pageEdit_handleEventAddControls();
        }
    }
    root.appendChild(button_reset);
  }

  group_control.appendChild(root);
}

function addNewGroupControl(form, form_groups, index) {
  const form_group = document.createElement("div");
  form_group.id = "rss_mergefeed_formgroup";
  form_group.className = "form-group rss_mergefeed_formgroup";
  form.insertBefore(form_group, form_groups[index]);
  
  const label = document.createElement("label");
  label.className = "group-name";
  label.htmlFor = "rss_mergefeed_item_url_1";
  label.innerHTML = MERGEFEED_LABEL_TEXT_MERGE;
  form_group.appendChild(label);
  
  const div = document.createElement("div");
  div.className = "group-controls";
  form_group.appendChild(div);
  
  return div;
}

function getMatches(url) {
  var matches = /&feed_1=([^&]*)&feed_2=([^&]*)&feed_3=([^&]*)&feed_4=([^&]*)&feed_5=([^&]*)&feed_6=([^&]*)&feed_7=([^&]*)&feed_8=([^&]*)&feed_9=([^&]*)&feed_10=([^&]*)/gi.exec(url);
  if (matches != null) {
    matches = matches.slice(1);
  }
  return matches;
}

function pageEdit_handleEventAddControls() {
  const url_control = document.getElementById("url");
  const url_value = url_control.value;
  
  // Delete previous elements if they exist  
  const root = document.getElementById("rss_mergefeed_formgroup");
  if (root != null) { 
   root.remove();
  }
  
  var matches = getMatches(url_value);
  const feed_update = document.getElementById("feed_update");
  const form = feed_update.getElementsByTagName("fieldset")[0];
  if (form != null) {
    const form_groups = form.getElementsByClassName("form-group");
    for(var i = 0; i < form_groups.length; i++) {
      const form_group = form_groups[i];
      const form_title = form_group.getElementsByClassName("group-name")[0];
      if (form_title != null && form_title.textContent === MERGEFEED_LABEL_TEXT) {
        const group_control = addNewGroupControl(form, form_groups, i + 1);
        addNewControls(group_control, matches, url_value, false);
        break;
      }
    }
  }
}

function pageAdd_handleEventAddControls() {
  const url_control = document.getElementById("url_rss");
  const url_value = url_control.value;
  
  // Delete previous elements if they exist  
  const root = document.getElementById("rss_mergefeed_formgroup");
  if (root != null) { 
   root.remove();
  }
  
  var matches = getMatches(url_value); 
  const form = document.getElementById("add_rss");
  if (form != null) {
    const form_groups = form.getElementsByClassName("form-group");
    for(var i = 0; i < form_groups.length; i++) {
      const form_group = form_groups[i];
      const form_title = form_group.getElementsByClassName("group-name")[0];
      if (form_title != null && form_title.textContent === MERGEFEED_LABEL_TEXT) {
        const group_control = addNewGroupControl(form, form_groups, i + 1);
        addNewControls(group_control, matches, url_value, true);
        break;
      }
    }
  }
}

// Edit page
onElementReady("#url", () => {
  pageEdit_handleEventAddControls();
  document.getElementById("url").addEventListener("input", pageEdit_handleEventAddControls);
  document.getElementById("url").addEventListener("change", pageEdit_handleEventAddControls);
  document.getElementById("slider").addEventListener("freshrss:slider-load", pageEdit_handleEventAddControls);
});

// Add page
onElementReady("#url_rss", () => {
  pageAdd_handleEventAddControls();
  document.getElementById("url_rss").addEventListener("input", pageAdd_handleEventAddControls);
  document.getElementById("url_rss").addEventListener("change", pageAdd_handleEventAddControls);
});
