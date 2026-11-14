#!/bin/bash
cd "$(dirname "$0")"
{ cat src/01-head.html; cat src/02-body.html; echo '<script>'; cat src/03-data.js src/04-pixel.js src/05-app.js src/06-activities.js src/07-campus.js src/08-social.js src/09-init.js; echo '</script>'; } > cybersity.html
