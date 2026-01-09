#!/bin/bash
# Cloudinary bilgilerini güncelle

sed -i '' 's/CLOUDINARY_CLOUD_NAME=karasuemlak/CLOUDINARY_CLOUD_NAME=dqucm2ffl/g' .env.local
sed -i '' 's/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=karasuemlak/NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dqucm2ffl/g' .env.local

echo "✅ Cloudinary cloud_name güncellendi!"
grep "CLOUDINARY_CLOUD_NAME" .env.local
