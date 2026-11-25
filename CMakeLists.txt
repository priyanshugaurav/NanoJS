cmake_minimum_required(VERSION 3.10)
project(NanoJS)

set(CMAKE_CXX_STANDARD 17)

# Include directories
include_directories(include)

# Source files
file(GLOB_RECURSE SOURCES "src/*.cpp")

# Find CURL for HTTPS and fetch API
find_package(CURL)
if(CURL_FOUND)
    include_directories(${CURL_INCLUDE_DIRS})
    set(CURL_LIBS ${CURL_LIBRARIES})
    add_definitions(-DNANOJS_HAS_CURL=1)
else()
    set(CURL_LIBS "")
endif()

# Handle Windows Networking
if(WIN32)
    set(LIBS ws2_32 ${CURL_LIBS})
else()
    set(LIBS ${CURL_LIBS})
endif()

# Build
add_executable(nanojs ${SOURCES})
target_link_libraries(nanojs ${LIBS})
