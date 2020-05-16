var config = require("../config");
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(config.Keys.Mandrill.key);

/**
 * @param {Array} User 
 * @param {string} subject 
 * @param {string} header
 * @param {string} body
 */
var recommendation = exports.recommendation = function (data, callback) {
  var template_name = "Recommendation";
  var template_content = [{
    "name": "Recommendation",
    "content": "Recommendation"
  }];
  var message = {
    "subject": data.subject,
    "from_email": "contacto@lookatmobile.com",
    "from_name": "lookat",
    "to": data.User,
    "headers": {
      "Reply-To": "contacto@lookatmobile.com"
    },
    "important": true,
    "track_opens": true,
    "track_clicks": false,
    "auto_text": true,
    "auto_html": true,
    "inline_css": true,
    "url_strip_qs": null,
    "preserve_recipients": null,
    "view_content_link": null,
    "tracking_domain": "lookatmobile.com",
    "signing_domain": null,
    "return_path_domain": null,
    "merge": true,
    "merge_language": "mailchimp",
    "global_merge_vars": [
    {
      "name": "Header",
      "content": data.header
    },
    {
      "name": "body",
      "content": data.body
    }],
    "tags": [
      "feedbackUser"
    ]
  };
  var async = false;
  mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async}, function(result) {
    callback({ status: "success" })
  });
}
