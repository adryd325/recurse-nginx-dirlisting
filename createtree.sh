#!/bin/bash
# using --spider first is a stupid workaround for https://savannah.gnu.org/bugs/?42180
# since --spider is actually able to create the directory tree
wget -e robots=off --no-parent -r -l inf --spider --accept-regex '.*/$|.*/index.html$' $1
wget -e robots=off --no-parent -r -l inf --accept-regex './*$|.*/index.html$' $1
 
