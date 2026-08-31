# ══════════════════════════════════════════════════════════════
# Registry Push Instructions for Montréal 2033
# ══════════════════════════════════════════════════════════════

# STEP 1: Authenticate to your registry
# For GitHub Container Registry (ghcr.io):
#   docker login ghcr.io -u positivemike33
#   (Use a GitHub Personal Access Token with 'write:packages' scope)
#   Generate at: https://github.com/settings/tokens?type=beta&scopes=write:packages
#
# For Docker Hub (docker.io):
#   docker login -u positivemike33

# STEP 2: Tag your images
# GitHub Container Registry:
docker tag montreal-2033-neural-overload:latest ghcr.io/positivemike33/montreal-2033-neural-overload:latest
docker tag montreal-2033-openosint:latest ghcr.io/positivemike33/montreal-2033-openosint:latest

# Or Docker Hub:
# docker tag montreal-2033-neural-overload:latest positivemike33/montreal-2033-neural-overload:latest
# docker tag montreal-2033-openosint:latest positivemike33/montreal-2033-openosint:latest

# STEP 3: Push to registry
# GitHub Container Registry:
docker push ghcr.io/positivemike33/montreal-2033-neural-overload:latest
docker push ghcr.io/positivemike33/montreal-2033-openosint:latest

# Or Docker Hub:
# docker push positivemike33/montreal-2033-neural-overload:latest
# docker push positivemike33/montreal-2033-openosint:latest

# STEP 4: Update docker-compose.yml image references:
# neural-overload:
#   image: ghcr.io/positivemike33/montreal-2033-neural-overload:latest
# sophia-openosint:
#   image: ghcr.io/positivemike33/montreal-2033-openosint:latest

# STEP 5: Deploy from registry
# docker compose pull
# docker compose up -d
