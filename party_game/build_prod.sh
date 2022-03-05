
export SECRET_KEY_BASE=`mix phx.gen.secret`
export MIX_ENV=prod
export PHX_HOST=buzzgames.org
export PORT=4000


npm run build --prefix ./../party-game-ui/
mix compile 
mix phx.gen.release
mix release --overwrite
_build/prod/rel/party_game/bin/party_game start