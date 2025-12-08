#!/bin/bash

skip_git = $0

if [ $# -eq 0 ]; then
    git reset --hard HEAD
    git pull
fi
export VITE_API_URL=
export VITE_SOCKET_URL=
export VITE_API_TIMEOUT=5000
export VITE_GA4_MEASUREMENT_ID='G-YSXHFW8BVQ'


export REACT_APP_API_URL=
export REACT_APP_SOCKET_URL=/socket
export REACT_APP_API_TIMEOUT=5000

export MIX_ENV=prod

npm i --prefix ./../party-game-ui/
npm run build --prefix ./../party-game-ui/
mix compile 
mix phx.digest
mix phx.gen.release
mix release --overwrite --force
#_build/prod/rel/party_game/bin/party_game start
sudo systemctl restart buzzgames.service
