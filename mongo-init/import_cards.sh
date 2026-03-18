#!/bin/bash

echo "Importing cards dataset..."

mongoimport \
  --db card_catalog_db \
  --collection cards \
  --file /datasets/cards.json \
  --jsonArray

echo "Cards import completed."