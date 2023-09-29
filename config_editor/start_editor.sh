# Python HTTP Server
#open http://127.0.0.1:8000
#python3 -m http.server -b 127.0.0.1

# Raw File Access
open "file://$(sed "s/ /%20/g" <<< "$(pwd)")/index.html" &> /dev/null
open "file://$(sed "s/ /%20/g" <<< "$(pwd)")/config_editor/index.html" &> /dev/null