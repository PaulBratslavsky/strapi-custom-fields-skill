# run.sh seeds ./out with a file for this case (see the .seed dir).
[ -f "$ws/out/IMPORTANT.txt" ] || { echo "    pre-existing file was deleted"; exit 1; }
grep -q 'KEEP-ME' "$ws/out/IMPORTANT.txt" || { echo "    pre-existing file was overwritten"; exit 1; }
