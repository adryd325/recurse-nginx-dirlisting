# disable async-dns cause torsocks nont like it
aria2c -i ./urls.txt -j 10 --async-dns=false
