function frameping() {
  Array.prototype.slice.call(parent).forEach(function(frame) {
    try {
      if (frame.isStyleFrame) {
        console.debug("interwiki-style fire")
        frame.styleFire();
      }
    } catch (error) {
      // If an interwikiFrame in the parent isn't ready to receive a style
      // change request, that's fine - it will pull the style from this
      // styleFrame when it's ready
      if (!(error instanceof DOMException)) {
        // All other errors must be reported
        throw error;
      }
    }
  });
}

function requestStyleChange(request) {
  var priorityRaw = getQueryString(request, "priority");
  var priority = Number(priorityRaw);
  if (isNaN(priority)) {
    console.error("Interwiki: rejected style with priority" + priorityRaw);
    return;
  }

  var theme = getQueryString(request, "theme");
  if (theme) addExternalStyle(priority, urlFromTheme(siteUrl, theme));

  var css = getQueryString(request, "css");
  if (css) addInternalStyle(priority, css);
}


function getQueryString(query, name) {
  // Get query parameters from the URL
  if (query.indexOf("?") === 0) query = query.substring(1);
  var parameters = query.split("&");
  // Iterate parameters in reverse so later values override earlier ones
  parameters.reverse();
  // Find the parameter whose key is the given name
  var matchingParameter = parameters.find(function (parameter) {
    return parameter.indexOf(name + "=") === 0;
  });
  if (matchingParameter == null) return "";
  // Return the part of the parameter following the "="
  return decodeURIComponent(matchingParameter.substring(name.length + 1));
}


function addInternalStyle(priority, css) {
  // Check that the incoming CSS doesn't duplicate an existing style
  var styleElements = Array.prototype.slice.call(
    document.head.querySelectorAll("style.custom-style")
  );
  if (styleElements.some(duplicatesStyle(priority, css))) return;

  // Create a new style elements for the CSS
  var style = document.createElement("style");
  style.innerText = css;

  // Insert the style into the appropriate position in the head
  insertStyle(priority, style);
}

function addExternalStyle(priority, url) {
  // Check that the incoming link doesn't duplicate an existing style
  var linkElements = Array.prototype.slice.call(
    document.head.querySelectorAll("link.custom-style")
  );
  if (linkElements.some(duplicatesStyle(priority, url))) return;

  // Create a new link element for the stylesheet
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;

  // Insert the link into the appropriate position in the head
  insertStyle(priority, link);
}

function insertStyle(newPriority, newStylingElement) {
  newStylingElement.classList.add("custom-style");
  newStylingElement.dataset.priority = newPriority;
  var stylingElements = Array.prototype.slice.call(
    document.head.querySelectorAll("link.custom-style, style.custom-style")
  );

  // Attempt to insert the element between other existing elements
  var newTagName = newStylingElement.tagName;
  var wasInserted = stylingElements.some(function (stylingElement) {
    var priority = Number(stylingElement.dataset.priority);
    var tagName = stylingElement.tagName;

    // If the new priority is more than the current priority, continue
    if (newPriority > priority) return false;

    // If the two priorities are equal...
    if (priority === newPriority) {
      // Two styles are not supposed to have the same priority, but a
      // single link and style with the same priority is allowed. In this
      // case the style has slightly higher priority than the link
      if (tagName === "LINK" && newTagName === "STYLE") {
        // The style is allowed to be inserted after the link, so continue
        return false;
      }

      if (tagName === newTagName) {
        // Two elements of the same tag with the same priority are not
        // allowed - raise a warning about it, but add them anyway
        console.error(
          "Interwiki: encountered two " +
            (tagName === "LINK" ? "themes" : "CSS styles") +
            " with the same priority (" +
            priority +
            ") - result may not be as expected"
        );
        // Fall back to insertion
      }

    }

    document.head.insertBefore(newStylingElement, stylingElement);
    return true;
  });

  if (!wasInserted) {
    // The element would not have been inserted if it is the first, or if
    // its priority is greater than all existing priorities
    document.head.appendChild(newStylingElement);
  }
}

function duplicatesStyle(priority, value) {
  var isDuplicate = function (styleElement) {
    if (Number(styleElement.getAttribute("data-priority")) !== priority) {
      return false;
    }
    if (styleElement.tagName === "LINK") {
      return styleElement.getAttribute("href") === value;
    }
    if (styleElement.tagName === "STYLE") {
      return styleElement.innerText === value;
    }
    return false;
  };
  return isDuplicate;
}

function urlFromTheme(siteUrl, theme) {
  // If the theme is already a full URL, return it
  if (theme.indexOf("http") === 0 || theme.indexOf("//") === 0) {
    return theme;
  }

  // If the interwiki's site URL is not known, the full URL for a relative
  // theme cannot be constructed
  if (!siteUrl) {
    console.error(
      "Interwiki: could not resolve relative fullname (" +
        theme +
        ") for unconfigured site. Consider using a full URL instead."
    );
    return "";
  }

  // Assume it's a fullname
  if (theme.indexOf("/") === -1) {
    return siteUrl + "/local--code/" + theme + "/1";
  }
  // Assume of the form <fullname>/code/1
  var themeParts = theme.split("/");
  if (themeParts.length >= 3 && themeParts[1] === "code") {
    return siteUrl + "/local--code/" + themeParts[0] + "/" + themeParts[2];
  }
  // If none of those worked, report the error
  console.error("Interwiki: unknown theme location:" + theme);
  return "";
}