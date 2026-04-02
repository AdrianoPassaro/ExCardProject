#!/bin/bash
echo "Importing cards into card_catalog_db..."

mongoimport --host mongo --port 27017 \
  --db card_catalog_db \
  --collection cards \
  --type json \
  --file /datasets/cards.json \
  --jsonArray

echo "Import finished"