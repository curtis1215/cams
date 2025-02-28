#!/bin/bash

echo "Deploying CAMS application..."

# 解壓縮文件
tar -xzvf cams-dist.tar.gz -C /var/www/html/cams

echo "Deployment completed successfully!"
