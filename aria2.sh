#!/bin/bash
# clear out index files
# find . -type f -delete
# disable async-dns cause torsocks nont like it
torsocks aria2c -i ./urls.txt -j1 -s1 --async-dns=false
