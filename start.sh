pm2 stop admin
pm2 delete admin

git stash
git fetch
git pull
npm install
npm run build

PORT=3000 pm2 start npm --name "admin" -- run start

pm2 save
