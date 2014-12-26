all: fcgi-app

fcgi-app: fcgi-zen.so

fcgi-zen.so: ZenClass.cpp.o
	gcc -shared ZenClass.cpp.o -std=c++11 -lfastcgi-daemon2 -pthread -lmongoclient -lboost_thread -lboost_system -lboost_regex -lboost_filesystem -o fcgi-zen.so

ZenClass.cpp.o: ZenClass.cpp
	gcc -fPIC -O -g ZenClass.cpp -c -o ZenClass.cpp.o -std=c++11

start: fcgi-app
	fastcgi-daemon2 --config=csimple.conf