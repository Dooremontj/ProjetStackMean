@echo off
set path=..\npm-global;%path%
ng serve --port 4200 --host 127.0.0.1 --proxy-config proxy.conf.json -o
