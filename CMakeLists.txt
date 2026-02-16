cmake_minimum_required(VERSION 3.10)
project(NanoJS)

set(CMAKE_CXX_STANDARD 17)

# Include directories
include_directories(include)

# Source files
file(GLOB_RECURSE SOURCES "src/*.cpp")

# Handle Windows Networking
if(WIN32)
    set(LIBS ws2_32)
else()
    set(LIBS "")
endif()

# Build
add_executable(nanojs ${SOURCES})
target_link_libraries(nanojs ${LIBS})