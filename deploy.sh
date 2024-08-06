#!/bin/bash

docker pull ghcr.nju.edu.cn/harrilee/cpt-fe-2024:production

# Stop the current container
docker stop cpt-fe || true
docker rm cpt-fe || true

# Start a new container with the latest image
docker run -d --name cpt-fe -p 3000:3000 ghcr.nju.edu.cn/harrilee/cpt-fe-2024:production