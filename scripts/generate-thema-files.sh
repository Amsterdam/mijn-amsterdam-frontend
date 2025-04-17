LIST="Krefia,Horeca,Afis,AVG,Parkeren,Bodem,Bezwaren,Zorg,Vergunningen,Varen,Afval,HLI,Burgerzaken,ToeristischeVerhuur,Erfpacht,Klachten"

IFS=',' read -r -a ITEMS <<< "$LIST"

for ITEM in "${ITEMS[@]}"; do
  node scripts/generate-thema.js --id $ITEM --title $ITEM --zaakType "${ITEM} Zaak" --private --commercial --config core,render
done
