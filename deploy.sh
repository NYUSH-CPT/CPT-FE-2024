#!/bin/bash

docker pull ghcr.nju.edu.cn/harrilee/cpt-fe-2024@$IMAGE_SHA

# Stop the current container

if [ "$(docker ps -q -f name=cpt-fe)" ]; then
    docker stop cpt-fe || true
    docker rm cpt-fe || true

else
    echo "Container cpt-fe does not exist. Creating a new one."
fi

# Start a new container with the latest image
docker run \
    -e "NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL" \
    -e "NEXT_PUBLIC_CONVERSATION_GAP=$NEXT_PUBLIC_CONVERSATION_GAP" \
    -e "NEXT_PUBLIC_PROJECT_NAME=$NEXT_PUBLIC_PROJECT_NAME" \
    -e "NEXT_PUBLIC_SHUFFLE_ARRAY_FLAG=$NEXT_PUBLIC_SHUFFLE_ARRAY_FLAG" \
    -d --name cpt-fe -p 3000:3000 ghcr.nju.edu.cn/harrilee/cpt-fe-2024@$IMAGE_SHA

docker system prune -f