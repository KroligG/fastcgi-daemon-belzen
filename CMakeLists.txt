cmake_minimum_required(VERSION 2.8.4)
project(fcgi_app)

set(MONGO_DRIVER_LIB /usr/local/lib)
set(MONGO_DRIVER_INCLUDE /usr/local/include)

include_directories(${MONGO_DRIVER_INCLUDE})
link_directories(${MONGO_DRIVER_LIB})

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -fPIC -lfastcgi-daemon2 -shared -pthread -lmongoclient -lboost_thread -lboost_system -lboost_regex")
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "~/ClionProjects/fcgi-app")
set(SOURCE_FILES ZenClass.cpp)

add_executable(fcgi_app ${SOURCE_FILES})

#maksim@maksim-N550JK:~/ClionProjects/fcgi-app$ gcc -fPIC -O -g ZenClass.cpp -c -o ZenClass.cpp.o -std=c++11
#maksim@maksim-N550JK:~/ClionProjects/fcgi-app$ gcc -shared ZenClass.cpp.o -std=c++11 -lfastcgi-daemon2 -pthread -lmongoclient -lboost_thread -lboost_system -lboost_regex -lboost_filesystem -o libcsimple.so
