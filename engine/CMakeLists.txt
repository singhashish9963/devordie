cmake_minimum_required(VERSION 3.10)
project(BattleSimulatorEngine)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SOURCES
    src/Map.cpp
    src/Unit.cpp
    src/Logic.cpp
    src/SimulationEngine.cpp
    src/API.cpp
)

# Header files
set(HEADERS
    include/Types.hpp
    include/Map.hpp
    include/Unit.hpp
    include/Logic.hpp
    include/SimulationEngine.hpp
    include/API.hpp
)

# Include directories
include_directories(include)

# Check if building for WebAssembly
if(EMSCRIPTEN)
    # WebAssembly build
    add_executable(battle_sim ${SOURCES} ${HEADERS})
    
    set_target_properties(battle_sim PROPERTIES
        LINK_FLAGS "-s WASM=1 -s EXPORTED_RUNTIME_METHODS='[\"cwrap\",\"ccall\"]' -s MODULARIZE=1 -s EXPORT_NAME='BattleSimulator' --no-entry"
    )
    
    # Output to wasm-build directory
    set_target_properties(battle_sim PROPERTIES
        RUNTIME_OUTPUT_DIRECTORY "${CMAKE_SOURCE_DIR}/wasm-build"
    )
else()
    # Native build
    add_executable(battle_sim ${SOURCES} ${HEADERS})
endif()
