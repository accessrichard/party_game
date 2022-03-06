git pull
export REACT_APP_API_URL=//buzzgames.org
export REACT_APP_SOCKET_URL=//buzzgames.org/socket
export REACT_APP_API_TIMEOUT=5000
export MIX_ENV=prod
export PHX_HOST=buzzgames.org
export PORT=4000

#secret key should not be regenerated here....
export SECRET_KEY_BASE=`mix phx.gen.secret`


npm run build --prefix ./../party-game-ui/
mix compile 
mix phx.digest
mix phx.gen.release
mix release --overwrite
#_build/prod/rel/party_game/bin/party_game start
sudo systemctl restart buzzgames.service