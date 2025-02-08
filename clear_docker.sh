#!/bin/bash

echo "Removing all Docker containers..."
sudo docker rm --force $(sudo docker ps -aq)

echo "Removing all Docker images..."
sudo docker rmi $(sudo docker images -q)

echo "Removing all Docker volumes..."
sudo docker volume rm $(sudo docker volume ls -q)

echo "Cleanup completed."